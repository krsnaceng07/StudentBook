import { Request, Response } from 'express';
import { supabaseAdmin as supabase } from '../../config/supabase.js';

export const getDiscoverUsers = async (req: Request, res: Response) => {
  try {
    const { search } = req.query;
    
    let query = supabase
      .from('extended_profiles')
      .select('id, initials, full_name, role_title, university, location, bio, skills, avatar_url');

    if (search && typeof search === 'string') {
      // Secure Whitelist Sanitization: block any SQL/NoSQL/PostgREST injection or query parser corruption by stripping non-alphanumeric/spaces
      const safeSearch = search.replace(/[^a-zA-Z0-9\s]/g, '').trim();
      
      if (safeSearch) {
        query = query.or(`full_name.ilike.%${safeSearch}%,skills.cs.{${safeSearch}}`);
      }
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
