import { Request, Response } from 'express';
import { supabaseAdmin as supabase } from '../../config/supabase.js';

export const getEvents = async (req: Request, res: Response) => {
  try {
    const { type } = req.query;
    const userId = (req as any).user?.id;

    let query = supabase
      .from('events')
      .select('*')
      .order('event_date', { ascending: true });

    if (type && typeof type === 'string') {
      query = query.eq('event_type', type);
    }

    const { data: events, error } = await query.limit(20);

    if (error) throw error;

    let bookmarkedEventIds = new Set<string>();
    
    if (userId && events && events.length > 0) {
      const { data: bookmarks } = await supabase
        .from('event_bookmarks')
        .select('event_id')
        .eq('user_id', userId);
        
      if (bookmarks) {
        bookmarks.forEach(b => bookmarkedEventIds.add(b.event_id));
      }
    }

    const eventsWithBookmarks = (events || []).map(e => ({
      ...e,
      isBookmarked: bookmarkedEventIds.has(e.id)
    }));

    res.status(200).json({ success: true, data: eventsWithBookmarks });
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

export const getEventById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id || typeof id !== 'string') return res.status(400).json({ success: false, error: 'Event ID is required' });

    // Validate UUID format before querying database to prevent Postgres syntax errors
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return res.status(400).json({ success: false, error: 'Invalid Event ID format' });
    }

    const { data: event, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!event) return res.status(404).json({ success: false, error: 'Event not found' });

    // Fetch bookmark status for current user if authenticated
    const userId = (req as any).user?.id;
    let isBookmarked = false;
    if (userId) {
      const { data: bookmark } = await supabase
        .from('event_bookmarks')
        .select('*')
        .eq('user_id', userId)
        .eq('event_id', id)
        .maybeSingle();
      isBookmarked = !!bookmark;
    }

    res.status(200).json({ success: true, data: { ...event, isBookmarked } });
  } catch (error: any) {
    console.error('Error fetching event by ID:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createEvent = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const { 
      title, 
      description, 
      event_date, 
      location, 
      event_type, 
      tags, 
      member_limit,
      reg_deadline,
      is_online,
      min_team,
      max_team,
      prize_pool
    } = req.body;

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
        organizer: organizerName,
        reg_deadline,
        is_online: !!is_online,
        min_team: min_team ? parseInt(min_team) : 2,
        max_team: max_team ? parseInt(max_team) : 4,
        prize_pool
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

export const bookmarkEvent = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { id } = req.params;

    if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });
    if (!id) return res.status(400).json({ success: false, error: 'Event ID is required' });

    const { data, error } = await supabase
      .from('event_bookmarks')
      .insert([{ user_id: userId, event_id: id }])
      .select()
      .single();

    if (error) {
      // If already bookmarked (unique constraint violation), we can return success true as it's already done
      if (error.code === '23505') {
        return res.status(200).json({ success: true, message: 'Already bookmarked' });
      }
      throw error;
    }

    res.status(201).json({ success: true, data });
  } catch (error: any) {
    console.error('Error bookmarking event:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const unbookmarkEvent = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { id } = req.params;

    if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });
    if (!id) return res.status(400).json({ success: false, error: 'Event ID is required' });

    const { error } = await supabase
      .from('event_bookmarks')
      .delete()
      .eq('user_id', userId)
      .eq('event_id', id);

    if (error) throw error;

    res.status(200).json({ success: true, message: 'Event unbookmarked successfully' });
  } catch (error: any) {
    console.error('Error unbookmarking event:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
