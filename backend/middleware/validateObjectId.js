const mongoose = require('mongoose');

/**
 * Security middleware: validates that any :id, :userId, :postId, :commentId,
 * :teamId, :requestId, or :conversationId route params are valid MongoDB ObjectIds.
 * 
 * Without this, malformed IDs cause Mongoose CastErrors that leak internal
 * stack traces through the error handler.
 */
const validateObjectId = (...paramNames) => (req, res, next) => {
  for (const param of paramNames) {
    const value = req.params[param];
    if (value && !mongoose.Types.ObjectId.isValid(value)) {
      return res.status(400).json({
        success: false,
        message: `Invalid ID format for parameter: ${param}`
      });
    }
  }
  next();
};

module.exports = validateObjectId;
