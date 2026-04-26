const Profile = require('../models/Profile');
const Joi = require('joi');
const xss = require('xss');

const profileSchema = Joi.object({
  bio: Joi.string().max(500).allow('').messages({
    'string.max': 'Bio is too long (limit 500 characters)'
  }),
  headline: Joi.string().max(100).allow(''),
  experienceLevel: Joi.string().valid('Beginner', 'Intermediate', 'Advanced', 'Professional').allow(''),
  availability: Joi.string().valid('Open for Projects', 'Collaborating', 'Looking for Team', 'Busy').allow(''),
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

  const { 
    bio, field, skills, interests, goals, avatar, username,
    headline, experienceLevel, availability 
  } = req.body;
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
      profile.bio = bio !== undefined ? xss(bio) : profile.bio;
      profile.headline = headline !== undefined ? xss(headline) : (profile.headline || 'Student');
      profile.experienceLevel = experienceLevel !== undefined ? experienceLevel : (profile.experienceLevel || 'Beginner');
      profile.availability = availability !== undefined ? availability : (profile.availability || 'Open for Projects');
      profile.field = field !== undefined ? xss(field) : profile.field;
      profile.skills = skills !== undefined ? skills : profile.skills;
      profile.interests = interests !== undefined ? interests : profile.interests;
      profile.goals = goals !== undefined ? goals : profile.goals;
      profile.avatar = avatar !== undefined ? avatar : profile.avatar;
      await profile.save();
    } else {
      // Create
      profile = await Profile.create({
        userId: req.user._id,
        bio: xss(bio || ''),
        headline: xss(headline || 'Student'),
        experienceLevel: experienceLevel || 'Beginner',
        availability: availability || 'Open for Projects',
        field: xss(field || ''),
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
    const profile = await Profile.findOne({ userId: req.params.userId })
      .populate('userId', ['name', 'username', 'email', 'settings.isPrivate', 'updatedAt']);
    
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    // Convert to object to handle privacy
    const profileData = profile.toObject();
    
    // Privacy Logic: Hide email if setting is OFF AND viewer is not the owner
    // Note: We already check showEmail in the DB model settings, but for legacy support 
    // we fetch and then prune if necessary. Better: fetch only if allowed.
    
    const isOwner = req.user && req.user._id.toString() === profile.userId._id.toString();
    
    // For now, keep the prune logic but clean up the user object
    if (profileData.userId) {
       if (!isOwner) delete profileData.userId.email;
    }

    // 🏆 SMART INSIGHTS LOGIC
    if (!isOwner && req.user) {
      const myProfile = await Profile.findOne({ userId: req.user._id });
      const Connection = require('../models/Connection');

      if (myProfile) {
        let score = 0;
        const commonSkills = [];
        const commonGoals = [];
        const matchReasons = [];

        // 1. Field Match (40 pts)
        if (myProfile.field && profile.field && myProfile.field.toLowerCase() === profile.field.toLowerCase()) {
          score += 40;
          matchReasons.push(`Both in ${profile.field}`);
        }

        // 2. Skills Overlap (30 pts)
        if (myProfile.skills?.length && profile.skills?.length) {
          const common = profile.skills.filter(s => 
            myProfile.skills.some(ms => ms.toLowerCase() === s.toLowerCase())
          );
          if (common.length > 0) {
            commonSkills.push(...common);
            score += Math.min(30, (common.length / 3) * 30);
          }
        }

        // 3. Goals Match (20 pts)
        if (myProfile.goals?.length && profile.goals?.length) {
          const common = profile.goals.filter(g => 
            myProfile.goals.some(mg => mg.toLowerCase() === g.toLowerCase())
          );
          if (common.length > 0) {
            commonGoals.push(...common);
            score += 20;
          }
        }

        // 4. Mutual Connections
        const myConns = await Connection.find({
          $or: [{ requester: req.user._id }, { recipient: req.user._id }],
          status: 'accepted'
        });
        const myConnIds = myConns.map(c => c.requester.toString() === req.user._id.toString() ? c.recipient.toString() : c.requester.toString());

        const theirConns = await Connection.find({
          $or: [{ requester: req.params.userId }, { recipient: req.params.userId }],
          status: 'accepted'
        });
        const theirConnIds = theirConns.map(c => c.requester.toString() === req.params.userId.toString() ? c.recipient.toString() : c.requester.toString());

        const mutuals = myConnIds.filter(id => theirConnIds.includes(id));
        
        profileData.smartInsights = {
          matchScore: Math.round(Math.min(100, score + (mutuals.length * 5))),
          commonSkills: [...new Set(commonSkills)],
          commonGoals: [...new Set(commonGoals)],
          matchReasons,
          mutualCount: mutuals.length
        };
      }
    }

    res.json({
      success: true,
      message: 'Profile retrieved successfully',
      data: profileData,
      meta: { timestamp: new Date().toISOString() }
    });
  } catch (err) {
    console.error('Get Profile Error:', err);
    if (err.kind == 'ObjectId') {
        return res.status(404).json({ success: false, message: 'Profile not found' });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { createOrUpdateProfile, getMyProfile, getProfileByUserId };
