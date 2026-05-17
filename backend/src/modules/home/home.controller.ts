import { Request, Response } from 'express';
import { supabase } from '../../config/supabase.js';

export const getHomeData = async (req: Request, res: Response) => {
  try {
    // 1. Fetch Suggested Teammates (randomly sampled or just top 5)
    const { data: teammates, error: teammatesError } = await supabase
      .from('extended_profiles')
      .select('id, initials, full_name, role_title, location, skills, avatar_url')
      .limit(5);

    if (teammatesError) throw teammatesError;

    // 2. Fetch Upcoming Events
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('id, title, description, event_date, location, banner_url')
      .order('event_date', { ascending: true })
      .limit(3);

    if (eventsError) throw eventsError;

    // 3. Fetch Recent Activity
    const { data: activities, error: actError } = await supabase
      .from('activities')
      .select(`
        id, 
        action_type, 
        description, 
        created_at, 
        profiles!activities_user_id_fkey(email),
        extended_profiles!activities_user_id_fkey(full_name, initials, avatar_url)
      `)
      .order('created_at', { ascending: false })
      .limit(10);

    if (actError) throw actError;

    // Aggregate and return
    res.status(200).json({
      success: true,
      data: {
        suggestedTeammates: teammates || [],
        upcomingEvents: events || [],
        recentActivity: activities || []
      }
    });

  } catch (error: any) {
    console.error('Error fetching home data:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
