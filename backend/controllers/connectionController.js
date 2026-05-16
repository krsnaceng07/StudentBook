const { supabaseAdmin } = require('../config/supabase');

const getConnections = async (req, res) => {
  try {
    const { data: connections, error } = await supabaseAdmin
      .from('connections')
      .select(`
        *,
        user1:profiles!user1_id(id, name, username, avatar),
        user2:profiles!user2_id(id, name, username, avatar)
      `)
      .or(`user1_id.eq.${req.user.id},user2_id.eq.${req.user.id}`)
      .eq('status', 'accepted');

    if (error) throw error;

    const formatted = connections.map(conn => ({
      id: conn.id,
      user: conn.user1_id === req.user.id ? conn.user2 : conn.user1,
      status: conn.status
    }));

    res.json({ success: true, data: formatted });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const sendConnectionRequest = async (req, res) => {
  try {
    const { recipientId } = req.body;
    
    // Simplistic check
    const { data: existing } = await supabaseAdmin
      .from('connections')
      .select('id')
      .or(`and(user1_id.eq.${req.user.id},user2_id.eq.${recipientId}),and(user1_id.eq.${recipientId},user2_id.eq.${req.user.id})`)
      .single();

    if (existing) return res.status(400).json({ success: false, message: 'Connection already exists' });

    const { data: conn, error } = await supabaseAdmin
      .from('connections')
      .insert([{ user1_id: req.user.id, user2_id: recipientId, status: 'pending' }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ success: true, data: conn });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const acceptConnectionRequest = async (req, res) => {
  try {
    const { connectionId } = req.params;
    const { data: conn, error } = await supabaseAdmin
      .from('connections')
      .update({ status: 'accepted' })
      .eq('id', connectionId)
      .eq('user2_id', req.user.id) // only recipient can accept
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, data: conn });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const cancelConnectionRequest = async (req, res) => res.json({ success: true, message: 'Not implemented' });
const rejectConnectionRequest = async (req, res) => res.json({ success: true, message: 'Not implemented' });
const disconnectUser = async (req, res) => res.json({ success: true, message: 'Not implemented' });
const getPendingRequests = async (req, res) => res.json({ success: true, data: [] });
const getConnectionStatus = async (req, res) => res.json({ success: true, data: 'none' });

module.exports = { 
  getConnections, 
  sendConnectionRequest, 
  acceptConnectionRequest,
  cancelConnectionRequest,
  rejectConnectionRequest,
  disconnectUser,
  getPendingRequests,
  getConnectionStatus
};
