const { supabaseAdmin } = require('../config/supabase');

const createNotification = async (data) => {
  try {
    const { data: notification, error } = await supabaseAdmin
      .from('notifications')
      .insert([{
        user_id: data.recipient,
        sender_id: data.sender,
        type: data.type,
        message: data.message,
        related_id: data.relatedId
      }])
      .select('*, sender:profiles!sender_id(name, avatar, username)')
      .single();

    if (error) throw error;
    
    // Emit to the specific user's room
    if (global.io) {
      global.io.to(data.recipient.toString()).emit('new_notification', notification);
      console.log(`[Socket] Notification sent to user: ${data.recipient}`);
    }
    
    return notification;
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
    const { error } = await supabaseAdmin
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);
      
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Mark All As Read Error:', err);
    return false;
  }
};

module.exports = { createNotification, markAllAsRead };
