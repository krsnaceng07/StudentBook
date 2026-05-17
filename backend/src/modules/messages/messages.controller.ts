import { Request, Response } from 'express';
import { supabaseAdmin as supabase } from '../../config/supabase.js';

export const getInbox = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });

    // Get all conversations the user is a participant of
    const { data: participations, error: partError } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', userId);

    if (partError) throw partError;
    if (!participations || participations.length === 0) {
      return res.status(200).json({ success: true, data: [] });
    }

    const conversationIds = participations.map((p: any) => p.conversation_id);

    // For each conversation, get the last message and the other participant
    const inbox = await Promise.all(
      conversationIds.map(async (convId: string) => {
        // Get last message
        const { data: messages } = await supabase
          .from('messages')
          .select('content, created_at, sender_id')
          .eq('conversation_id', convId)
          .order('created_at', { ascending: false })
          .limit(1);

        const lastMessage = messages?.[0] || null;

        // Get the other participant's profile
        const { data: otherParticipants } = await supabase
          .from('conversation_participants')
          .select('user_id')
          .eq('conversation_id', convId)
          .neq('user_id', userId)
          .limit(1);

        const otherUserId = otherParticipants?.[0]?.user_id;
        let otherUser = null;

        if (otherUserId) {
          const { data: profile } = await supabase
            .from('extended_profiles')
            .select('full_name, initials')
            .eq('id', otherUserId)
            .single();
          otherUser = profile;
        }

        return {
          conversation_id: convId,
          other_user: otherUser,
          last_message: lastMessage?.content || '',
          created_at: lastMessage?.created_at || null,
        };
      })
    );

    res.status(200).json({ success: true, data: inbox });
  } catch (error: any) {
    console.error('Error fetching inbox:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getChatHistory = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const { conversationId } = req.params;

    // Verify participant
    const { data: participation, error: partError } = await supabase
      .from('conversation_participants')
      .select('*')
      .eq('conversation_id', conversationId)
      .eq('user_id', userId)
      .single();

    if (partError || !participation) {
      return res.status(403).json({ success: false, error: 'Forbidden: You are not a participant.' });
    }

    // Fetch messages
    const { data: messages, error: msgError } = await supabase
      .from('messages')
      .select('id, sender_id, content, created_at')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (msgError) throw msgError;

    res.status(200).json({ success: true, data: messages || [] });
  } catch (error: any) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { conversationId, content } = req.body;

    if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });
    if (!conversationId || !content) {
      return res.status(400).json({ success: false, error: 'Conversation ID and content are required' });
    }

    // Verify user is a participant
    const { data: participation, error: partError } = await supabase
      .from('conversation_participants')
      .select('*')
      .eq('conversation_id', conversationId)
      .eq('user_id', userId)
      .single();

    if (partError || !participation) {
      return res.status(403).json({ success: false, error: 'Forbidden: You are not a participant.' });
    }

    // Insert message
    const { data: newMessage, error: msgError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: userId,
        content
      })
      .select()
      .single();

    if (msgError) throw msgError;

    res.status(201).json({ success: true, data: newMessage });
  } catch (error: any) {
    console.error('Error sending message:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
