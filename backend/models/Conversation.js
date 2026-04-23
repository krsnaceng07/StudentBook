const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }],
  lastMessage: {
    type: String,
    default: '',
  },
  lastMessageSender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  type: {
    type: String,
    enum: ['personal', 'team'],
    default: 'personal',
  },
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
  }
  // Note: updatedAt is auto-managed by { timestamps: true } — do NOT add a manual field
}, { timestamps: true });

// Index for fast participant lookups
conversationSchema.index({ participants: 1 });
// Index for fast team chat lookups
conversationSchema.index({ teamId: 1 }, { sparse: true });

module.exports = mongoose.model('Conversation', conversationSchema);
