const express = require('express');
const router = express.Router();
const { getSuggestedUsers, getUnifiedSuggestions } = require('../controllers/matchController');
const { protect } = require('../middleware/authMiddleware');

router.get('/suggested', protect, getSuggestedUsers);
router.get('/unified', protect, getUnifiedSuggestions);

module.exports = router;

