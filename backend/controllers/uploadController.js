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

    console.log("File received:", {
      fieldname: req.file.fieldname,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      hasBuffer: !!req.file.buffer
    });

    const result = await uploadToCloudinary(req.file, "studentsociety/posts");

    res.status(200).json({
      success: true,
      message: "Post image uploaded successfully",
      url: result.secure_url
    });
  } catch (error) {
    console.error("Post Image Upload Error Details:", {
      message: error.message,
      stack: error.stack,
      cloudinaryError: error.http_code ? error : "Not a Cloudinary error"
    });
    // Never leak internal error.message to the client in any environment
    res.status(500).json({ 
      success: false, 
      message: "Server error during upload. Please try again."
    });
  }
};
