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

    // Fetch live stats for connections and events
    const { count: connectionsCount } = await supabase
      .from('connections')
      .select('*', { count: 'exact', head: true })
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .eq('status', 'accepted');

    const { count: eventsJoinedCount } = await supabase
      .from('event_registrations')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    const { count: requestsSentCount } = await supabase
      .from('connections')
      .select('*', { count: 'exact', head: true })
      .eq('sender_id', userId);

    const stats = {
      connections: connectionsCount || 0,
      events_joined: eventsJoinedCount || 0,
      requests_sent: requestsSentCount || 0,
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

    // Fetch live stats for connections and events
    const { count: connectionsCount } = await supabase
      .from('connections')
      .select('*', { count: 'exact', head: true })
      .or(`sender_id.eq.${id},receiver_id.eq.${id}`)
      .eq('status', 'accepted');

    const { count: eventsJoinedCount } = await supabase
      .from('event_registrations')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', id);

    const stats = {
      connections: connectionsCount || 0,
      events_joined: eventsJoinedCount || 0,
    };

    // Fetch connection status with current user
    const currentUserId = (req as any).user?.id;
    let connection_info = null;

    if (currentUserId && currentUserId !== id) {
      const { data: conn } = await supabase
        .from('connections')
        .select('id, status, sender_id, receiver_id')
        .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${id}),and(sender_id.eq.${id},receiver_id.eq.${currentUserId})`)
        .single();
      
      if (conn) {
        connection_info = {
          id: conn.id,
          status: conn.status,
          is_sender: conn.sender_id === currentUserId
        };
        
        if (conn.status === 'accepted') {
           const { data: convs } = await supabase
             .from('conversation_participants')
             .select('conversation_id')
             .eq('user_id', currentUserId);
           if (convs && convs.length > 0) {
             const convIds = convs.map((c: any) => c.conversation_id);
             const { data: shared } = await supabase
               .from('conversation_participants')
               .select('conversation_id')
               .in('conversation_id', convIds)
               .eq('user_id', id)
               .limit(1);
             if (shared && shared.length > 0) {
               connection_info.conversation_id = shared[0].conversation_id;
             }
           }
        }
      }
    }

    res.status(200).json({ 
      success: true, 
      data: {
        profile,
        stats,
        connection_info
      }
    });
  } catch (error: any) {
    console.error('Error fetching profile by ID:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const {
      full_name,
      university,
      department,
      university_year,
      bio,
      skills,
      interests,
      social_links,
      availability,
      goal,
      college_type,
      established_year,
      website,
      contact_email,
      settings_push,
      settings_email,
      settings_visibility,
      notif_collab_requests,
      notif_request_accepted,
      notif_new_messages,
      notif_event_reminders,
      notif_new_events,
      notif_weekly_digest,
      notif_email_collab,
      notif_email_messages,
      notif_email_events,
      notif_email_digest,
      privacy_show_online,
      privacy_show_github,
      privacy_allow_requests,
      privacy_show_college,
      privacy_show_availability,
      privacy_show_in_search,
      appearance_theme,
      appearance_accent,
      appearance_font_size
    } = req.body;

    // 1. Calculate initials if full_name is provided
    let initials = undefined;
    if (full_name) {
      initials = full_name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 3);
    }

    // 2. Perform upsert in public.extended_profiles
    const updateData: any = {
      id: userId,
      updated_at: new Date().toISOString(),
    };

    if (full_name !== undefined) updateData.full_name = full_name;
    if (initials !== undefined) updateData.initials = initials;
    if (university !== undefined) updateData.university = university;
    if (department !== undefined) updateData.department = department;
    if (university_year !== undefined) updateData.university_year = university_year;
    if (bio !== undefined) updateData.bio = bio;
    if (skills !== undefined) updateData.skills = skills;
    if (interests !== undefined) updateData.interests = interests;
    if (social_links !== undefined) updateData.social_links = social_links;
    if (availability !== undefined) updateData.availability = availability;
    if (goal !== undefined) updateData.goal = goal;
    if (college_type !== undefined) updateData.college_type = college_type;
    if (established_year !== undefined) updateData.established_year = established_year;
    if (website !== undefined) updateData.website = website;
    if (contact_email !== undefined) updateData.contact_email = contact_email;
    if (settings_push !== undefined) updateData.settings_push = settings_push;
    if (settings_email !== undefined) updateData.settings_email = settings_email;
    if (settings_visibility !== undefined) updateData.settings_visibility = settings_visibility;
    
    // New Settings
    if (notif_collab_requests !== undefined) updateData.notif_collab_requests = notif_collab_requests;
    if (notif_request_accepted !== undefined) updateData.notif_request_accepted = notif_request_accepted;
    if (notif_new_messages !== undefined) updateData.notif_new_messages = notif_new_messages;
    if (notif_event_reminders !== undefined) updateData.notif_event_reminders = notif_event_reminders;
    if (notif_new_events !== undefined) updateData.notif_new_events = notif_new_events;
    if (notif_weekly_digest !== undefined) updateData.notif_weekly_digest = notif_weekly_digest;
    if (notif_email_collab !== undefined) updateData.notif_email_collab = notif_email_collab;
    if (notif_email_messages !== undefined) updateData.notif_email_messages = notif_email_messages;
    if (notif_email_events !== undefined) updateData.notif_email_events = notif_email_events;
    if (notif_email_digest !== undefined) updateData.notif_email_digest = notif_email_digest;
    
    if (privacy_show_online !== undefined) updateData.privacy_show_online = privacy_show_online;
    if (privacy_show_github !== undefined) updateData.privacy_show_github = privacy_show_github;
    if (privacy_allow_requests !== undefined) updateData.privacy_allow_requests = privacy_allow_requests;
    if (privacy_show_college !== undefined) updateData.privacy_show_college = privacy_show_college;
    if (privacy_show_availability !== undefined) updateData.privacy_show_availability = privacy_show_availability;
    if (privacy_show_in_search !== undefined) updateData.privacy_show_in_search = privacy_show_in_search;
    
    if (appearance_theme !== undefined) updateData.appearance_theme = appearance_theme;
    if (appearance_accent !== undefined) updateData.appearance_accent = appearance_accent;
    if (appearance_font_size !== undefined) updateData.appearance_font_size = appearance_font_size;

    const { data: updatedProfile, error: profileError } = await supabase
      .from('extended_profiles')
      .upsert(updateData)
      .select('*')
      .single();

    if (profileError) {
      throw profileError;
    }

    res.status(200).json({
      success: true,
      data: {
        profile: updatedProfile
      },
    });
  } catch (error: any) {
    console.error('Error updating profile:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

