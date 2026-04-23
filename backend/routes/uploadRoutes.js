const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../utils/upload');
const { uploadProfileImage, uploadPostImage } = require('../controllers/uploadController');

const router = express.Router();

router.use(protect);

router.post('/profile', upload.single('file'), uploadProfileImage);
router.post('/post', upload.single('file'), uploadPostImage);

module.exports = router;
