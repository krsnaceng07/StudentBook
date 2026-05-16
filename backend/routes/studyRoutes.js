const express = require('express');
const router = express.Router();
const {
  getStudyFeed,
  createStudyPost,
  askQuestion,
  answerQuestion
} = require('../controllers/studyController');
const { protect } = require('../middleware/authMiddleware');

router.get('/feed', protect, getStudyFeed);
router.post('/post', protect, createStudyPost);
router.post('/question', protect, askQuestion);
router.post('/answer', protect, answerQuestion);

module.exports = router;
