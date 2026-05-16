const { supabaseAdmin } = require('../config/supabase');

const unifiedSearch = async (req, res) => res.json({ success: true, data: { users: [], posts: [], teams: [] } });
const searchAll = async (req, res) => res.json({ success: true, data: { users: [], posts: [], teams: [] } });

module.exports = { searchAll, unifiedSearch };
