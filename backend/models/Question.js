const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  question: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000,
  },
  tags: {
    type: [String],
    default: [],
  },
  field: {
    type: String,
    default: 'General',
  },
  upvotes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }
  ],
  answersCount: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['open', 'resolved', 'deleted'],
    default: 'open',
  }
}, { timestamps: true });

questionSchema.index({ createdAt: -1 });
questionSchema.index({ field: 1 });
questionSchema.index({ tags: 1 });

module.exports = mongoose.model('Question', questionSchema);
