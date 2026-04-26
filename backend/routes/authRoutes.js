const express = require('express');
const router = express.Router();
const { 
  registerUser, loginUser, getMe, forgotPassword, resetPassword, firebaseLogin, logoutUser 
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/firebase', firebaseLogin);
router.post('/logout', protect, logoutUser);
router.get('/me', protect, getMe);

router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

module.exports = router;
