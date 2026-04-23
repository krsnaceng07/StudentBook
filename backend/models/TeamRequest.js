const mongoose = require('mongoose');

const teamRequestSchema = new mongoose.Schema({
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true,
  },
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending',
  },
  message: {
    type: String,
    maxlength: [200, 'Message cannot be more than 200 characters'],
  }
}, { timestamps: true });

// Prevent duplicate pending/accepted requests from the same user to the same team
teamRequestSchema.index({ teamId: 1, requester: 1 }, { unique: true });

module.exports = mongoose.model('TeamRequest', teamRequestSchema);
