const { supabaseAdmin } = require('../config/supabase');

const uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    res.json({ success: true, url: req.file.path || '' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const uploadPostImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    res.json({ success: true, url: req.file.path || '' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const uploadChatMedia = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    res.json({ success: true, url: req.file.path || '' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { uploadProfileImage, uploadPostImage, uploadChatMedia };
