const express = require('express');
const router = express.Router();
const { 
  createConversation, 
  getConversations, 
  getMessages, 
  sendMessage,
  toggleReaction,
  markAsSeen,
  deleteMessage
} = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');
const validateObjectId = require('../middleware/validateObjectId');

router.post('/conversations', protect, createConversation);
router.get('/conversations', protect, getConversations);
router.get('/:conversationId/messages', protect, getMessages);
router.post('/:conversationId/messages', protect, sendMessage);
router.patch('/messages/:messageId/reaction', protect, toggleReaction);
router.delete('/messages/:messageId', protect, deleteMessage);
router.patch('/conversations/:conversationId/seen', protect, validateObjectId('conversationId'), markAsSeen);

module.exports = router;
