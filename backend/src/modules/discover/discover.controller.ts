import { Request, Response } from 'express';
import { supabaseAdmin as supabase } from '../../config/supabase.js';

export const getDiscoverUsers = async (req: Request, res: Response) => {
  try {
    const { search } = req.query;
    
    let query = supabase
      .from('extended_profiles')
      .select('id, initials, full_name, role_title, university, location, bio, skills, avatar_url');

    if (search) {
      // Basic search on name or skills
      query = query.or(`full_name.ilike.%${search}%,skills.cs.{${search}}`);
    }

    const { data: users, error } = await query.limit(20);

    if (error) throw error;

    res.status(200).json({
      success: true,
      data: users || []
    });

  } catch (error: any) {
    console.error('Error fetching discover users:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
