const express = require('express');
const router = express.Router();
const { unifiedSearch } = require('../controllers/searchController');
const { protect } = require('../middleware/authMiddleware');

router.get('/unified', protect, unifiedSearch);

module.exports = router;
