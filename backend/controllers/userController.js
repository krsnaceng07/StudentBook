const User = require('../models/User');
const Profile = require('../models/Profile');
const Connection = require('../models/Connection');
const mongoose = require('mongoose');

// @desc    Discover users with advanced filters and matching
// @route   GET /api/v1/users/discover
// @access  Private
const discoverUsers = async (req, res) => {
  try {
    const page = Math.min(parseInt(req.query.page) || 1, 100);
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const skip = (page - 1) * limit;

    const { search, field, skills } = req.query;
    const currentUserId = new mongoose.Types.ObjectId(req.user._id);

    // 1. Get current user's data for matching
    const me = await User.findById(currentUserId).select('settings');
    const myProfile = await Profile.findOne({ userId: currentUserId });
    const discoveryFilter = me?.settings?.discoveryFieldFilter || 'all';

    // 2. Find connection IDs to exclude
    const existingConnections = await Connection.find({
      $or: [{ requester: currentUserId }, { recipient: currentUserId }],
      status: { $in: ['accepted', 'pending'] }
    });

    const excludedIds = [
      currentUserId,
      ...existingConnections.map(c => 
        c.requester.toString() === currentUserId.toString() ? c.recipient : c.requester
      )
    ];

    // 3. Accepted connection IDs for mutual check
    const myConnIds = existingConnections
      .filter(c => c.status === 'accepted')
      .map(c => c.requester.toString() === currentUserId.toString() ? c.recipient : c.requester);

    // 4. Advanced Aggregation Pipeline
    const pipeline = [
      { $match: { userId: { $nin: excludedIds } } }
    ];

    // Apply Discovery Field Filter
    if (discoveryFilter === 'same_field' && myProfile?.field) {
      const escapedField = myProfile.field.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      pipeline.push({ $match: { field: { $regex: new RegExp(`^${escapedField}$`, 'i') } } });
    }

    // Join with User model
    pipeline.push({
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'user'
      }
    }, { $unwind: '$user' });

    // Global Search / Filters
    if (search && typeof search === 'string' && search.trim()) {
      const escapedSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const searchRegex = new RegExp(escapedSearch, 'i');
      pipeline.push({
        $match: {
          $or: [
            { 'user.name': searchRegex },
            { 'user.username': searchRegex },
            { headline: searchRegex },
            { skills: { $in: [searchRegex] } }
          ]
        }
      });
    }

    if (field && typeof field === 'string') {
      const escapedField = field.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      pipeline.push({ $match: { field: { $regex: escapedField, $options: 'i' } } });
    }
    
    if (skills) {
      const skillArray = Array.isArray(skills) ? skills : [skills];
      const sanitizedSkills = skillArray
        .filter(s => typeof s === 'string')
        .map(s => new RegExp(s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'));
        
      if (sanitizedSkills.length > 0) {
        pipeline.push({ $match: { skills: { $in: sanitizedSkills } } });
      }
    }

    // Calculate Mutuals using $lookup on the fly
    pipeline.push({
      $lookup: {
        from: 'connections',
        let: { theirId: '$userId' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$status', 'accepted'] },
                  {
                    $or: [
                      { $eq: ['$requester', '$$theirId'] },
                      { $eq: ['$recipient', '$$theirId'] }
                    ]
                  }
                ]
              }
            }
          }
        ],
        as: 'theirConns'
      }
    });

    // Formatting & Scoring Projection
    pipeline.push({
      $project: {
        userId: 1,
        avatar: 1,
        field: 1,
        headline: 1,
        skills: 1,
        goals: 1,
        experienceLevel: 1,
        availability: 1,
        name: '$user.name',
        username: '$user.username',
        updatedAt: { $ifNull: ['$user.updatedAt', '$updatedAt'] },
        mutualCount: {
          $size: {
            $filter: {
              input: '$theirConns',
              as: 'conn',
              cond: {
                $or: [
                  { $in: ['$$conn.requester', myConnIds] },
                  { $in: ['$$conn.recipient', myConnIds] }
                ]
              }
            }
          }
        }
      }
    });

    const results = await Profile.aggregate(pipeline);

    // Final sorting and detailed reasons (JS side for complex logic)
    const enhancedUsers = results.map(u => {
      let score = 0;
      const reasons = [];
      
      const commonSkills = u.skills?.filter(s => 
        myProfile?.skills?.some(ms => ms.toLowerCase() === s.toLowerCase())
      ) || [];

      const commonGoals = u.goals?.filter(g => 
        myProfile?.goals?.some(mg => mg.toLowerCase() === g.toLowerCase())
      ) || [];

      if (myProfile) {
        if (u.field && myProfile.field?.toLowerCase() === u.field.toLowerCase()) {
          score += 40;
          reasons.push(`Same field: ${u.field}`);
        }
        
        if (commonSkills.length > 0) {
          score += Math.min(30, commonSkills.length * 10);
          reasons.push(`${commonSkills.length} matching skills`);
        }

        if (commonGoals.length > 0) {
          score += Math.min(20, commonGoals.length * 5);
          reasons.push(`${commonGoals.length} shared goals`);
        }

        if (u.mutualCount > 0) {
          score += Math.min(20, u.mutualCount * 5);
          reasons.push(`${u.mutualCount} mutual connections`);
        }
      }

      return {
        ...u,
        commonSkills,
        commonGoals,
        matchScore: Math.min(100, score),
        matchReasons: reasons,
        collabPotential: score > 60
      };
    }).sort((a, b) => b.matchScore - a.matchScore);

    const total = enhancedUsers.length;
    const paginatedUsers = enhancedUsers.slice(skip, skip + limit);

    res.json({
      success: true,
      data: {
        users: paginatedUsers,
        pagination: { page, limit, total }
      }
    });
  } catch (err) {
    console.error('Discover Error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.json({ success: true, data: { users: [] } });
    }

    if (typeof q !== 'string') {
      return res.status(400).json({ success: false, message: 'Invalid search query' });
    }

    const escapedQ = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const searchRegex = { $regex: escapedQ, $options: 'i' };

    // 1. Find users by name/username
    const users = await User.find({
      $or: [
        { name: searchRegex },
        { username: searchRegex }
      ],
      status: { $ne: 'banned' }
    })
    .select('name username avatar')
    .limit(10)
    .lean();

    // 2. Fetch profiles for these users to get field and avatar (if stored in profile)
    const userIds = users.map(u => u._id);
    const profiles = await Profile.find({ userId: { $in: userIds } }).lean();

    // 3. Merge data
    const results = users.map(user => {
      const profile = profiles.find(p => p.userId.toString() === user._id.toString());
      return {
        userId: user._id,
        name: user.name,
        username: user.username,
        avatar: profile?.avatar || null,
        field: profile?.field || null
      };
    });

    res.json({
      success: true,
      data: {
        users: results
      }
    });
  } catch (err) {
    console.error('Search Error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { discoverUsers, searchUsers };
