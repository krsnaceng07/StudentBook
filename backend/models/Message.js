const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  text: {
    type: String,
    required: function() {
      return !this.attachments || this.attachments.length === 0;
    },
  },
  attachments: [
    {
      url: { type: String, required: true },
      type: { type: String, enum: ['image', 'pdf', 'doc'], required: true },
      name: { type: String, required: true },
      size: { type: Number }
    }
  ],
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    default: null,
  },
  isEncrypted: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

// Index for fast message fetching per conversation
messageSchema.index({ conversationId: 1, createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);
