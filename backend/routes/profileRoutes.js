const express = require('express');
const router = express.Router();
const { createOrUpdateProfile, getMyProfile, getProfileByUserId } = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createOrUpdateProfile);
router.put('/me', protect, createOrUpdateProfile); // Alias for update
router.get('/me', protect, getMyProfile);
router.get('/user/:userId', getProfileByUserId);

module.exports = router;
