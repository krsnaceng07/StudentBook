const User = require('../models/User');
const Profile = require('../models/Profile');
const jwt = require('jsonwebtoken');
const Joi = require('joi');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  });
};

const registerSchema = Joi.object({
  name: Joi.string().required().messages({
    'string.empty': 'Please enter your full name',
    'any.required': 'Full name is required'
  }),
  username: Joi.string().alphanum().min(3).max(30).required().messages({
    'string.empty': 'Please choose a username',
    'string.min': 'Username must be at least 3 characters',
    'string.alphanum': 'Username can only contain letters and numbers',
    'any.required': 'Username is required'
  }),
  email: Joi.string().email().required().messages({
    'string.empty': 'Email address cannot be empty',
    'string.email': 'Please enter a valid email address',
    'any.required': 'Email is required'
  }),
  password: Joi.string().min(6).required().messages({
    'string.empty': 'Please enter a password',
    'string.min': 'Password must be at least 6 characters',
    'any.required': 'Password is required'
  }),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.empty': 'Email is required to log in',
    'string.email': 'Please check your email format',
  }),
  password: Joi.string().required().messages({
    'string.empty': 'Please enter your password',
  }),
});

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  const { error } = registerSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { name, username, email, password } = req.body;

  try {
    const userExists = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
 
    if (userExists) {
      const field = userExists.email === email ? 'Email' : 'Username';
      return res.status(400).json({ message: `${field} already exists` });
    }

    const user = await User.create({
      name,
      username,
      email,
      password,
    });

    // Automatically create a blank profile for the new user
    await Profile.create({
      userId: user._id,
      bio: '',
      field: 'Student'
    });

    if (user) {
      res.status(201).json({
        success: true,
        message: 'Registration successful. Please log in.',
        meta: { timestamp: new Date().toISOString() }
      });
    } else {
      res.status(400).json({ success: false, message: 'Invalid user data' });
    }
  } catch (err) {
    console.error(`[Auth Error] Registration failed for ${email}:`, err);
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  const { error } = loginSchema.validate(req.body);
  if (error) {
     return res.status(400).json({ message: error.details[0].message });
  }

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      if (user.status === 'banned') {
          return res.status(403).json({ success: false, message: 'User is banned' });
      }

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          token: generateToken(user._id),
          user: {
            id: user._id,
            name: user.name,
            username: user.username,
            email: user.email,
            role: user.role,
            status: user.status
          }
        },
        meta: { timestamp: new Date().toISOString() }
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
  } catch (err) {
    console.error(`[Auth Error] Login failed for ${email}:`, err);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
};

// @desc    Get current logged in user
// @route   GET /api/v1/auth/me
// @access  Private
const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.status(200).json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    username: user.username,
                    email: user.email,
                }
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = { registerUser, loginUser, getMe };
