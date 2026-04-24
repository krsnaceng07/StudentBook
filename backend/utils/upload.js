const multer = require('multer');
const cloudinary = require('../config/cloudinary');

const storage = multer.memoryStorage();

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const isImage = file.mimetype.startsWith('image/');
    const isPDF = file.mimetype === 'application/pdf';
    const isAllowedExt = /\.(jpe?g|png|pdf)$/i.test(file.originalname);

    if (isImage || isPDF || isAllowedExt) {
      cb(null, true);
    } else {
      cb(new Error('Only images (JPG, PNG) and PDFs are allowed!'), false);
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
