const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    trim: true,
    maxlength: 2000,
    validate: {
      validator: function(v) {
        // A post must have either content or images
        return (v && v.trim().length > 0) || (this.images && this.images.length > 0);
      },
      message: 'Post must have either text content or an image'
    }
  },
  images: {
    type: [String],
    default: [],
  },
  tags: {
    type: [String],
    default: [],
  },
  mentions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }
  ],
  likesCount: {
    type: Number,
    default: 0,
  },
  commentsCount: {
    type: Number,
    default: 0,
  },
  type: {
    type: String,
    enum: ['post', 'note', 'pdf', 'resource'],
    default: 'post'
  },
  fileUrl: {
    type: String,
    default: null
  },
  field: {
    type: String, // e.g., 'CS', 'Business', 'Arts'
    default: 'General'
  },
  visibility: {
    type: String,
    enum: ['public', 'connections'],
    default: 'public'
  },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  comments: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      text: String,
      createdAt: { type: Date, default: Date.now }
    }
  ],
  status: {
    type: String,
    enum: ['active', 'deleted'],
    default: 'active',
  }
}, { timestamps: true });

// Index for pagination, sorting and text search
postSchema.index({ createdAt: -1 });
postSchema.index({ authorId: 1, createdAt: -1 }); // Fast profile feed
postSchema.index({ tags: 1 }); // Fast tag search
postSchema.index({ field: 1, type: 1 }); // Fast filtering for Study Hub
postSchema.index({ status: 1 }); // Fast filtering of active posts
postSchema.index({ content: 'text' });

const Post = mongoose.model('Post', postSchema);
module.exports = Post;
