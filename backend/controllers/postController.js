const Post = require('../models/Post');
const Like = require('../models/Like');
const Comment = require('../models/Comment');
const CommentLike = require('../models/CommentLike');
const Profile = require('../models/Profile');
const User = require('../models/User');
const Connection = require('../models/Connection');
const { createNotification } = require('../utils/notificationHelper');
const Joi = require('joi');
const xss = require('xss');

const postSchema = Joi.object({
  content: Joi.string().max(5000).allow(''),
  images: Joi.array().items(Joi.string()),
  tags: Joi.array().items(Joi.string())
});

const commentSchema = Joi.object({
  content: Joi.string().required().max(2000),
  parentId: Joi.string().allow(null, '')
});

// Helper to extract hashtags and mentions
const parseContent = (content) => {
  const hashtagRegex = /#(\w+)/g;
  const mentionRegex = /@(\w+)/g;
  
  const tags = [...new Set((content.match(hashtagRegex) || []).map(t => t.slice(1)))];
  const mentions = (content.match(mentionRegex) || []).map(m => m.slice(1));
  
  return { tags, mentions };
};

// @desc    Create a new post
// @route   POST /api/v1/posts
// @access  Private
const createPost = async (req, res) => {
  try {
    const { error } = postSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    let { content, images, tags: providedTags } = req.body;
    content = xss(content || '');

    const { tags: extractedTags, mentions: usernames } = parseContent(content);
    const finalTags = [...new Set([...(providedTags || []), ...extractedTags])];

    // Find mentioned user IDs
    let mentionIds = [];
    if (usernames.length > 0) {
      const mentionedUsers = await User.find({ username: { $in: usernames } }).select('_id');
      mentionIds = mentionedUsers.map(u => u._id);
    }

    // ALWAYS use authenticated user as author
    const post = await Post.create({
      authorId: req.user._id,
      content,
      images: images || [],
      tags: finalTags,
      mentions: mentionIds
    });

    // Notify mentioned users
    if (mentionIds.length > 0) {
      Promise.all(mentionIds.map(recipientId => 
        createNotification({
          recipient: recipientId,
          sender: req.user._id,
          type: 'mention',
          message: `mentioned you in a post`,
          relatedId: post._id
        })
      )).catch(err => console.error('Mention Notification Error:', err));
    }

    const populatedPost = await Post.findById(post._id)
      .populate('authorId', 'name username');

    // Get author profile for avatar
    const profile = await Profile.findOne({ userId: req.user._id });

    res.status(201).json({
      success: true,
      data: {
        ...populatedPost.toObject(),
        author: {
          _id: populatedPost.authorId._id,
          name: populatedPost.authorId.name,
          username: populatedPost.authorId.username,
          avatar: profile?.avatar || null
        }
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get social feed (paginated)
// @route   GET /api/v1/posts
// @access  Private
const getFeed = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const tag = req.query.tag || '';

    // Build filter
    const filter = { status: { $ne: 'deleted' } };

    if (search && search.trim()) {
      const trimmedSearch = search.trim();
      const searchRegex = { $regex: trimmedSearch, $options: 'i' };
      
      // DEEP SEARCH: Find users whose name/username matches the search
      const matchingUsers = await User.find({
        $or: [
          { name: searchRegex },
          { username: searchRegex }
        ]
      }).select('_id').limit(10);
      
      const matchingUserIds = matchingUsers.map(u => u._id);

      filter.$or = [
        { content: searchRegex },
        { tags: searchRegex },
        { authorId: { $in: matchingUserIds } }
      ];
    }
    if (tag) {
      filter.tags = tag;
    }

    const userId = req.user._id;

    // Use aggregation for high performance (joins profiles and checks likes in one query)
    const posts = await Post.aggregate([
      { $match: filter },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: 'users',
          localField: 'authorId',
          foreignField: '_id',
          as: 'authorInfo'
        }
      },
      { $unwind: '$authorInfo' },
      {
        $lookup: {
          from: 'profiles',
          localField: 'authorId',
          foreignField: 'userId',
          as: 'authorProfile'
        }
      },
      { $unwind: { path: '$authorProfile', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'likes',
          let: { postId: '$_id', userId: userId },
          pipeline: [
            { 
              $match: { 
                $expr: { 
                  $and: [
                    { $eq: ['$postId', '$$postId'] },
                    { $eq: ['$userId', '$$userId'] }
                  ] 
                } 
              } 
            }
          ],
          as: 'userLike'
        }
      },
      {
        $project: {
          _id: 1,
          content: 1,
          images: 1,
          tags: 1,
          likesCount: 1,
          commentsCount: 1,
          createdAt: 1,
          author: {
            _id: '$authorInfo._id',
            name: '$authorInfo.name',
            username: '$authorInfo.username',
            avatar: '$authorProfile.avatar'
          },
          isLiked: { $gt: [{ $size: '$userLike' }, 0] }
        }
      }
    ]);

    const total = await Post.countDocuments(filter);

    res.json({
      success: true,
      data: posts,
      pagination: {
        page,
        limit,
        total,
        hasMore: (page * limit) < total
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get network feed (posts from connections only)
// @route   GET /api/v1/posts/network
// @access  Private
const getNetworkFeed = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const userId = req.user._id;

    // 1. Get all accepted connections
    const connections = await Connection.find({
      $or: [{ requester: userId }, { recipient: userId }],
      status: 'accepted'
    });

    // 2. Extract connected user IDs
    const connectedUserIds = connections.map(conn =>
      conn.requester.toString() === userId.toString() ? conn.recipient : conn.requester
    );

    // If no connections, return empty result early
    if (connectedUserIds.length === 0) {
      return res.json({
        success: true,
        data: [],
        pagination: {
          page,
          limit,
          total: 0,
          hasMore: false
        }
      });
    }

    // 3. Build filter for posts from connections
    const filter = { 
      authorId: { $in: connectedUserIds },
      status: { $ne: 'deleted' }
    };

    // 4. Use aggregation (reusing logic from getFeed for consistency)
    const posts = await Post.aggregate([
      { $match: filter },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: 'users',
          localField: 'authorId',
          foreignField: '_id',
          as: 'authorInfo'
        }
      },
      { $unwind: '$authorInfo' },
      {
        $lookup: {
          from: 'profiles',
          localField: 'authorId',
          foreignField: 'userId',
          as: 'authorProfile'
        }
      },
      { $unwind: { path: '$authorProfile', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'likes',
          let: { postId: '$_id', userId: userId },
          pipeline: [
            { 
              $match: { 
                $expr: { 
                  $and: [
                    { $eq: ['$postId', '$$postId'] },
                    { $eq: ['$userId', '$$userId'] }
                  ] 
                } 
              } 
            }
          ],
          as: 'userLike'
        }
      },
      {
        $project: {
          _id: 1,
          content: 1,
          images: 1,
          tags: 1,
          likesCount: 1,
          commentsCount: 1,
          createdAt: 1,
          author: {
            _id: '$authorInfo._id',
            name: '$authorInfo.name',
            username: '$authorInfo.username',
            avatar: '$authorProfile.avatar'
          },
          isLiked: { $gt: [{ $size: '$userLike' }, 0] }
        }
      }
    ]);

    const total = await Post.countDocuments(filter);

    res.json({
      success: true,
      data: posts,
      pagination: {
        page,
        limit,
        total,
        hasMore: (page * limit) < total
      }
    });
  } catch (err) {
    console.error('Get Network Feed Error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Toggle like on post
// @route   POST /api/v1/posts/:postId/like
// @access  Private
const toggleLike = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;

    // 1. Try to delete the like (atomic check)
    const deletedLike = await Like.findOneAndDelete({ userId, postId });

    if (deletedLike) {
      // 2a. If it existed and was deleted, decrement count (ensure it doesn't go below 0)
      const post = await Post.findByIdAndUpdate(
        postId, 
        { $inc: { likesCount: -1 } },
        { new: true }
      );
      
      // Safety: Ensure count doesn't drift negative
      if (post && post.likesCount < 0) {
        post.likesCount = 0;
        await post.save();
      }

      // Real-time Feed Update
      if (global.io) {
        global.io.emit('post_updated', {
          postId: postId,
          likesCount: post.likesCount,
          commentsCount: post.commentsCount
        });
      }

      return res.json({ success: true, message: 'Unliked', liked: false });
    } else {
      // 2b. If it didn't exist, try to create it
      try {
        await Like.create({ userId, postId });
        const post = await Post.findByIdAndUpdate(
          postId, 
          { $inc: { likesCount: 1 } },
          { new: true }
        );

        // Notification logic
        if (post && post.authorId.toString() !== userId.toString()) {
          await createNotification({
            recipient: post.authorId,
            sender: userId,
            type: 'like',
            message: `liked your post`,
            relatedId: postId
          });
        }

        // Real-time Feed Update
        if (global.io) {
          global.io.emit('post_updated', {
            postId: postId,
            likesCount: post.likesCount,
            commentsCount: post.commentsCount
          });
        }

        return res.json({ success: true, message: 'Liked', liked: true });
      } catch (createErr) {
        // If unique index prevents double-creation, it means another request just liked it
        if (createErr.code === 11000) {
          return res.json({ success: true, message: 'Already liked', liked: true });
        }
        throw createErr;
      }
    }
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Add comment to post
// @route   POST /api/v1/posts/:postId/comments
// @access  Private
const addComment = async (req, res) => {
  try {
    const { error } = commentSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const { content, parentId } = req.body;
    const sanitizedContent = xss(content);
    const { postId } = req.params;

    const comment = await Comment.create({
      userId: req.user._id,
      postId,
      parentId: parentId || null,
      content: sanitizedContent
    });

    await Post.findByIdAndUpdate(postId, { $inc: { commentsCount: 1 } });

    const post = await Post.findById(postId);
    if (post && post.authorId.toString() !== req.user._id.toString()) {
      await createNotification({
        recipient: post.authorId,
        sender: req.user._id,
        type: 'comment',
        message: `commented on your post`,
        relatedId: postId
      });
    }

    // Real-time Feed Update
    if (global.io && post) {
      global.io.emit('post_updated', {
        postId: postId,
        likesCount: post.likesCount,
        commentsCount: post.commentsCount + 1 // Add 1 because we just incremented it in DB but haven't re-fetched post object yet
      });
    }

    const populatedComment = await Comment.findById(comment._id)
      .populate('userId', 'name username');
    
    const profile = await Profile.findOne({ userId: req.user._id });

    res.status(201).json({
      success: true,
      data: {
        ...populatedComment.toObject(),
        user: {
          _id: populatedComment.userId._id,
          name: populatedComment.userId.name,
          username: populatedComment.userId.username,
          avatar: profile?.avatar || null
        }
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get comments for a post
// @route   GET /api/v1/posts/:postId/comments
// @access  Private
const getComments = async (req, res) => {
  try {
    const { postId } = req.params;
    const { cursor } = req.query;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);

    const query = { postId };
    if (cursor) {
      query.createdAt = { $gt: new Date(cursor) };
    }

    const comments = await Comment.find(query)
      .sort({ createdAt: 1 })
      .limit(limit)
      .populate('userId', 'name username');

    const nextCursor = comments.length === limit ? comments[comments.length - 1].createdAt : null;

    // Batch-fetch all profiles and comment likes in ONE query each (eliminates N+1)
    const commenterIds = comments.map(c => c.userId._id);
    const commentIds = comments.map(c => c._id);

    const [profiles, commentLikes] = await Promise.all([
      Profile.find({ userId: { $in: commenterIds } }),
      CommentLike.find({ userId: req.user._id, commentId: { $in: commentIds } })
    ]);

    const profileMap = new Map(profiles.map(p => [p.userId.toString(), p]));
    const likedSet = new Set(commentLikes.map(cl => cl.commentId.toString()));

    const enhancedComments = comments.map((comment) => {
      const profile = profileMap.get(comment.userId._id.toString());
      return {
        ...comment.toObject(),
        user: {
          _id: comment.userId._id,
          name: comment.userId.name,
          username: comment.userId.username,
          avatar: profile?.avatar || null
        },
        isLiked: likedSet.has(comment._id.toString())
      };
    });

    res.json({ 
      success: true, 
      data: enhancedComments,
      pagination: {
        nextCursor
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Like a comment
// @route   POST /api/v1/comments/:commentId/like
// @access  Private
const likeComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user._id;

    // 1. Try to delete the like (atomic toggle check)
    const deletedLike = await CommentLike.findOneAndDelete({ userId, commentId });

    if (deletedLike) {
      // 2a. If unliked, decrement count
      await Comment.findByIdAndUpdate(commentId, { $inc: { likesCount: -1 } });
      return res.json({ success: true, message: 'Unliked comment', liked: false });
    } else {
      // 2b. If not unliked, try to create like
      try {
        await CommentLike.create({ userId, commentId });
        await Comment.findByIdAndUpdate(commentId, { $inc: { likesCount: 1 } });
        return res.json({ success: true, message: 'Liked comment', liked: true });
      } catch (createErr) {
        if (createErr.code === 11000) {
          return res.json({ success: true, message: 'Already liked', liked: true });
        }
        throw createErr;
      }
    }
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update a post
// @route   PUT /api/v1/posts/:id
// @access  Private
const updatePost = async (req, res) => {
  try {
    const { content, tags, images } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // Check if user is author
    if (post.authorId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized to update this post' });
    }

    post.content = content !== undefined ? content : post.content;
    
    // Update tags and mentions if content changed
    if (content !== undefined) {
      const { tags: extractedTags, mentions: usernames } = parseContent(post.content);
      post.tags = [...new Set([...(tags || []), ...extractedTags])];
      
      if (usernames.length > 0) {
        const mentionedUsers = await User.find({ username: { $in: usernames } }).select('_id');
        post.mentions = mentionedUsers.map(u => u._id);
      } else {
        post.mentions = [];
      }
    } else {
      post.tags = tags || post.tags;
      post.images = images || post.images;
    }

    await post.save();

    // Re-populate and format like getFeed for frontend consistency
    const updatedPost = await Post.findById(post._id)
      .populate('authorId', 'name username');
    
    const profile = await Profile.findOne({ userId: post.authorId });

    res.json({
      success: true,
      data: {
        ...updatedPost.toObject(),
        author: {
          _id: updatedPost.authorId._id,
          name: updatedPost.authorId.name,
          username: updatedPost.authorId.username,
          avatar: profile?.avatar || null
        }
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete a post
// @route   DELETE /api/v1/posts/:id
// @access  Private
const deletePost = async (req, res) => {
  try {
    console.log(`[DELETE POST] Request for ID: ${req.params.id} by User: ${req.user._id}`);
    
    const post = await Post.findById(req.params.id);

    if (!post) {
      console.log(`[DELETE POST] Post not found: ${req.params.id}`);
      return res.status(404).json({ success: false, message: 'Post not found in database' });
    }

    // Ownership Check
    if (post.authorId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this post' });
    }

    // Soft Delete
    post.status = 'deleted';
    await post.save();

    res.json({ success: true, message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  createPost,
  getFeed,
  updatePost,
  deletePost,
  toggleLike,
  addComment,
  getComments,
  likeComment,
  getNetworkFeed
};
