const Notification = require('../models/Notification');

const createNotification = async (data) => {
  try {
    const notification = await Notification.create(data);
    
    // Populate info for the frontend UI
    const populated = await Notification.findById(notification._id)
      .populate('sender', 'name avatar username')
      .populate('post', 'content images')
      .populate('teamId', 'name avatar');

    // Emit to the specific user's room
    if (global.io) {
      global.io.to(data.recipient.toString()).emit('new_notification', populated);
      console.log(`[Socket] Notification sent to user: ${data.recipient}`);
    }
    
    return populated;
  } catch (err) {
    console.error('Notification Helper Error:', err);
    return null;
  }
};

/**
 * Marks all notifications as read for a user
 */
const markAllAsRead = async (userId) => {
  try {
    await Notification.updateMany({ recipient: userId, isRead: false }, { isRead: true });
    return true;
  } catch (err) {
    console.error('Mark All As Read Error:', err);
    return false;
  }
};

module.exports = { createNotification, markAllAsRead };
