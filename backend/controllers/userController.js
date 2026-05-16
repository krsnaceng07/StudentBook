const { supabaseAdmin } = require('../config/supabase');

// @desc    Discover users with advanced filters and matching
// @route   GET /api/v1/users/discover
// @access  Private
const discoverUsers = async (req, res) => {
  try {
    const page = Math.min(parseInt(req.query.page) || 1, 100);
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const skip = (page - 1) * limit;

    const { search, field, skills } = req.query;
    const currentUserId = req.user.id; // from protect middleware

    const myProfile = req.user;
    const discoveryFilter = myProfile?.discovery_field_filter || 'all';

    // Build the Supabase query for profiles
    let query = supabaseAdmin
      .from('profiles')
      .select('*')
      .neq('id', currentUserId)
      .neq('status', 'banned');

    if (discoveryFilter === 'same_field' && myProfile?.field) {
      query = query.ilike('field', myProfile.field);
    }
    if (field && typeof field === 'string') {
      query = query.ilike('field', `%${field}%`);
    }

    const { data: profiles, error } = await query;

    if (error) {
      throw error;
    }

    let filteredProfiles = profiles;

    // Client-side filtering for search and skills (since complex SQL is better handled via RPC in Supabase)
    if (search && typeof search === 'string' && search.trim()) {
      const searchLower = search.trim().toLowerCase();
      filteredProfiles = filteredProfiles.filter(p => 
        (p.name && p.name.toLowerCase().includes(searchLower)) ||
        (p.username && p.username.toLowerCase().includes(searchLower)) ||
        (p.headline && p.headline.toLowerCase().includes(searchLower)) ||
        (p.skills && p.skills.some(s => s.toLowerCase().includes(searchLower)))
      );
    }

    if (skills) {
      const skillArray = Array.isArray(skills) ? skills : [skills];
      const searchSkills = skillArray.map(s => s.toLowerCase());
      filteredProfiles = filteredProfiles.filter(p => 
        p.skills && p.skills.some(s => searchSkills.includes(s.toLowerCase()))
      );
    }

    // Fetch connections to exclude and calculate mutuals
    const { data: connections } = await supabaseAdmin
      .from('connections')
      .select('*')
      .or(`user1_id.eq.${currentUserId},user2_id.eq.${currentUserId}`)
      .in('status', ['accepted', 'pending']);

    const connectedIds = new Set(
      (connections || []).map(c => c.user1_id === currentUserId ? c.user2_id : c.user1_id)
    );

    filteredProfiles = filteredProfiles.filter(p => !connectedIds.has(p.id));

    // Scoring
    const enhancedUsers = filteredProfiles.map(u => {
      let score = 0;
      const reasons = [];
      
      const commonSkills = u.skills?.filter(s => 
        myProfile?.skills?.some(ms => ms.toLowerCase() === s.toLowerCase())
      ) || [];

      const commonGoals = u.goals?.filter(g => 
        myProfile?.goals?.some(mg => mg.toLowerCase() === g.toLowerCase())
      ) || [];

      if (myProfile) {
        if (u.field && myProfile.field?.toLowerCase() === u.field.toLowerCase()) {
          score += 40;
          reasons.push(`Same field: ${u.field}`);
        }
        
        if (commonSkills.length > 0) {
          score += Math.min(30, commonSkills.length * 10);
          reasons.push(`${commonSkills.length} matching skills`);
        }

        if (commonGoals.length > 0) {
          score += Math.min(20, commonGoals.length * 5);
          reasons.push(`${commonGoals.length} shared goals`);
        }
      }

      return {
        ...u,
        userId: u.id,
        commonSkills,
        commonGoals,
        matchScore: Math.min(100, score),
        matchReasons: reasons,
        collabPotential: score > 60
      };
    }).sort((a, b) => b.matchScore - a.matchScore);

    const total = enhancedUsers.length;
    const paginatedUsers = enhancedUsers.slice(skip, skip + limit);

    res.json({
      success: true,
      data: {
        users: paginatedUsers,
        pagination: { page, limit, total }
      }
    });
  } catch (err) {
    console.error('Discover Error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || typeof q !== 'string') {
      return res.json({ success: true, data: { users: [] } });
    }

    const { data: users, error } = await supabaseAdmin
      .from('profiles')
      .select('id, name, username, avatar, field')
      .or(`name.ilike.%${q}%,username.ilike.%${q}%`)
      .neq('status', 'banned')
      .limit(10);

    if (error) throw error;

    const results = users.map(user => ({
      userId: user.id,
      name: user.name,
      username: user.username,
      avatar: user.avatar,
      field: user.field
    }));

    res.json({
      success: true,
      data: {
        users: results
      }
    });
  } catch (err) {
    console.error('Search Error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { discoverUsers, searchUsers };
