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

    const mime = req.file.mimetype;
    let type = 'doc';
    let folder = "studentsociety/chat/docs";

    if (mime.startsWith('image/')) {
      type = 'image';
      folder = "studentsociety/chat/images";
    } else if (mime.startsWith('video/')) {
      type = 'video';
      folder = "studentsociety/chat/videos";
    } else if (mime === 'application/pdf') {
      type = 'pdf';
    }

    const result = await uploadToCloudinary(req.file, folder);

    res.status(200).json({
      success: true,
      url: result.secure_url,
      type: type,
      name: req.file.originalname,
      size: req.file.size
    });
  } catch (error) {
    console.error("Chat Media Upload Error:", error);
    res.status(500).json({ success: false, message: "Server error during upload" });
  }
};
