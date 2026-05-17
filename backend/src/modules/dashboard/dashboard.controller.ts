import { Request, Response } from 'express';
import { supabaseAdmin as supabase } from '../../config/supabase.js';

export const getDashboardHome = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });

    // 1. Fetch user's profile
    const { data: profile, error: profileErr } = await supabase
      .from('extended_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    // 2. Fetch connections count (status = 'accepted' and sender_id = userId OR receiver_id = userId)
    const { count: connectionsCount, error: connErr } = await supabase
      .from('connections')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'accepted')
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`);

    // 3. Fetch bookmarks count
    const { count: bookmarksCount, error: bookmarkErr } = await supabase
      .from('event_bookmarks')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    // 4. Fetch pending requests count (status = 'pending' and receiver_id = userId)
    const { count: pendingCount, error: pendingErr } = await supabase
      .from('connections')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')
      .eq('receiver_id', userId);

    // 5. Fetch upcoming events (ordered by date ascending)
    const { data: upcomingEvents, error: eventsErr } = await supabase
      .from('events')
      .select('*')
      .order('event_date', { ascending: true })
      .limit(3);

    if (profileErr && profileErr.code !== 'PGRST116') throw profileErr;
    if (connErr) throw connErr;
    if (bookmarkErr) throw bookmarkErr;
    if (pendingErr) throw pendingErr;
    if (eventsErr) throw eventsErr;

    res.status(200).json({
      success: true,
      data: {
        profile: profile || { full_name: 'Aarav Sharma', university: 'Tribhuvan University' },
        stats: {
          connections: connectionsCount || 0,
          bookmarks: bookmarksCount || 0,
          pending: pendingCount || 0
        },
        upcomingEvents: upcomingEvents || []
      }
    });
  } catch (error: any) {
    console.error('Error fetching dashboard home:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getCollegeDashboard = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });

    // 1. Fetch count of active events by this college
    const { count: eventsCount, error: eventsErr } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true })
      .eq('author_id', userId);

    // 2. Fetch the latest 5 events authored by this college
    const { data: recentEvents, error: recentErr } = await supabase
      .from('events')
      .select('*')
      .eq('author_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    if (eventsErr) throw eventsErr;
    if (recentErr) throw recentErr;

    // 3. Mock total reach based on active events
    const totalReach = (eventsCount || 0) * 125 + 50;

    res.status(200).json({
      success: true,
      data: {
        stats: {
          activeEvents: eventsCount || 0,
          totalReach: totalReach
        },
        recentEvents: recentEvents || []
      }
    });
  } catch (error: any) {
    console.error('Error fetching college dashboard:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
