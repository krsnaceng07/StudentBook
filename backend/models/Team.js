const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a team name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters'],
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [500, 'Description cannot be more than 500 characters'],
  },
  category: {
    type: String,
    enum: ['Study Group', 'Research', 'Startup', 'Hackathon', 'Competitive Exams', 'Open Source', 'Project', 'Other'],
    default: 'Study Group'
  },
  tags: [String],
  lookingFor: {
    type: [String],
    default: [],
  },
  status: {
    type: String,
    enum: ['Recruiting', 'Active', 'Full', 'Archived'],
    default: 'Recruiting'
  },
  isPublic: {
    type: Boolean,
    default: true,
  },
  leader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  members: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      role: {
        type: String,
        enum: ['leader', 'member'],
        default: 'member',
      },
      joinedAt: {
        type: Date,
        default: Date.now,
      }
    }
  ],
  avatar: String,
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation'
  }
}, { timestamps: true });

// Create text index for search
teamSchema.index({ name: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Team', teamSchema);
