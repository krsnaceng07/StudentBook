const express = require('express');
const router = express.Router();
const {
  createPost,
  getFeed,
  updatePost,
  deletePost,
  toggleLike,
  addComment,
  getComments,
  likeComment,
  getNetworkFeed
} = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware');
const validateObjectId = require('../middleware/validateObjectId');

// All routes are protected
router.use(protect);

router.get('/network', getNetworkFeed);

router.route('/')
  .post(createPost)
  .get(getFeed);

router.route('/:id')
  .put(validateObjectId('id'), updatePost)
  .delete(validateObjectId('id'), deletePost);

router.post('/:postId/like', validateObjectId('postId'), toggleLike);

router.route('/:postId/comments')
  .post(validateObjectId('postId'), addComment)
  .get(validateObjectId('postId'), getComments);

router.post('/comments/:commentId/like', validateObjectId('commentId'), likeComment);

module.exports = router;
