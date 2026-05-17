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

export const getProfileById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, error: 'User ID is required' });

    const { data: profile, error } = await supabase
      .from('extended_profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ success: false, error: 'Profile not found' });
      }
      throw error;
    }

    res.status(200).json({ 
      success: true, 
      data: {
        profile
      }
    });
  } catch (error: any) {
    console.error('Error fetching profile by ID:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
