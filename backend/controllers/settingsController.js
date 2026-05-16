const { supabaseAdmin } = require('../config/supabase');

const getSettings = async (req, res) => res.json({ success: true, data: {} });
const updateSettings = async (req, res) => res.json({ success: true, data: {} });
const changePassword = async (req, res) => res.json({ success: true });
const updateEmail = async (req, res) => res.json({ success: true });
const deleteAccount = async (req, res) => res.json({ success: true });

module.exports = { getSettings, updateSettings, changePassword, updateEmail, deleteAccount };
