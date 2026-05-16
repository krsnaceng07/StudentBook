const { supabaseAdmin } = require('../config/supabase');
const Joi = require('joi');

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

  const updates = { ...req.body, updated_at: new Date().toISOString() };
  
  // Convert camelCase to snake_case for Supabase
  if (updates.experienceLevel) {
    updates.experience_level = updates.experienceLevel;
    delete updates.experienceLevel;
  }

  try {
    // Handling username uniqueness
    if (updates.username) {
      const { data: existingUser } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('username', updates.username)
        .neq('id', req.user.id)
        .single();
        
      if (existingUser) {
        return res.status(400).json({ message: 'Username is already taken' });
      }
    }

    const { data: profile, error: upsertError } = await supabaseAdmin
      .from('profiles')
      .update(updates)
      .eq('id', req.user.id)
      .select()
      .single();

    if (upsertError) throw upsertError;

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: profile,
      meta: { timestamp: new Date().toISOString() }
    });
  } catch (err) {
    console.error('Profile Update Error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get current user profile
// @route   GET /api/profiles/me
// @access  Private
const getMyProfile = async (req, res) => {
  try {
    // req.user is already populated by authMiddleware
    res.json({
      success: true,
      message: 'Profile retrieved successfully',
      data: req.user,
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
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', req.params.userId)
      .single();
    
    if (error || !profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    const isOwner = req.user && req.user.id === profile.id;
    const isPrivate = profile.is_private;

    // Privacy Logic
    if (isPrivate && !isOwner) {
      if (!req.user) {
        return res.status(403).json({ 
          success: false, 
          message: 'This profile is private. Please log in to view it.',
          isPrivate: true
        });
      }

      // Check connections
      const { data: connection } = await supabaseAdmin
        .from('connections')
        .select('*')
        .or(`and(user1_id.eq.${req.user.id},user2_id.eq.${profile.id}),and(user1_id.eq.${profile.id},user2_id.eq.${req.user.id})`)
        .eq('status', 'accepted')
        .single();

      if (!connection) {
        return res.status(403).json({ 
          success: false, 
          message: 'This profile is private. You must be connected to view it.',
          isPrivate: true
        });
      }
    }
    
    if (!isOwner && !profile.show_email) {
      delete profile.email;
    }

    // Smart Insights omitted for brevity, can be re-added as needed.

    res.json({
      success: true,
      message: 'Profile retrieved successfully',
      data: profile,
      meta: { timestamp: new Date().toISOString() }
    });
  } catch (err) {
    console.error('Get Profile Error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { createOrUpdateProfile, getMyProfile, getProfileByUserId };
