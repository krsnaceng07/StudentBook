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

    // 3. Build Match Criteria
    const query = {
      userId: { $nin: excludedIds }
    };

    if (field) {
      query.field = { $regex: field, $options: 'i' };
    }

    if (skills) {
      const skillArray = Array.isArray(skills) ? skills : skills.split(',');
      query.skills = { $all: skillArray };
    }

    // 4. Aggregation for search by name + match score
    const aggregation = [
      { $match: query },
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

    // Search by name, username, bio, field or ID if provided
    if (search && search.trim()) {
      const trimmedSearch = search.trim();
      const searchRegex = { $regex: trimmedSearch, $options: 'i' };
      
      const orMatch = [
        { 'user.name': searchRegex },
        { 'user.username': searchRegex },
        { 'user.email': searchRegex },
        { bio: searchRegex },
        { field: searchRegex }
      ];

      // If search looks like a MongoDB ID, add it to the search criteria
      if (mongoose.Types.ObjectId.isValid(trimmedSearch)) {
        orMatch.push({ userId: new mongoose.Types.ObjectId(trimmedSearch) });
      }

      aggregation.push({
        $match: {
          $or: orMatch
        }
      });
    }

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

module.exports = { discoverUsers };
