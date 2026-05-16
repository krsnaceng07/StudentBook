const { supabaseAdmin } = require('../config/supabase');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  res.status(400).json({ 
    success: false, 
    message: 'Backend registration is disabled. Please use the Supabase SDK on the client.' 
  });
};

// @desc    Auth with Firebase (Google/Apple) -> Now Supabase
// @route   POST /api/v1/auth/firebase
// @access  Public
const firebaseLogin = async (req, res) => {
  res.status(400).json({ 
    success: false, 
    message: 'Firebase login is obsolete. Please use Supabase SDK on the client for social logins.' 
  });
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  res.status(400).json({ 
    success: false, 
    message: 'Backend login is disabled. Please use the Supabase SDK on the client.' 
  });
};

// @desc    Get current logged in user
// @route   GET /api/v1/auth/me
// @access  Private
const getMe = async (req, res) => {
    try {
        // req.user is populated by protect middleware from public.profiles
        res.status(200).json({
            success: true,
            data: {
                user: req.user
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Forgot password
// @route   POST /api/v1/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  res.status(400).json({ 
    success: false, 
    message: 'Please use Supabase SDK on the client for password resets.' 
  });
};

// @desc    Reset password
// @route   POST /api/v1/auth/reset-password/:token
// @access  Public
const resetPassword = async (req, res) => {
  res.status(400).json({ 
    success: false, 
    message: 'Please use Supabase SDK on the client for password resets.' 
  });
};

// @desc    Logout user / Invalidate tokens
// @route   POST /api/v1/auth/logout
// @access  Private
const logoutUser = async (req, res) => {
  res.json({ success: true, message: 'Logged out successfully on backend. Ensure you call supabase.auth.signOut() on client.' });
};

module.exports = { registerUser, loginUser, getMe, forgotPassword, resetPassword, firebaseLogin, logoutUser };
