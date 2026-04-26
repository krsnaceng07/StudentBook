const Notification = require('../models/Notification');

/**
 * Create a notification and emit it via socket
 * @param {Object} data - Notification data (recipient, sender, type, message, relatedId, etc.)
 */
const createNotification = async (data) => {
  try {
    const notification = await Notification.create(data);
    
    // Populate sender info for the frontend UI
    const populated = await Notification.findById(notification._id)
      .populate('sender', 'name avatar username');

    // Emit to the specific user's room
    if (global.io) {
      global.io.to(data.recipient.toString()).emit('new_notification', populated);
    }
    
    return populated;
  } catch (err) {
    console.error('Notification Helper Error:', err);
    return null;
  }
};

module.exports = { createNotification };
