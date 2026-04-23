const Profile = require('../models/Profile');
const Connection = require('../models/Connection');
const User = require('../models/User');

// @desc    Get suggested users for the current user
// @route   GET /api/v1/match/suggested
// @access  Private
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
      const calculateTagScore = (myTags, targetTags, maxPoints, reasonLabel) => {
        if (!myTags?.length || !targetTags?.length) return 0;
        const common = myTags.filter(tag => targetTags.some(t => t.toLowerCase() === tag.toLowerCase()));
        if (common.length > 0) {
          reasons.push(...common);
          // (Shared / MyTotal) * maxPoints
          return (common.length / myTags.length) * maxPoints;
        }
        return 0;
      };

      // Skills match (30 pts)
      score += calculateTagScore(myProfile.skills, targetProfile.skills, 30, 'Skills');
      
      // Interests match (15 pts)
      score += calculateTagScore(myProfile.interests, targetProfile.interests, 15, 'Interests');

      // Goals match (15 pts)
      score += calculateTagScore(myProfile.goals, targetProfile.goals, 15, 'Goals');

      return {
        userId: targetProfile.userId._id,
        name: targetProfile.userId.name,
        field: targetProfile.field,
        skills: targetProfile.skills,
        bio: targetProfile.bio,
        avatar: targetProfile.avatar || null,
        matchScore: Math.round(score),
        matchReasons: [...new Set(reasons)], // Unique reasons
      };
    });

    // Sort by score descending
    suggestedMatches.sort((a, b) => b.matchScore - a.matchScore);

    res.json({
      success: true,
      data: suggestedMatches,
      meta: { count: suggestedMatches.length, timestamp: new Date().toISOString() }
    });

  } catch (err) {
    console.error('Match Controller Error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getSuggestedUsers };
