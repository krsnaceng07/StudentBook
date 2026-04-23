const express = require('express');
const router = express.Router();
const { getSuggestedUsers } = require('../controllers/matchController');
const { protect } = require('../middleware/authMiddleware');

router.get('/suggested', protect, getSuggestedUsers);

module.exports = router;
