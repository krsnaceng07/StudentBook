const User = require('../models/User');
const Profile = require('../models/Profile');
const Team = require('../models/Team');
const Post = require('../models/Post');

// @desc    Unified Smart Search for Users, Teams, and Posts
// @route   GET /api/v1/search/unified
const unifiedSearch = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) {
      return res.json({ success: true, data: { users: [], teams: [], posts: [] } });
    }

    const searchRegex = new RegExp(q, 'i');

    // 1. Search Users (Smart Ranking)
    const profiles = await Profile.aggregate([
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
            { 'user.name': searchRegex },
            { 'user.username': searchRegex },
            { headline: searchRegex },
            { skills: { $in: [searchRegex] } }
          ]
        }
      },
      { $limit: 5 },
      {
        $project: {
          userId: 1,
          name: '$user.name',
          username: '$user.username',
          avatar: 1,
          headline: 1,
          field: 1
        }
      }
    ]);

    // 2. Search Teams
    const teams = await Team.find({
      $or: [
        { name: searchRegex },
        { description: searchRegex },
        { tags: { $in: [searchRegex] } }
      ]
    })
    .limit(5)
    .populate('leader', 'name username')
    .lean();

    // 3. Search Posts (Content & Tags)
    const posts = await Post.find({
      $or: [
        { content: searchRegex },
        { tags: { $in: [searchRegex] } }
      ],
      status: { $ne: 'deleted' }
    })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('authorId', 'name username')
    .lean();

    // 4. Enrich Posts with author details and avatars
    const enrichedPosts = await Promise.all(posts.map(async (p) => {
      const profile = await Profile.findOne({ userId: p.authorId?._id }).select('avatar');
      return {
        ...p,
        author: {
          _id: p.authorId?._id,
          name: p.authorId?.name || 'Unknown',
          username: p.authorId?.username || 'user',
          avatar: profile?.avatar || null
        }
      };
    }));

    res.json({
      success: true,
      data: {
        users: profiles,
        teams: teams.map(t => ({
          ...t,
          leaderName: t.leader?.name
        })),
        posts: enrichedPosts
      }
    });
  } catch (err) {
    console.error('Unified Search Error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { unifiedSearch };
