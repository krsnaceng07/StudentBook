const Notification = require('../models/Notification');
const Profile = require('../models/Profile');

// @desc    Get all notifications for current user
// @route   GET /api/v1/notifications
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .populate('sender', 'name username')
      .populate('post', 'content');

    // Fetch sender avatars/profiles in batch
    const senderIds = [...new Set(notifications.map(n => n.sender._id))];
    const profiles = await Profile.find({ userId: { $in: senderIds } });
    const profileMap = new Map(profiles.map(p => [p.userId.toString(), p]));

    const formatted = notifications.map(notif => ({
      ...notif._doc,
      sender: {
        ...notif.sender._doc,
        avatar: profileMap.get(notif.sender._id.toString())?.avatar || null
      }
    }));

    res.json({ success: true, data: formatted });
  } catch (err) {
    console.error('Get Notifications Error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/v1/notifications/:id/read
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    res.json({ success: true, data: notification });
  } catch (err) {
    console.error('Mark Read Error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/v1/notifications/read-all
const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { isRead: true }
    );

    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    console.error('Mark All Read Error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead
};
