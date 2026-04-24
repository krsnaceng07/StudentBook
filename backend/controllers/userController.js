const User = require('../models/User');
const Profile = require('../models/Profile');
const Connection = require('../models/Connection');
const mongoose = require('mongoose');

// @desc    Discover users with advanced filters and matching
// @route   GET /api/v1/users/discover
// @access  Private
const discoverUsers = async (req, res) => {
  try {
    const page = Math.min(parseInt(req.query.page) || 1, 100);  // Cap page at 100
    const limit = Math.min(parseInt(req.query.limit) || 10, 50); // Cap limit at 50 to prevent DoS
    const skip = (page - 1) * limit;

    const { search, field, skills } = req.query;
    const currentUserId = req.user._id;

    // 1. Get current user's profile for match scoring
    const myProfile = await Profile.findOne({ userId: currentUserId });

    // 2. Find connection IDs to exclude (only accepted or pending)
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

    // 3. Build Query
    const query = {
      userId: { $nin: excludedIds }
    };

    // 4. Aggregation Pipeline
    const aggregation = [
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      { 
        $match: { 
          $or: [
            { 'user.status': 'active' },
            { 'user.status': { $exists: false } }
          ]
        } 
      }
    ];

    // Combine all filters into a single match logic
    const matchStages = [query];

    if (field) {
      matchStages.push({ field: { $regex: field, $options: 'i' } });
    }

    if (skills) {
      const skillArray = Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim()).filter(Boolean);
      if (skillArray.length > 0) {
        matchStages.push({ skills: { $in: skillArray } }); // Use $in for better discovery
      }
    }

    if (search && search.trim()) {
      const trimmedSearch = search.trim();
      const searchRegex = { $regex: trimmedSearch, $options: 'i' };
      
      const orMatch = [
        { 'user.name': searchRegex },
        { 'user.username': searchRegex },
        { 'user.email': searchRegex },
        { bio: searchRegex },
        { field: searchRegex },
        { skills: { $in: [new RegExp(trimmedSearch, 'i')] } }
      ];

      if (mongoose.Types.ObjectId.isValid(trimmedSearch)) {
        orMatch.push({ userId: new mongoose.Types.ObjectId(trimmedSearch) });
      }

      matchStages.push({ $or: orMatch });
    }

    // Apply all match stages
    matchStages.forEach(stage => {
      aggregation.push({ $match: stage });
    });

    // execute query for total count
    const totalResults = await Profile.aggregate([...aggregation, { $count: 'total' }]);
    const total = totalResults[0]?.total || 0;

    // Execution with pagination
    const profiles = await Profile.aggregate([
      ...aggregation,
      { $skip: skip },
      { $limit: limit }
    ]);

    // 5. Calculate match scores and format response
    const users = profiles.map(profile => {
      let score = 0;
      const reasons = [];

      if (myProfile) {
        // Field (40)
        if (myProfile.field && profile.field && myProfile.field.toLowerCase() === profile.field.toLowerCase()) {
          score += 40;
          reasons.push(profile.field);
        }

        const calculateSimilarity = (myArr, targetArr, maxPts) => {
          if (!myArr?.length || !targetArr?.length) return 0;
          const common = myArr.filter(t => targetArr.some(tt => tt.toLowerCase() === t.toLowerCase()));
          if (common.length > 0) {
             reasons.push(...common);
             return (common.length / myArr.length) * maxPts;
          }
          return 0;
        };

        score += calculateSimilarity(myProfile.skills, profile.skills, 30);
        score += calculateSimilarity(myProfile.interests, profile.interests, 15);
        score += calculateSimilarity(myProfile.goals, profile.goals, 15);
      }

      return {
        userId: profile.userId,
        name: profile.user.name,
        username: profile.user.username,
        field: profile.field,
        skills: profile.skills,
        avatar: profile.avatar || null,
        matchScore: Math.round(score),
        matchReasons: [...new Set(reasons)]
      };
    });

    res.json({
      success: true,
      message: 'Users retrieved',
      data: {
        users,
        pagination: {
          page,
          limit,
          total
        }
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

    const searchRegex = { $regex: q, $options: 'i' };

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
