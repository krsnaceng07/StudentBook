const { uploadToCloudinary } = require('../utils/upload');
const Profile = require('../models/Profile');

exports.uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const result = await uploadToCloudinary(req.file, "studentsociety/avatars");
    
    const profile = await Profile.findOneAndUpdate(
      { userId: req.user.id },
      { avatar: result.secure_url },
      { new: true, upsert: true }
    );

    res.status(200).json({
      success: true,
      message: "Profile image uploaded successfully",
      url: result.secure_url,
      profile
    });
  } catch (error) {
    console.error("Profile Upload Error:", error);
    res.status(500).json({ success: false, message: "Server error during upload" });
  }
};

exports.uploadPostImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const result = await uploadToCloudinary(req.file, "studentsociety/posts");

    res.status(200).json({
      success: true,
      message: "Post image uploaded successfully",
      url: result.secure_url
    });
  } catch (error) {
    console.error("Post Image Upload Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error during upload. Please try again."
    });
  }
};

exports.uploadChatMedia = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const isImage = req.file.mimetype.startsWith('image/');
    const isPDF = req.file.mimetype === 'application/pdf';

    if (!isImage && !isPDF) {
      return res.status(400).json({ success: false, message: "Only images and PDFs are allowed" });
    }

    const folder = isImage ? "studentsociety/chat/images" : "studentsociety/chat/docs";
    const result = await uploadToCloudinary(req.file, folder);

    res.status(200).json({
      success: true,
      url: result.secure_url,
      type: isImage ? 'image' : 'pdf',
      name: req.file.originalname,
      size: req.file.size
    });
  } catch (error) {
    console.error("Chat Media Upload Error:", error);
    res.status(500).json({ success: false, message: "Server error during upload" });
  }
};
