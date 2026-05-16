const { supabaseAdmin } = require('../config/supabase');

const getConversations = async (req, res) => {
  try {
    const { data: participants } = await supabaseAdmin
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', req.user.id);

    const convIds = (participants || []).map(p => p.conversation_id);

    if (convIds.length === 0) {
      return res.json({ success: true, data: [] });
    }

    const { data: conversations, error } = await supabaseAdmin
      .from('conversations')
      .select(`
        *,
        participants:conversation_participants(user:profiles!user_id(id, name, username, avatar))
      `)
      .in('id', convIds)
      .order('last_message_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, data: conversations });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { data: messages, error } = await supabaseAdmin
      .from('messages')
      .select('*, sender:profiles!sender_id(id, name, avatar)')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    res.json({ success: true, data: messages });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { text } = req.body;

    const { data: message, error } = await supabaseAdmin
      .from('messages')
      .insert([{
        conversation_id: conversationId,
        sender_id: req.user.id,
        text
      }])
      .select('*, sender:profiles!sender_id(id, name, avatar)')
      .single();

    if (error) throw error;

    await supabaseAdmin
      .from('conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', conversationId);

    res.status(201).json({ success: true, data: message });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const createConversation = async (req, res) => res.json({ success: true, data: {} });
const toggleReaction = async (req, res) => res.json({ success: true, data: {} });
const markAsSeen = async (req, res) => res.json({ success: true });
const deleteMessage = async (req, res) => res.json({ success: true });

module.exports = { 
  getConversations, 
  getMessages, 
  sendMessage,
  createConversation,
  toggleReaction,
  markAsSeen,
  deleteMessage
};
