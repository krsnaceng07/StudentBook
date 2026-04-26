const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');
const Profile = require('../models/Profile');
const Connection = require('../models/Connection');
const Joi = require('joi');
const { createNotification } = require('../utils/notificationHelper');

const messageSchema = Joi.object({
  text: Joi.string().allow('', null).max(5000),
  attachments: Joi.array().items(Joi.object({
    url: Joi.string().required(),
    type: Joi.string().required(),
    name: Joi.string().required(),
    size: Joi.number().allow(null)
  })).default([]),
  replyTo: Joi.string().allow(null, '')
}).or('text', 'attachments');

// @desc    Create or get a 1:1 conversation
// @route   POST /api/v1/chat/conversations
const createConversation = async (req, res) => {
  try {
    const { recipientId } = req.body;
    const senderId = req.user._id;

    if (!recipientId) {
      return res.status(400).json({ success: false, message: 'Recipient ID required' });
    }

    // SECURITY: Check if users are connected
    const isConnected = await Connection.findOne({
      $or: [
        { requester: senderId, recipient: recipientId },
        { requester: recipientId, recipient: senderId }
      ],
      status: 'accepted'
    });

    if (!isConnected) {
      return res.status(403).json({ 
        success: false, 
        message: 'You can only start a chat with your connections' 
      });
    }

    // Check if 1:1 already exists
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, recipientId], $size: 2 }
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, recipientId],
      });
    }

    res.status(201).json({ success: true, data: conversation });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getConversations = async (req, res) => {
  try {
    const { type } = req.query; // 'personal' or 'team'
    
    let query = { participants: req.user._id };
    if (type) {
      query.type = type;
    }

    const conversations = await Conversation.find(query)
      .populate('participants', 'name username')
      .populate('teamId', 'name avatar')
      .sort({ updatedAt: -1 });

    // Batch-fetch all profiles for participants to get avatars
    const participantIds = conversations.flatMap(c => c.participants.map(p => p._id));
    const profiles = await Profile.find({ userId: { $in: participantIds } });
    const profileMap = new Map(profiles.map(p => [p.userId.toString(), p.avatar]));

    // Format to exclude self from participants OR show team info
    const formatted = conversations.map(conv => {
      if (conv.type === 'team' && conv.teamId) {
        return {
          _id: conv._id,
          type: 'team',
          otherUser: { 
            _id: conv.teamId._id, 
            name: conv.teamId.name, 
            avatar: conv.teamId.avatar 
          },
          lastMessage: conv.lastMessage,
          updatedAt: conv.updatedAt
        };
      }

      const otherUser = conv.participants.find(p => p._id.toString() !== req.user._id.toString());
      const otherUserObj = otherUser ? otherUser.toObject() : null;
      if (otherUserObj) {
        otherUserObj.avatar = profileMap.get(otherUserObj._id.toString()) || null;
      }

      return {
        _id: conv._id,
        type: 'personal',
        otherUser: otherUserObj,
        lastMessage: conv.lastMessage,
        updatedAt: conv.updatedAt
      };
    });

    res.json({ success: true, data: formatted });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get messages for a conversation (paginated)
const getMessages = async (req, res) => {
  try {
    const { cursor } = req.query; // ISO date string
    const limit = parseInt(req.query.limit) || 20;

    const conversation = await Conversation.findById(req.params.conversationId);
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    // Security: Check if user is a participant
    const isParticipant = conversation.participants.some(p => p.toString() === req.user._id.toString());
    if (!isParticipant) {
      return res.status(403).json({ success: false, message: 'Not authorized to view these messages' });
    }

    const query = { conversationId: req.params.conversationId };
    if (cursor) {
      query.createdAt = { $lt: new Date(cursor) };
    }

    const messages = await Message.find(query)
      .populate('sender', 'name avatar username')
      .populate({
        path: 'replyTo',
        populate: { path: 'sender', select: 'name' }
      })
      .sort({ createdAt: -1 })
      .limit(limit);

    // Batch-fetch profiles for senders in this batch of messages
    const senderIds = [...new Set(messages.map(m => m.sender?._id))].filter(Boolean);
    const senderProfiles = await Profile.find({ userId: { $in: senderIds } });
    const senderProfileMap = new Map(senderProfiles.map(p => [p.userId.toString(), p.avatar]));

    // Capture nextCursor BEFORE reversing
    const nextCursor = messages.length === limit ? messages[messages.length - 1].createdAt : null;

    const formattedMessages = messages.map(m => {
      const mObj = m.toObject();
      if (mObj.sender) {
        mObj.sender.avatar = senderProfileMap.get(mObj.sender._id.toString()) || null;
      }
      return mObj;
    });

    res.json({ 
      success: true, 
      data: formattedMessages.reverse(), 
      nextCursor
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Send a message
const sendMessage = async (req, res) => {
  try {
    const { error } = messageSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const { text, replyTo, attachments } = req.body;
    const { conversationId } = req.params;
    const senderId = req.user._id;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    // Security: Check if user is in participants (must use .some() for ObjectId comparison)
    const isParticipant = conversation.participants.some(p => p.toString() === senderId.toString());
    if (!isParticipant) {
      return res.status(401).json({ success: false, message: 'Not authorized for this chat' });
    }

    const xss = require('xss');
    let message = await Message.create({
      conversationId,
      sender: senderId,
      text: xss(text || ''),
      attachments: attachments || [],
      replyTo: replyTo || null
    });

    // Populate for socket emission
    message = await Message.findById(message._id)
      .populate('sender', 'name username')
      .populate({
        path: 'replyTo',
        populate: { path: 'sender', select: 'name' }
      });

    const senderProfile = await Profile.findOne({ userId: senderId });
    const messageObj = message.toObject();
    if (messageObj.sender) {
      messageObj.sender.avatar = senderProfile?.avatar || null;
    }

    let lastMsgText = text;
    if (!lastMsgText && attachments && attachments.length > 0) {
      lastMsgText = attachments[0].type === 'image' ? '📷 Sent an image' : '📄 Sent a document';
    }

    conversation.lastMessage = lastMsgText || 'Media';
    conversation.lastMessageSender = senderId;
    await conversation.save();

    // Trigger Real-time Event (Broadcast to the specific conversation room)
    if (global.io) {
      global.io.to(`conv_${conversationId}`).emit('receive_message', messageObj);
    }

    // 4. Send Smart Notifications to recipients who are NOT the sender
    const recipients = conversation.participants.filter(p => p.toString() !== senderId.toString());
    
    recipients.forEach(async (recipientId) => {
      await createNotification({
        recipient: recipientId,
        sender: senderId,
        type: 'message',
        teamId: conversation.type === 'team' ? conversation.teamId : null
      });
    });

    res.status(201).json({ success: true, data: messageObj });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Add/Remove reaction to a message
const toggleReaction = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    const reactionIndex = message.reactions.findIndex(
      r => r.user.toString() === userId.toString() && r.emoji === emoji
    );

    let action = 'add';
    if (reactionIndex > -1) {
      // Remove existing reaction
      message.reactions.splice(reactionIndex, 1);
      action = 'remove';
    } else {
      // Add new reaction
      message.reactions.push({ user: userId, emoji });
    }

    await message.save();

    // Notify via Socket
    if (global.io) {
      global.io.to(`conv_${message.conversationId}`).emit('message_reaction', {
        conversationId: message.conversationId,
        messageId,
        userId,
        emoji,
        action
      });
    }

    res.json({ success: true, action, data: message.reactions });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Mark all messages in a conversation as seen
const markAsSeen = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    // Security: Check if user is a participant
    const isParticipant = conversation.participants.some(p => p.toString() === userId.toString());
    if (!isParticipant) {
      return res.status(403).json({ success: false, message: 'Not authorized to access this conversation' });
    }

    // Update all messages in this conversation sent by others to 'seen'
    await Message.updateMany(
      { 
        conversationId, 
        sender: { $ne: userId },
        status: { $ne: 'seen' }
      },
      { $set: { status: 'seen' } }
    );

    // Notify others via socket
    if (global.io) {
      global.io.to(`conv_${conversationId}`).emit('message_seen', {
        conversationId,
        userId
      });
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete a message
// @route   DELETE /api/v1/chat/messages/:messageId
const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    // Only sender can delete for everyone
    if (message.sender.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this message' });
    }

    // Soft delete: keep the record but change content
    message.status = 'deleted';
    message.text = 'This message was deleted';
    message.attachments = [];
    await message.save();

    // Notify participants via socket
    if (global.io) {
      global.io.to(`conv_${message.conversationId}`).emit('message_deleted', {
        messageId: message._id,
        conversationId: message.conversationId
      });
    }

    res.json({ success: true, message: 'Message deleted' });
  } catch (err) {
    console.error('Delete Message Error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  createConversation,
  getConversations,
  getMessages,
  sendMessage,
  toggleReaction,
  markAsSeen,
  deleteMessage
};
