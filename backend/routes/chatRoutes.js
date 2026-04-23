const express = require('express');
const router = express.Router();
const { 
  createConversation, 
  getConversations, 
  getMessages, 
  sendMessage 
} = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

router.post('/conversations', protect, createConversation);
router.get('/conversations', protect, getConversations);
router.get('/:conversationId/messages', protect, getMessages);
router.post('/:conversationId/messages', protect, sendMessage);

module.exports = router;
