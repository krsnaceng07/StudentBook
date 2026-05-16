const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true,
  },
  answer: {
    type: String,
    required: true,
    trim: true,
  },
  upvotes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }
  ],
  isAccepted: {
    type: Boolean,
    default: false,
  }
}, { timestamps: true });

answerSchema.index({ questionId: 1, createdAt: -1 });

module.exports = mongoose.model('Answer', answerSchema);
