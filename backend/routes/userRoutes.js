const express = require('express');
const router = express.Router();
const { discoverUsers, searchUsers } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.get('/discover', protect, discoverUsers);
router.get('/search', protect, searchUsers);

module.exports = router;
