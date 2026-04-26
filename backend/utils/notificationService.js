const Notification = require('../models/Notification');

/**
 * Creates and sends a notification in real-time.
 */
const sendNotification = async ({ recipient, sender, type, post = null, teamId = null }) => {
  try {
    // 1. Create in Database
    const notification = await Notification.create({
      recipient,
      sender,
      type,
      post,
      teamId
    });

    // 2. Populate for real-time delivery
    const populated = await Notification.findById(notification._id)
      .populate('sender', 'name username avatar')
      .populate('post', 'content images')
      .populate('teamId', 'name avatar');

    // 3. Emit via Socket.io
    if (global.io) {
      // Emit to the specific recipient's room
      global.io.to(recipient.toString()).emit('new_notification', populated);
      console.log(`[Notification] Sent ${type} to user ${recipient}`);
    }

    return populated;
  } catch (error) {
    console.error('[Notification Service Error]:', error);
  }
};

module.exports = {
  sendNotification
};
