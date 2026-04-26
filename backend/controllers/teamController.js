const Team = require('../models/Team');
const TeamRequest = require('../models/TeamRequest');
const Conversation = require('../models/Conversation');
const User = require('../models/User');
const Profile = require('../models/Profile');
const { createNotification } = require('../utils/notificationHelper');

// Helper to enhance users with their profiles (avatars)
const enhanceUserWithProfile = async (user) => {
  if (!user) return null;
  const profile = await Profile.findOne({ userId: user._id });
  return {
    _id: user._id,
    name: user.name,
    username: user.username,
    avatar: profile?.avatar || null
  };
};

// @desc    Create a new team
// @route   POST /api/v1/teams
const createTeam = async (req, res) => {
  try {
    const xss = require('xss');
    let { name, description, tags, isPublic, category, lookingFor, status } = req.body;

    const team = await Team.create({
      name: xss(name || ''),
      description: xss(description || ''),
      tags: tags || [],
      category: category || 'Project',
      lookingFor: lookingFor || [],
      status: status || 'Recruiting',
      isPublic: isPublic !== undefined ? isPublic : true,
      leader: req.user._id,
      members: [{ user: req.user._id, role: 'leader' }]
    });

    const conversation = await Conversation.create({
      type: 'team',
      teamId: team._id,
      participants: [req.user._id]
    });

    team.conversationId = conversation._id;
    await team.save();

    if (global.io) {
      global.io.to(req.user._id.toString()).emit('team_joined', { teamId: team._id });
    }

    const populatedTeam = await Team.findById(team._id)
      .populate('leader', '_id name username')
      .populate('members.user', '_id name username');

    // Enhance with avatars
    const teamObj = populatedTeam.toObject();
    teamObj.leader = await enhanceUserWithProfile(populatedTeam.leader);
    teamObj.members = await Promise.all(
      populatedTeam.members.map(async (m) => {
        const mObj = m.toObject();
        return {
          ...mObj,
          user: await enhanceUserWithProfile(m.user)
        };
      })
    );

    res.status(201).json({ success: true, data: teamObj });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get all teams (with smart discovery)
// @route   GET /api/v1/teams
const getTeams = async (req, res) => {
  try {
    const { search, tag, category } = req.query;
    let query = {};

    if (search) {
      query.$text = { $search: search };
    }
    if (tag) {
      query.tags = tag;
    }
    if (category) {
      query.category = category;
    }

    // Security: Only show public teams OR teams where the user is a member
    query = {
      ...query,
      $or: [
        { isPublic: true },
        { 'members.user': req.user._id }
      ]
    };

    // Get current user profile for scoring
    const myProfile = await Profile.findOne({ userId: req.user._id });

    const teams = await Team.find(query)
      .populate('leader', 'name username')
      .populate('members.user', 'name');

    const enhancedTeams = await Promise.all(teams.map(async (team) => {
      const teamObj = team.toObject();
      teamObj.leader = await enhanceUserWithProfile(team.leader);
      
      // Basic Match Scoring
      let score = 0;
      const matchReasons = [];

      if (myProfile) {
        // Skill Match (Needed by team)
        if (team.lookingFor?.length > 0 && myProfile.skills?.length > 0) {
          const common = team.lookingFor.filter(s => 
            myProfile.skills.some(ms => ms.toLowerCase() === s.toLowerCase())
          );
          if (common.length > 0) {
            score += common.length * 20;
            matchReasons.push(`Need ${common[0]}`);
          }
        }

        // Recruiting Status Bonus
        if (team.status === 'Recruiting') {
          score += 30;
        }

        // Tag Similarity
        if (team.tags?.length > 0 && myProfile.skills?.length > 0) {
          const common = team.tags.filter(t => 
            myProfile.skills.some(ms => ms.toLowerCase() === t.toLowerCase())
          );
          if (common.length > 0) {
            score += 10;
          }
        }
      }

      teamObj.matchScore = Math.min(100, score);
      teamObj.matchReasons = matchReasons;

      // Membership flags — used by frontend to hide/show join buttons correctly
      const currentUserId = req.user._id.toString();
      teamObj.isLeader   = team.leader?._id?.toString() === currentUserId;
      teamObj.isMember   = team.members.some(m => m.user?._id?.toString() === currentUserId || m.user?.toString() === currentUserId);

      return teamObj;
    }));

    // Fetch this user's pending requests in one query to mark teams
    const pendingReqs = await TeamRequest.find({ requester: req.user._id, status: 'pending' }).select('teamId').lean();
    const pendingSet  = new Set(pendingReqs.map(r => r.teamId.toString()));

    enhancedTeams.forEach(t => {
      t.hasPendingRequest = pendingSet.has(t._id.toString());
    });

    // Sort by matchScore descending
    enhancedTeams.sort((a, b) => b.matchScore - a.matchScore);

    res.json({ success: true, data: enhancedTeams });
  } catch (err) {
    console.error('getTeams Error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get team by ID
// @route   GET /api/v1/teams/:id
const getTeamById = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('leader', '_id name username')
      .populate({
        path: 'members.user',
        select: '_id name username',
        options: { limit: 50 } // Security: Prevent mass extraction/DoS
      });

    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }

    // Auto-heal: Ensure older teams have a conversation
    if (!team.conversationId) {
      const participants = team.members.map(m => m.user._id || m.user);
      const conversation = await Conversation.create({
        type: 'team',
        teamId: team._id,
        participants: participants
      });
      team.conversationId = conversation._id;
      await team.save();
    }

    const pendingRequest = await TeamRequest.findOne({
      teamId: team._id,
      requester: req.user._id,
      status: 'pending'
    });

    const teamObj = team.toObject();
    teamObj.hasPendingRequest = !!pendingRequest;
    
    // Enhance members and leader with avatars
    teamObj.leader = await enhanceUserWithProfile(team.leader);
    teamObj.members = await Promise.all(
      team.members.map(async (m) => {
        const mObj = m.toObject();
        return {
          ...mObj,
          user: await enhanceUserWithProfile(m.user)
        };
      })
    );

    res.json({ success: true, data: teamObj });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Request to join a team
const requestJoinTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { message } = req.body;

    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ success: false, message: 'Team not found' });

    const isMember = team.members.some(m => m.user.toString() === req.user._id.toString());
    if (isMember) return res.status(400).json({ success: false, message: 'Already a member' });

    // Check for existing request
    const existingRequest = await TeamRequest.findOne({ teamId, requester: req.user._id });
    if (existingRequest) {
      if (existingRequest.status === 'pending') {
        return res.status(400).json({ success: false, message: 'Request already pending' });
      }
      if (existingRequest.status === 'accepted') {
        return res.status(400).json({ success: false, message: 'Already a member' });
      }
      // If rejected, allow re-application by resetting to pending
      existingRequest.status = 'pending';
      existingRequest.message = message || existingRequest.message;
      await existingRequest.save();
      return res.status(200).json({ success: true, message: 'Join request re-sent', data: existingRequest });
    }

    const request = await TeamRequest.create({
      teamId,
      requester: req.user._id,
      message
    });

    await createNotification({
      recipient: team.leader,
      sender: req.user._id,
      type: 'team_request',
      message: `requested to join your team: ${team.name}`,
      relatedId: request._id
    });

    res.status(201).json({ success: true, message: 'Join request sent', data: request });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Handle join request (Leader Only)
const handleJoinRequest = async (req, res) => {
  try {
    const { status } = req.body;
    const request = await TeamRequest.findById(req.params.requestId).populate('teamId');

    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });

    const leaderId = request.teamId?.leader?.toString();
    const userId = req.user?._id?.toString();

    if (!leaderId || !userId || leaderId !== userId) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    // Security: Only process if the request is still pending
    if (request.status !== 'pending') {
      return res.status(400).json({ success: false, message: `Request is already ${request.status}` });
    }

    request.status = status;
    await request.save();

    if (status === 'accepted') {
      // Use $addToSet to prevent duplicate memberships if called concurrently
      await Team.findByIdAndUpdate(request.teamId._id, {
        $addToSet: { members: { user: request.requester, role: 'member' } }
      });

      const conversation = await Conversation.findOne({ teamId: request.teamId._id });
      if (conversation) {
        if (!conversation.participants.includes(request.requester)) {
           conversation.participants.push(request.requester);
           await conversation.save();
        }
      }

      await createNotification({
        recipient: request.requester,
        sender: req.user._id,
        type: 'team_accepted',
        message: `accepted your request to join ${request.teamId.name}`,
        relatedId: request.teamId._id
      });
    }

    res.json({ success: true, message: `Request ${status}`, data: request });
  } catch (err) {
    console.error('Handle Join Request Error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get team requests for a team (Leader Only)
const getTeamRequests = async (req, res) => {
  try {
    const team = await Team.findById(req.params.teamId);
    if (!team) return res.status(404).json({ success: false, message: 'Team not found' });

    const leaderId = team.leader?.toString();
    const userId = req.user?._id?.toString();

    if (!leaderId || !userId || leaderId !== userId) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const requests = await TeamRequest.find({ teamId: team._id, status: 'pending' })
      .populate('requester', 'name username');

    const enhancedRequests = await Promise.all(requests.map(async (reqst) => {
      const reqstObj = reqst.toObject();
      reqstObj.requester = await enhanceUserWithProfile(reqst.requester);
      return reqstObj;
    }));

    res.json({ success: true, data: enhancedRequests });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update a team (Leader Only)
// @route   PUT /api/v1/teams/:id
const updateTeam = async (req, res) => {
  try {
    const { name, description, tags, avatar, isPublic, category, lookingFor, status } = req.body;
    let team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }

    // Authorization: Only leader can update
    if (team.leader.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this team' });
    }

    // Update fields
    const xss = require('xss');
    team.name = name !== undefined ? xss(name) : team.name;
    team.description = description !== undefined ? xss(description) : team.description;
    team.tags = tags || team.tags;
    team.avatar = avatar || team.avatar;
    team.category = category || team.category;
    team.lookingFor = lookingFor || team.lookingFor;
    team.status = status || team.status;
    if (isPublic !== undefined) team.isPublic = isPublic;

    await team.save();

    // Return enhanced team object
    const populatedTeam = await Team.findById(team._id)
      .populate('leader', '_id name username')
      .populate('members.user', '_id name username');

    const teamObj = populatedTeam.toObject();
    teamObj.leader = await enhanceUserWithProfile(populatedTeam.leader);
    teamObj.members = await Promise.all(
      populatedTeam.members.map(async (m) => {
        const mObj = m.toObject();
        return {
          ...mObj,
          user: await enhanceUserWithProfile(m.user)
        };
      })
    );

    res.json({ success: true, data: teamObj });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Manage team member (Promote, Demote, Remove)
// @route   PUT /api/v1/teams/:id/members/:userId
const manageTeamMember = async (req, res) => {
  try {
    const { action, role } = req.body; // 'promote', 'demote', 'remove'
    const teamId = req.params.id;
    const targetUserId = req.params.userId;
    const currentUserId = req.user._id.toString();

    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ success: false, message: 'Team not found' });

    const currentUserMember = team.members.find(m => m.user.toString() === currentUserId);
    if (!currentUserMember || (currentUserMember.role !== 'leader' && currentUserMember.role !== 'admin')) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const targetMemberIndex = team.members.findIndex(m => m.user.toString() === targetUserId);
    if (targetMemberIndex === -1) return res.status(404).json({ success: false, message: 'Member not found' });

    const targetMember = team.members[targetMemberIndex];

    // Business Logic Rules:
    // 1. Only leader can promote/demote admins or remove admins
    if (targetMember.role === 'admin' && currentUserMember.role !== 'leader') {
      return res.status(403).json({ success: false, message: 'Only team leader can manage admins' });
    }
    // 2. Leader cannot be removed (must transfer ownership or delete team)
    if (targetMember.role === 'leader') {
      return res.status(400).json({ success: false, message: 'Cannot remove the team leader' });
    }

    if (action === 'remove') {
      team.members.splice(targetMemberIndex, 1);
      // Remove from conversation too
      await Conversation.updateOne(
        { teamId: team._id },
        { $pull: { participants: targetUserId } }
      );
    } else if (action === 'update_role') {
      // Only leader can promote to admin or leader
      if (role === 'admin' || role === 'leader') {
        if (currentUserMember.role !== 'leader') {
          return res.status(403).json({ success: false, message: 'Only team leader can promote to admin' });
        }
      }
      
      if (role === 'leader') {
        // Ownership Transfer
        currentUserMember.role = 'admin';
        team.leader = targetUserId;
      }
      targetMember.role = role;
    }

    await team.save();
    res.json({ success: true, message: 'Member updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Leave a team
// @route   POST /api/v1/teams/:id/leave
const leaveTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ success: false, message: 'Team not found' });

    if (team.leader.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Leader cannot leave. Transfer ownership first.' });
    }

    team.members = team.members.filter(m => m.user.toString() !== req.user._id.toString());
    await team.save();

    // Remove from conversation
    await Conversation.updateOne(
      { teamId: team._id },
      { $pull: { participants: req.user._id } }
    );

    res.json({ success: true, message: 'Left team successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update team workspace links
// @route   PUT /api/v1/teams/:id/links
const updateTeamLinks = async (req, res) => {
  try {
    const { links } = req.body;
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ success: false, message: 'Team not found' });

    const member = team.members.find(m => m.user.toString() === req.user._id.toString());
    if (!member || (member.role !== 'leader' && member.role !== 'admin')) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    team.links = links;
    await team.save();
    res.json({ success: true, data: team.links });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete a team
// @route   DELETE /api/v1/teams/:id
const deleteTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ success: false, message: 'Team not found' });

    if (team.leader.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the leader can delete the team' });
    }

    // Cleanup: Delete team, requests, and conversation
    await TeamRequest.deleteMany({ teamId: team._id });
    await Conversation.deleteOne({ teamId: team._id });
    await Team.deleteOne({ _id: team._id });

    res.json({ success: true, message: 'Team deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Cancel a pending join request (requester only)
// @route   DELETE /api/v1/teams/:teamId/request
const cancelJoinRequest = async (req, res) => {
  try {
    const { teamId } = req.params;

    const request = await TeamRequest.findOneAndDelete({
      teamId,
      requester: req.user._id,
      status: 'pending'           // can only cancel if still pending
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'No pending request found for this team'
      });
    }

    res.json({ success: true, message: 'Join request cancelled' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  createTeam,
  getTeams,
  getTeamById,
  updateTeam,
  requestJoinTeam,
  cancelJoinRequest,
  handleJoinRequest,
  getTeamRequests,
  manageTeamMember,
  leaveTeam,
  updateTeamLinks,
  deleteTeam
};

