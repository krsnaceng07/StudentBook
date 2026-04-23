const Profile = require('../models/Profile');
const Joi = require('joi');

const profileSchema = Joi.object({
  bio: Joi.string().max(500).allow('').messages({
    'string.max': 'Bio is too long (limit 500 characters)'
  }),
  field: Joi.string().allow(''),
  skills: Joi.array().items(Joi.string()),
  interests: Joi.array().items(Joi.string()),
  goals: Joi.array().items(Joi.string()),
  avatar: Joi.string().allow(''),
  username: Joi.string().alphanum().min(3).max(30).messages({
    'string.min': 'Username must be at least 3 characters',
    'string.alphanum': 'Username can only contain letters and numbers'
  }),
});

// @desc    Create or update user profile
// @route   POST /api/profiles
// @access  Private
const createOrUpdateProfile = async (req, res) => {
  const { error } = profileSchema.validate(req.body);
  if (error) {
     return res.status(400).json({ message: error.details[0].message });
  }

  const { bio, field, skills, interests, goals, avatar, username } = req.body;
  const User = require('../models/User');

  try {
    // Handling username migration/update if provided
    if (username && !req.user.username) {
      const usernameExists = await User.findOne({ username });
      if (usernameExists) {
        return res.status(400).json({ message: 'Username is already taken' });
      }
      const user = await User.findById(req.user._id);
      user.username = username;
      await user.save();
    }

    let profile = await Profile.findOne({ userId: req.user._id });

    if (profile) {
      // Update
      profile.bio = bio !== undefined ? bio : profile.bio;
      profile.field = field !== undefined ? field : profile.field;
      profile.skills = skills !== undefined ? skills : profile.skills;
      profile.interests = interests !== undefined ? interests : profile.interests;
      profile.goals = goals !== undefined ? goals : profile.goals;
      profile.avatar = avatar !== undefined ? avatar : profile.avatar;
      await profile.save();
    } else {
      // Create
      profile = await Profile.create({
        userId: req.user._id,
        bio,
        field,
        skills,
        interests,
        goals,
        avatar,
      });
    }

    await profile.populate('userId', ['name', 'username', 'email']);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: profile,
      meta: { timestamp: new Date().toISOString() }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get current user profile
// @route   GET /api/profiles/me
// @access  Private
const getMyProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.user._id }).populate('userId', ['name', 'username', 'email']);
    if (!profile) {
      return res.status(200).json({ success: true, data: null, message: 'No profile setup yet' });
    }
    res.json({
      success: true,
      message: 'Profile retrieved successfully',
      data: profile,
      meta: { timestamp: new Date().toISOString() }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get profile by user ID
// @route   GET /api/profiles/user/:userId
// @access  Public
const getProfileByUserId = async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.params.userId }).populate('userId', ['name', 'username']);
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }
    res.json({
      success: true,
      message: 'Profile retrieved successfully',
      data: profile,
      meta: { timestamp: new Date().toISOString() }
    });
  } catch (err) {
    if (err.kind == 'ObjectId') {
        return res.status(404).json({ success: false, message: 'Profile not found' });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { createOrUpdateProfile, getMyProfile, getProfileByUserId };
