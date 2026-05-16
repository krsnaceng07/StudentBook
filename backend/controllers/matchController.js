const { supabaseAdmin } = require('../config/supabase');

const getSuggestedUsers = async (req, res) => res.json({ success: true, data: [] });
const getUnifiedSuggestions = async (req, res) => res.json({ success: true, data: [] });

module.exports = { getSuggestedUsers, getUnifiedSuggestions };
