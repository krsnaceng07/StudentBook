const express = require('express');
const router = express.Router();
const { discoverUsers } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.get('/discover', protect, discoverUsers);

module.exports = router;
