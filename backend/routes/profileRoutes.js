const express = require('express');
const router = express.Router();
const { createOrUpdateProfile, getMyProfile, getProfileByUserId } = require('../controllers/profileController');
const { protect, optionalProtect } = require('../middleware/authMiddleware');
const validateObjectId = require('../middleware/validateObjectId');

router.post('/', protect, createOrUpdateProfile);
router.put('/me', protect, createOrUpdateProfile); // Alias for update
router.get('/me', protect, getMyProfile);
router.get('/user/:userId', optionalProtect, validateObjectId('userId'), getProfileByUserId);

module.exports = router;
