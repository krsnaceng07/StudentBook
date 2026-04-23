const multer = require('multer');
const cloudinary = require('../config/cloudinary');

const storage = multer.memoryStorage();

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed!'), false);
    }
  }
});

/**
 * Uploads a file buffer to Cloudinary using Base64.
 * This is more robust than streaming in some Node environments.
 */
const uploadToCloudinary = async (file, folder = "studentsociety") => {
  try {
    if (!file.buffer) {
      throw new Error("No file buffer found. Multer memoryStorage may not be working correctly.");
    }

    // Convert buffer to base64
    const base64Image = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;

    // Upload to cloudinary
    const result = await cloudinary.uploader.upload(base64Image, {
      folder,
      resource_type: "auto"
    });

    return result;
  } catch (error) {
    console.error("Cloudinary Helper Error:", error);
    throw error;
  }
};

module.exports = {
  upload,
  uploadToCloudinary
};
