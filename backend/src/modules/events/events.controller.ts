import { Request, Response } from 'express';
import { supabaseAdmin as supabase } from '../../config/supabase.js';

export const getEvents = async (req: Request, res: Response) => {
  try {
    const { type } = req.query;

    let query = supabase
      .from('events')
      .select('id, title, description, event_type, organizer, event_date, location')
      .order('event_date', { ascending: true });

    if (type && typeof type === 'string') {
      query = query.eq('event_type', type);
    }

    const { data: events, error } = await query.limit(20);

    if (error) throw error;

    res.status(200).json({ success: true, data: events || [] });
  } catch (error: any) {
    console.error('Error fetching events:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
