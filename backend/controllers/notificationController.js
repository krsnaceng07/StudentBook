const { supabaseAdmin } = require('../config/supabase');

const getNotifications = async (req, res) => res.json({ success: true, data: [] });
const markAsRead = async (req, res) => res.json({ success: true });
const markAllAsRead = async (req, res) => res.json({ success: true });
const deleteNotification = async (req, res) => res.json({ success: true });

module.exports = { getNotifications, markAsRead, markAllAsRead, deleteNotification };
