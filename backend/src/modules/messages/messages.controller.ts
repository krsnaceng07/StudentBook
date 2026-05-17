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
