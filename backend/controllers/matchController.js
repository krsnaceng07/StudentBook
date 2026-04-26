const Profile = require('../models/Profile');
const Connection = require('../models/Connection');
const User = require('../models/User');
const Team = require('../models/Team');


// @desc    Get suggested users for the current user
// @route   GET /api/v1/match/suggested
const getSuggestedUsers = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    // 1. Get current user's profile
    const myProfile = await Profile.findOne({ userId: currentUserId });
    if (!myProfile) {
      return res.status(400).json({ success: false, message: 'Please set up your profile first' });
    }

    // 2. Find already connected or pending users
    const myConnections = await Connection.find({
      $or: [
        { requester: currentUserId },
        { recipient: currentUserId }
      ]
    });

    const excludedUserIds = [
      currentUserId,
      ...myConnections.map(c => c.requester.toString() === currentUserId.toString() ? c.recipient : c.requester)
    ];

    // 3. Find potential users (exclude self, connections, and banned users)
    const potentialUsers = await User.find({
      _id: { $nin: excludedUserIds },
      status: { $ne: 'banned' }
    });

    // 4. Fetch profiles for potential users
    const potentialProfiles = await Profile.find({
      userId: { $in: potentialUsers.map(u => u._id) }
    }).populate('userId', 'name username');

    // 5. Calculate scores
    const suggestedMatches = potentialProfiles.map(targetProfile => {
      let score = 0;
      const reasons = [];

      // Field match (40 pts)
      if (myProfile.field && targetProfile.field && myProfile.field.toLowerCase() === targetProfile.field.toLowerCase()) {
        score += 40;
        reasons.push(myProfile.field);
      }

      // Helper for tag-based matching
      const calculateTagScore = (myTags, targetTags, maxPoints) => {
        if (!myTags?.length || !targetTags?.length) return 0;
        const common = myTags.filter(tag => targetTags.some(t => t.toLowerCase() === tag.toLowerCase()));
        if (common.length > 0) {
          reasons.push(...common);
          return (common.length / myTags.length) * maxPoints;
        }
        return 0;
      };

      score += calculateTagScore(myProfile.skills, targetProfile.skills, 30);
      score += calculateTagScore(myProfile.interests, targetProfile.interests, 15);
      score += calculateTagScore(myProfile.goals, targetProfile.goals, 15);

      return {
        type: 'user',
        userId: targetProfile.userId._id,
        name: targetProfile.userId.name,
        username: targetProfile.userId.username,
        field: targetProfile.field,
        skills: targetProfile.skills,
        bio: targetProfile.bio,
        avatar: targetProfile.avatar || null,
        matchScore: Math.round(score),
        matchReasons: [...new Set(reasons)],
      };
    });

    suggestedMatches.sort((a, b) => b.matchScore - a.matchScore);

    res.json({
      success: true,
      data: suggestedMatches,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get smart unified suggestions (Users + Public Teams)
// @route   GET /api/v1/match/unified
const getUnifiedSuggestions = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const myProfile = await Profile.findOne({ userId: currentUserId });
    
    if (!myProfile) {
      return res.status(400).json({ success: false, message: 'Please set up your profile first' });
    }

    // 1. Get User Suggestions (Smart)
    const myConnections = await Connection.find({
      $or: [{ requester: currentUserId }, { recipient: currentUserId }]
    });
    const excludedUserIds = [
      currentUserId,
      ...myConnections.map(c => c.requester.toString() === currentUserId.toString() ? c.recipient : c.requester)
    ];

    const potentialUsers = await User.find({ _id: { $nin: excludedUserIds }, status: { $ne: 'banned' } });
    const potentialProfiles = await Profile.find({
      userId: { $in: potentialUsers.map(u => u._id) }
    }).populate('userId', 'name username');

    const userMatches = potentialProfiles.map(tp => {
      let score = 0;
      const reasons = [];
      const calc = (mt, tt, p) => {
        const common = mt?.filter(t => tt?.some(s => s.toLowerCase() === t.toLowerCase())) || [];
        if (common.length > 0) { reasons.push(...common); return (common.length / mt.length) * p; }
        return 0;
      };
      if (myProfile.field?.toLowerCase() === tp.field?.toLowerCase()) { score += 40; reasons.push(myProfile.field); }
      score += calc(myProfile.skills, tp.skills, 30);
      score += calc(myProfile.interests, tp.interests, 15);
      const commonSkills = myProfile.skills?.filter(s =>
        tp.skills?.some(ts => ts.toLowerCase() === s.toLowerCase())
      ) || [];
      const commonGoals = myProfile.goals?.filter(g =>
        tp.goals?.some(tg => tg.toLowerCase() === g.toLowerCase())
      ) || [];

      return {
        type: 'user',
        _id: `user-${tp.userId._id}`,
        userId: tp.userId._id,
        name: tp.userId.name,
        username: tp.userId.username,
        field: tp.field,
        headline: tp.headline || null,
        bio: tp.bio || null,
        avatar: tp.avatar || null,
        matchScore: Math.round(score),
        matchReasons: [...new Set(reasons)].slice(0, 3),
        reasons: [...new Set(reasons)].slice(0, 2),
        commonSkills,
        commonGoals,
      };
    }).filter(u => u.matchScore > 10).sort((a, b) => b.matchScore - a.matchScore).slice(0, 10);

    // 2. Get Public Team Suggestions (Smart)
    // Double exclusion:
    //   a) $elemMatch: user is in members array in any role (leader/admin/member)
    //   b) leader field: extra safety in case of data inconsistency
    const [publicTeams, myPendingRequests] = await Promise.all([
      Team.find({
        isPublic: true,
        leader: { $ne: currentUserId },                                  // exclude own teams
        members: { $not: { $elemMatch: { user: currentUserId } } }       // exclude joined teams
      }).populate('leader', 'name username'),

      // Fetch all pending join requests by this user so we can mark teams
      require('../models/TeamRequest').find({
        requester: currentUserId,
        status: 'pending'
      }).select('teamId').lean()
    ]);

    const pendingTeamIds = new Set(myPendingRequests.map(r => r.teamId.toString()));

    const teamMatches = publicTeams.map(team => {
      let score = 0;
      const reasons = [];
      
      // Category match
      if (myProfile.field && team.category && team.category.toLowerCase().includes(myProfile.field.toLowerCase())) {
        score += 30;
        reasons.push(team.category);
      }

      // Tag match
      const commonTags = team.tags?.filter(t => myProfile.skills?.some(s => s.toLowerCase() === t.toLowerCase())) || [];
      if (commonTags.length > 0) {
        score += (commonTags.length / (team.tags.length || 1)) * 50;
        reasons.push(...commonTags);
      }

      // Recruiting bonus
      if (team.status === 'Recruiting') score += 20;

      return {
        type: 'team',
        _id: `team-${team._id}`,
        teamId: team._id,
        name: team.name,
        category: team.category,
        avatar: team.avatar || null,
        memberCount: team.members.length,
        matchScore: Math.round(score),
        reasons: [...new Set(reasons)].slice(0, 2),
        hasPendingRequest: pendingTeamIds.has(team._id.toString())
      };
    }).filter(t => t.matchScore > 15).sort((a, b) => b.matchScore - a.matchScore).slice(0, 10);

    // 3. Merge and Shuffle (Interleave)
    const suggestions = [];
    const maxLen = Math.max(userMatches.length, teamMatches.length);
    for (let i = 0; i < maxLen; i++) {
      if (userMatches[i]) suggestions.push(userMatches[i]);
      if (teamMatches[i]) suggestions.push(teamMatches[i]);
    }

    res.json({ success: true, data: suggestions });
  } catch (err) {
    console.error('Unified Suggestions Error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getSuggestedUsers, getUnifiedSuggestions };
