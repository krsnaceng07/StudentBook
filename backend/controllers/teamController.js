const { supabaseAdmin } = require('../config/supabase');
const Joi = require('joi');
const xss = require('xss');

const teamSchema = Joi.object({
  name: Joi.string().required().max(50),
  description: Joi.string().required().max(500),
  category: Joi.string().valid('Study Group', 'Research', 'Startup', 'Hackathon', 'Competitive Exams', 'Open Source', 'Project', 'Other'),
  tags: Joi.array().items(Joi.string()),
  lookingFor: Joi.array().items(Joi.string()),
  isPublic: Joi.boolean(),
  avatar: Joi.string().allow('')
});

const getTeams = async (req, res) => {
  try {
    const { data: teams, error } = await supabaseAdmin
      .from('teams')
      .select('*, leader:profiles!leader_id(id, name, username, avatar)')
      .eq('is_public', true)
      .neq('status', 'Archived');
      
    if (error) throw error;
    res.json({ success: true, data: teams });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const createTeam = async (req, res) => {
  try {
    const { error } = teamSchema.validate(req.body);
    if (error) return res.status(400).json({ success: false, message: error.details[0].message });

    const { name, description, category, tags, lookingFor, isPublic, avatar } = req.body;

    const { data: team, error: teamError } = await supabaseAdmin
      .from('teams')
      .insert([{
        name: xss(name),
        description: xss(description),
        category: category || 'Study Group',
        tags: tags || [],
        looking_for: lookingFor || [],
        is_public: isPublic !== undefined ? isPublic : true,
        leader_id: req.user.id,
        avatar
      }])
      .select()
      .single();

    if (teamError) throw teamError;

    // Add leader to team_members
    await supabaseAdmin
      .from('team_members')
      .insert([{ team_id: team.id, user_id: req.user.id, role: 'leader' }]);

    res.status(201).json({ success: true, data: team });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getTeamById = async (req, res) => {
  try {
    const { data: team, error } = await supabaseAdmin
      .from('teams')
      .select('*, leader:profiles!leader_id(id, name, username, avatar)')
      .eq('id', req.params.id)
      .single();

    if (error || !team) return res.status(404).json({ success: false, message: 'Team not found' });

    const { data: members } = await supabaseAdmin
      .from('team_members')
      .select('role, user:profiles!user_id(id, name, username, avatar)')
      .eq('team_id', team.id);

    res.json({ success: true, data: { ...team, members } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const joinTeam = async (req, res) => res.json({ success: true, message: 'Not implemented in v2 yet' });
const leaveTeam = async (req, res) => res.json({ success: true, message: 'Not implemented in v2 yet' });

const updateTeam = async (req, res) => res.json({ success: true, data: {} });
const requestJoinTeam = async (req, res) => res.json({ success: true, data: {} });
const cancelJoinRequest = async (req, res) => res.json({ success: true });
const handleJoinRequest = async (req, res) => res.json({ success: true, data: {} });
const getTeamRequests = async (req, res) => res.json({ success: true, data: [] });
const manageTeamMember = async (req, res) => res.json({ success: true, data: {} });
const updateTeamLinks = async (req, res) => res.json({ success: true, data: {} });
const deleteTeam = async (req, res) => res.json({ success: true });

module.exports = { 
  getTeams, 
  createTeam, 
  getTeamById, 
  joinTeam, 
  leaveTeam,
  updateTeam,
  requestJoinTeam,
  cancelJoinRequest,
  handleJoinRequest,
  getTeamRequests,
  manageTeamMember,
  updateTeamLinks,
  deleteTeam
};
