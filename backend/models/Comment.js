const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true,
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null,
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000,
  },
  likesCount: {
    type: Number,
    default: 0,
  }
}, { timestamps: true });

// Index for fetching comments for a post
commentSchema.index({ postId: 1, createdAt: 1 });

const Comment = mongoose.model('Comment', commentSchema);
module.exports = Comment;
