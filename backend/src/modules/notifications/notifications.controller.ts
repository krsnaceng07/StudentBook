import { Request, Response } from 'express';
import { supabaseAdmin as supabase } from '../../config/supabase.js';

export const getNotifications = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*, actor:actor_id(initials, full_name)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Mocking the split between New and Earlier for demonstration
    // Assuming first 2 are new, rest are earlier
    const mockNew = notifications?.slice(0, 2) || [];
    const mockEarlier = notifications?.slice(2) || [];

    res.status(200).json({
      success: true,
      data: {
        new: mockNew,
        earlier: mockEarlier
      }
    });
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
