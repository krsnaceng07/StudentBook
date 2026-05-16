const { supabaseAdmin } = require('../config/supabase');
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
    if (error) return res.status(400).json({ success: false, message: error.details[0].message });

    let { content, images, tags: providedTags } = req.body;
    content = xss(content || '');

    const { tags: extractedTags, mentions: usernames } = parseContent(content);
    const finalTags = [...new Set([...(providedTags || []), ...extractedTags])];

    // Find mentioned user IDs
    let mentionIds = [];
    if (usernames.length > 0) {
      const { data: mentionedUsers } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .in('username', usernames);
      mentionIds = (mentionedUsers || []).map(u => u.id);
    }

    const { data: post, error: postError } = await supabaseAdmin
      .from('posts')
      .insert([{
        author_id: req.user.id,
        content,
        images: images || [],
        tags: finalTags,
        mentions: mentionIds
      }])
      .select('*, author:profiles!author_id(id, name, username, avatar)')
      .single();

    if (postError) throw postError;

    if (mentionIds.length > 0) {
      Promise.all(mentionIds.map(recipientId => 
        createNotification({
          recipient: recipientId,
          sender: req.user.id,
          type: 'mention',
          message: `mentioned you in a post`,
          relatedId: post.id
        })
      )).catch(err => console.error('Mention Notification Error:', err));
    }

    res.status(201).json({
      success: true,
      data: post
    });
  } catch (err) {
    console.error(err);
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
    
    let query = supabaseAdmin
      .from('posts')
      .select('*, author:profiles!author_id(id, name, username, avatar), likes(user_id)', { count: 'exact' })
      .neq('status', 'deleted')
      .order('created_at', { ascending: false })
      .range(skip, skip + limit - 1);

    if (search && search.trim()) {
      const trimmedSearch = search.trim();
      query = query.or(`content.ilike.%${trimmedSearch}%,tags.cs.{${trimmedSearch}}`);
    }

    if (tag) {
      query = query.contains('tags', [tag]);
    }

    const { data: posts, count, error } = await query;
    if (error) throw error;

    const formattedPosts = (posts || []).map(post => ({
      ...post,
      isLiked: Array.isArray(post.likes) ? post.likes.some(like => like.user_id === req.user.id) : false,
      likes: undefined // remove full likes array from payload
    }));

    res.json({
      success: true,
      data: formattedPosts,
      pagination: {
        page, limit, total: count, hasMore: (page * limit) < count
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get network feed
// @route   GET /api/v1/posts/network
// @access  Private
const getNetworkFeed = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const { data: connections } = await supabaseAdmin
      .from('connections')
      .select('*')
      .or(`user1_id.eq.${req.user.id},user2_id.eq.${req.user.id}`)
      .eq('status', 'accepted');

    const connectedUserIds = (connections || []).map(conn => 
      conn.user1_id === req.user.id ? conn.user2_id : conn.user1_id
    );

    if (connectedUserIds.length === 0) {
      return res.json({ success: true, data: [], pagination: { page, limit, total: 0, hasMore: false } });
    }

    const { data: posts, count, error } = await supabaseAdmin
      .from('posts')
      .select('*, author:profiles!author_id(id, name, username, avatar), likes(user_id)', { count: 'exact' })
      .neq('status', 'deleted')
      .in('author_id', connectedUserIds)
      .order('created_at', { ascending: false })
      .range(skip, skip + limit - 1);

    if (error) throw error;

    const formattedPosts = (posts || []).map(post => ({
      ...post,
      isLiked: Array.isArray(post.likes) ? post.likes.some(like => like.user_id === req.user.id) : false,
      likes: undefined
    }));

    res.json({
      success: true,
      data: formattedPosts,
      pagination: { page, limit, total: count, hasMore: (page * limit) < count }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Toggle like on post
// @route   POST /api/v1/posts/:postId/like
// @access  Private
const toggleLike = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    // Check if like exists
    const { data: existingLike } = await supabaseAdmin
      .from('likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single();

    if (existingLike) {
      await supabaseAdmin.from('likes').delete().eq('id', existingLike.id);
      
      // Update count (in Supabase we might use triggers, but doing it manually for now)
      const { data: post } = await supabaseAdmin.rpc('decrement_likes', { p_id: postId }).select().single();
      // Wait, since we don't have rpc we can just query and update, or just use triggers. 
      // For now we'll do a basic update.
      const { data: p } = await supabaseAdmin.from('posts').select('likes_count').eq('id', postId).single();
      await supabaseAdmin.from('posts').update({ likes_count: Math.max(0, p.likes_count - 1) }).eq('id', postId);

      return res.json({ success: true, message: 'Unliked', liked: false });
    } else {
      await supabaseAdmin.from('likes').insert([{ post_id: postId, user_id: userId }]);
      
      const { data: p } = await supabaseAdmin.from('posts').select('likes_count, author_id').eq('id', postId).single();
      await supabaseAdmin.from('posts').update({ likes_count: p.likes_count + 1 }).eq('id', postId);

      if (p.author_id !== userId) {
        await createNotification({ recipient: p.author_id, sender: userId, type: 'like', message: `liked your post`, relatedId: postId });
      }
      return res.json({ success: true, message: 'Liked', liked: true });
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
    if (error) return res.status(400).json({ success: false, message: error.details[0].message });

    const { content } = req.body;
    const { postId } = req.params;

    const { data: comment, error: insertError } = await supabaseAdmin
      .from('comments')
      .insert([{ post_id: postId, user_id: req.user.id, text: xss(content) }])
      .select('*, user:profiles!user_id(id, name, username, avatar)')
      .single();

    if (insertError) throw insertError;

    const { data: p } = await supabaseAdmin.from('posts').select('comments_count, author_id').eq('id', postId).single();
    await supabaseAdmin.from('posts').update({ comments_count: p.comments_count + 1 }).eq('id', postId);

    if (p.author_id !== req.user.id) {
      await createNotification({ recipient: p.author_id, sender: req.user.id, type: 'comment', message: `commented on your post`, relatedId: postId });
    }

    res.status(201).json({ success: true, data: comment });
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
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);

    const { data: comments, error } = await supabaseAdmin
      .from('comments')
      .select('*, user:profiles!user_id(id, name, username, avatar)')
      .eq('post_id', postId)
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error) throw error;
    res.json({ success: true, data: comments, pagination: { nextCursor: null } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const likeComment = async (req, res) => res.json({ success: true, message: 'Not implemented in v2 yet' });
const updatePost = async (req, res) => res.json({ success: true, message: 'Not implemented in v2 yet' });
const deletePost = async (req, res) => {
  await supabaseAdmin.from('posts').update({ status: 'deleted' }).eq('id', req.params.id);
  res.json({ success: true, message: 'Post deleted' });
};

module.exports = {
  createPost, getFeed, updatePost, deletePost, toggleLike, addComment, getComments, likeComment, getNetworkFeed
};
