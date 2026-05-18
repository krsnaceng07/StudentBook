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

export const getMyEvents = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const { data: events, error } = await supabase
      .from('events')
      .select('*')
      .eq('author_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.status(200).json({ success: true, data: events || [] });
  } catch (error: any) {
    console.error('Error fetching my events:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createEvent = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const { title, description, event_date, location, event_type, tags, member_limit } = req.body;

    // Fetch organizer name dynamically from extended_profiles table
    const { data: profile } = await supabase
      .from('extended_profiles')
      .select('full_name')
      .eq('id', userId)
      .single();

    const organizerName = profile?.full_name || 'College';

    const { data: event, error } = await supabase
      .from('events')
      .insert([{
        author_id: userId,
        title,
        description,
        event_date,
        location,
        event_type,
        tags: tags || [],
        member_limit,
        organizer: organizerName
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ success: true, data: event });
  } catch (error: any) {
    console.error('Error creating event:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteEvent = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { id } = req.params;
    
    if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id)
      .eq('author_id', userId); // Ensure only the author can delete

    if (error) throw error;

    res.status(200).json({ success: true, data: { id } });
  } catch (error: any) {
    console.error('Error deleting event:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
