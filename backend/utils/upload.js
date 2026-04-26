const multer = require('multer');
const cloudinary = require('../config/cloudinary');

const storage = multer.memoryStorage();

const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB for study materials
  fileFilter: (req, file, cb) => {
    // WhatsApp-like: Allow images, videos, documents, archives
    const allowedMimeTypes = [
      'image/',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'application/zip',
      'application/x-rar-compressed',
      'video/'
    ];

    const isAllowed = allowedMimeTypes.some(type => file.mimetype.startsWith(type));
    
    if (isAllowed) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images, videos, and documents are allowed.'), false);
    }
  }
});

const uploadToCloudinary = (file, folder = "studentsociety") => {
  return new Promise((resolve, reject) => {
    if (!file.buffer) {
      return reject(new Error("No file buffer found."));
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "auto",
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary Upload Stream Error:", error);
          return reject(error);
        }
        resolve(result);
      }
    );

    // Write buffer to stream
    uploadStream.end(file.buffer);
  });
};

module.exports = {
  upload,
  uploadToCloudinary
};
