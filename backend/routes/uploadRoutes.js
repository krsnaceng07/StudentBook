const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../utils/upload');
const { uploadProfileImage, uploadPostImage, uploadChatMedia } = require('../controllers/uploadController');

const router = express.Router();

router.use(protect);

router.post('/profile', upload.single('file'), uploadProfileImage);
router.post('/post', upload.single('file'), uploadPostImage);
router.post('/chat', upload.single('file'), uploadChatMedia);

module.exports = router;
