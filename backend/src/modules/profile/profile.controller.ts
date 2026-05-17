import { Request, Response } from 'express';
import { supabaseAdmin as supabase } from '../../config/supabase.js';

export const getMe = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const { data: profile, error } = await supabase
      .from('extended_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    // Mock stats for now
    const stats = {
      connections: 12,
      events_joined: 3,
      teams: 2,
    };

    res.status(200).json({ 
      success: true, 
      data: {
        profile,
        stats
      }
    });
  } catch (error: any) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
