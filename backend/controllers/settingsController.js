const User = require('../models/User');
const bcrypt = require('bcryptjs');

// @desc    Get user settings
// @route   GET /api/v1/settings
// @access  Private
const getSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('settings email name username');
    
    // Lazy initialize settings for legacy users
    if (!user.settings || !user.settings.notifications) {
      user.settings = {
        isPrivate: false,
        showEmail: false,
        showOnlineStatus: true,
        showMutualConnections: true,
        allowMessagesFrom: 'everyone',
        discoveryFieldFilter: 'all',
        notifications: {
          messages: true,
          connections: true,
          posts: true,
          teamRequests: true,
          mentions: true
        }
      };
      await user.save();
    }
    
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update user settings
// @route   PUT /api/v1/settings
// @access  Private
const updateSettings = async (req, res) => {
  try {
    const { 
      isPrivate, showEmail, showOnlineStatus, showMutualConnections, 
      allowMessagesFrom, discoveryFieldFilter, notifications 
    } = req.body;
    
    const user = await User.findById(req.user._id);
    
    if (!user.settings) user.settings = {};
    if (!user.settings.notifications) {
      user.settings.notifications = { 
        messages: true, connections: true, posts: true, 
        teamRequests: true, mentions: true 
      };
    }
    
    if (isPrivate !== undefined) user.settings.isPrivate = isPrivate;
    if (showEmail !== undefined) user.settings.showEmail = showEmail;
    if (showOnlineStatus !== undefined) user.settings.showOnlineStatus = showOnlineStatus;
    if (showMutualConnections !== undefined) user.settings.showMutualConnections = showMutualConnections;
    if (allowMessagesFrom !== undefined) user.settings.allowMessagesFrom = allowMessagesFrom;
    if (discoveryFieldFilter !== undefined) user.settings.discoveryFieldFilter = discoveryFieldFilter;
    
    if (notifications) {
      if (notifications.messages !== undefined) user.settings.notifications.messages = notifications.messages;
      if (notifications.connections !== undefined) user.settings.notifications.connections = notifications.connections;
      if (notifications.posts !== undefined) user.settings.notifications.posts = notifications.posts;
      if (notifications.teamRequests !== undefined) user.settings.notifications.teamRequests = notifications.teamRequests;
      if (notifications.mentions !== undefined) user.settings.notifications.mentions = notifications.mentions;
    }

    await user.save();
    res.json({ success: true, message: 'Settings updated', data: user.settings });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Change password
// @route   PUT /api/v1/settings/password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update email
// @route   PUT /api/v1/settings/email
// @access  Private
const updateEmail = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findById(req.user._id);

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Incorrect password' });
    }

    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ success: false, message: 'Email already in use' });
    }

    user.email = email;
    await user.save();

    res.json({ success: true, message: 'Email updated successfully', email: user.email });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete account (Soft Delete)
// @route   DELETE /api/v1/settings/account
// @access  Private
const deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;
    const user = await User.findById(req.user._id);

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Incorrect password' });
    }

    user.status = 'deleted';
    await user.save();

    res.json({ success: true, message: 'Account deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getSettings,
  updateSettings,
  changePassword,
  updateEmail,
  deleteAccount
};
