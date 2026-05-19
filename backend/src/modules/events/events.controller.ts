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
    let registeredEventIds = new Set<string>();
    let registrationCounts: { [key: string]: number } = {};

    if (events && events.length > 0) {
      const eventIds = events.map(e => e.id);

      // Batch query bookmark status
      if (userId) {
        const { data: bookmarks } = await supabase
          .from('event_bookmarks')
          .select('event_id')
          .eq('user_id', userId);
          
        if (bookmarks) {
          bookmarks.forEach(b => bookmarkedEventIds.add(b.event_id));
        }

        // Batch query internal registrations for this student
        const { data: studentRegs } = await supabase
          .from('event_registrations')
          .select('event_id')
          .eq('user_id', userId);
        
        if (studentRegs) {
          studentRegs.forEach(r => registeredEventIds.add(r.event_id));
        }
      }

      // Batch query registration counts for all listed events
      const { data: allRegs } = await supabase
        .from('event_registrations')
        .select('event_id')
        .in('event_id', eventIds);

      if (allRegs) {
        allRegs.forEach(r => {
          registrationCounts[r.event_id] = (registrationCounts[r.event_id] || 0) + 1;
        });
      }
    }

    const eventsExtended = (events || []).map(e => ({
      ...e,
      isBookmarked: bookmarkedEventIds.has(e.id),
      isRegistered: registeredEventIds.has(e.id),
      registrationCount: registrationCounts[e.id] || 0
    }));

    res.status(200).json({ success: true, data: eventsExtended });
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

    let registrationCounts: { [key: string]: number } = {};

    if (events && events.length > 0) {
      const eventIds = events.map(e => e.id);
      const { data: regs } = await supabase
        .from('event_registrations')
        .select('event_id')
        .in('event_id', eventIds);

      if (regs) {
        regs.forEach(r => {
          registrationCounts[r.event_id] = (registrationCounts[r.event_id] || 0) + 1;
        });
      }
    }

    const eventsExtended = (events || []).map(e => ({
      ...e,
      registrationCount: registrationCounts[e.id] || 0
    }));

    res.status(200).json({ success: true, data: eventsExtended });
  } catch (error: any) {
    console.error('Error fetching my events:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getEventById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id || typeof id !== 'string') return res.status(400).json({ success: false, error: 'Event ID is required' });

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

    const userId = (req as any).user?.id;
    let isBookmarked = false;
    let isRegistered = false;
    let registrationDetails = null;

    if (userId) {
      const { data: bookmark } = await supabase
        .from('event_bookmarks')
        .select('*')
        .eq('user_id', userId)
        .eq('event_id', id)
        .maybeSingle();
      isBookmarked = !!bookmark;

      const { data: registration } = await supabase
        .from('event_registrations')
        .select('*')
        .eq('user_id', userId)
        .eq('event_id', id)
        .maybeSingle();
      isRegistered = !!registration;
      registrationDetails = registration ? registration.registration_details : null;
    }

    const { count: regCount } = await supabase
      .from('event_registrations')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', id);

    res.status(200).json({ 
      success: true, 
      data: { 
        ...event, 
        isBookmarked, 
        isRegistered,
        registrationDetails,
        registrationCount: regCount || 0
      } 
    });
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
      prize_pool,
      registration_type,
      external_link,
      custom_form_config
    } = req.body;

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
        prize_pool,
        registration_type: registration_type || 'internal',
        external_link: registration_type === 'external' ? external_link : null,
        custom_form_config: custom_form_config || null
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
      .eq('author_id', userId);

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

// ==========================================
// Student Internals: Register & Unregister
// ==========================================

export const registerForEvent = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { id: eventId } = req.params;

    if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });
    if (!eventId) return res.status(400).json({ success: false, error: 'Event ID is required' });

    // Validate Event existence and check type
    const { data: event, error: eventErr } = await supabase
      .from('events')
      .select('title, author_id, registration_type')
      .eq('id', eventId)
      .single();

    if (eventErr || !event) {
      return res.status(404).json({ success: false, error: 'Event not found' });
    }

    if (event.registration_type === 'external') {
      return res.status(400).json({ success: false, error: 'This event requires external registration' });
    }

    const { registration_details } = req.body;

    // Insert registration record
    const { data: newReg, error: regErr } = await supabase
      .from('event_registrations')
      .insert({ 
        event_id: eventId, 
        user_id: userId,
        registration_details: registration_details || {}
      })
      .select()
      .single();

    if (regErr) {
      if (regErr.code === '23505') {
        return res.status(400).json({ success: false, error: 'You are already registered for this event' });
      }
      throw regErr;
    }

    // Fetch registering student's name
    const { data: studentProfile } = await supabase
      .from('extended_profiles')
      .select('full_name')
      .eq('id', userId)
      .single();

    const studentName = studentProfile?.full_name || 'A classmate';

    // Log Activity for Student
    await supabase.from('activities').insert({
      user_id: userId,
      action_type: 'event_registration',
      description: `Registered for event: ${event.title}`
    });

    // Notify Organizing College
    if (event.author_id) {
      await supabase.from('notifications').insert({
        user_id: event.author_id,
        actor_id: userId,
        type: 'event_post',
        content: `${studentName} registered for your event: ${event.title}`
      });
    }

    res.status(201).json({
      success: true,
      message: 'Successfully registered for event',
      data: newReg
    });
  } catch (error: any) {
    console.error('Error registering for event:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const unregisterFromEvent = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { id: eventId } = req.params;

    if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });
    if (!eventId) return res.status(400).json({ success: false, error: 'Event ID is required' });

    // Validate Event existence
    const { data: event, error: eventErr } = await supabase
      .from('events')
      .select('title')
      .eq('id', eventId)
      .single();

    if (eventErr || !event) {
      return res.status(404).json({ success: false, error: 'Event not found' });
    }

    const { error: deleteErr } = await supabase
      .from('event_registrations')
      .delete()
      .eq('event_id', eventId)
      .eq('user_id', userId);

    if (deleteErr) throw deleteErr;

    // Log Activity for Student
    await supabase.from('activities').insert({
      user_id: userId,
      action_type: 'event_unregistration',
      description: `Cancelled registration for event: ${event.title}`
    });

    res.status(200).json({
      success: true,
      message: 'Successfully unregistered from event'
    });
  } catch (error: any) {
    console.error('Error unregistering from event:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ==========================================
// College Internals: Roster Audit
// ==========================================

export const getEventRegistrants = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { id: eventId } = req.params;

    if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });
    if (!eventId) return res.status(400).json({ success: false, error: 'Event ID is required' });

    // Validate Event exists and the requesting user is the author/organizer
    const { data: event, error: eventErr } = await supabase
      .from('events')
      .select('author_id, title')
      .eq('id', eventId)
      .single();

    if (eventErr || !event) {
      return res.status(404).json({ success: false, error: 'Event not found' });
    }

    if (event.author_id !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: You are not the organizer of this event'
      });
    }

    // Fetch all registrations including registration_details
    const { data: regs, error: regsErr } = await supabase
      .from('event_registrations')
      .select('user_id, created_at, registration_details')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false });

    if (regsErr) throw regsErr;

    // Fetch complete profiles for each registered student
    const studentIds = (regs || []).map(r => r.user_id);
    let registrantsProfiles: any[] = [];

    if (studentIds.length > 0) {
      const { data: profiles, error: profsErr } = await supabase
        .from('extended_profiles')
        .select('id, initials, full_name, role_title, university, department, university_year, location, bio, skills, avatar_url')
        .in('id', studentIds);

      if (profsErr) throw profsErr;
      registrantsProfiles = profiles || [];
    }

    // Combine profiles with registration timestamp & details
    const detailedRegistrants = (regs || []).map(r => {
      const p = registrantsProfiles.find(prof => prof.id === r.user_id);
      return {
        registered_at: r.created_at,
        registration_details: r.registration_details || {},
        student: p ? {
          id: p.id,
          initials: p.initials || p.full_name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || '??',
          name: p.full_name || 'Anonymous Student',
          university: p.university || 'Classmate',
          department: p.department || '',
          university_year: p.university_year || '',
          year: `${p.department || 'Student'}${p.university_year ? ` - ${p.university_year}` : ''}`,
          skills: p.skills || [],
          bio: p.bio || '',
          avatar_url: p.avatar_url || null
        } : {
          id: r.user_id,
          initials: '??',
          name: 'Anonymous Student',
          university: 'StudentBook University',
          year: 'Student',
          skills: [],
          bio: '',
          avatar_url: null
        }
      };
    });

    res.status(200).json({
      success: true,
      data: detailedRegistrants
    });
  } catch (error: any) {
    console.error('Error fetching event registrants:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getEventRegistrantsDownload = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { id: eventId } = req.params;

    if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });
    if (!eventId) return res.status(400).json({ success: false, error: 'Event ID is required' });

    // Validate Event exists and the requesting user is the organizer
    const { data: event, error: eventErr } = await supabase
      .from('events')
      .select('author_id, title, custom_form_config')
      .eq('id', eventId)
      .single();

    if (eventErr || !event) {
      return res.status(404).json({ success: false, error: 'Event not found' });
    }

    if (event.author_id !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: You are not the organizer of this event'
      });
    }

    // Fetch registrations
    const { data: regs, error: regsErr } = await supabase
      .from('event_registrations')
      .select('user_id, created_at, registration_details')
      .eq('event_id', eventId)
      .order('created_at', { ascending: true });

    if (regsErr) throw regsErr;

    // Fetch student profile details
    const studentIds = (regs || []).map(r => r.user_id);
    let registrantsProfiles: any[] = [];

    if (studentIds.length > 0) {
      const { data: profiles, error: profsErr } = await supabase
        .from('extended_profiles')
        .select('id, full_name, university, department, university_year')
        .in('id', studentIds);

      if (profsErr) throw profsErr;
      registrantsProfiles = profiles || [];
    }

    // Parse customizable form config schema
    const formConfig = event.custom_form_config || {};
    const enabledFields = formConfig.fields || [
      { id: 'full_name', label: 'Full Name', enabled: true },
      { id: 'email', label: 'Email Address', enabled: true },
      { id: 'department', label: 'Department', enabled: true },
      { id: 'year', label: 'Year / Semester', enabled: true },
      { id: 'remarks', label: 'Remarks / Motivation', enabled: true },
      { id: 'portfolio_link', label: 'GitHub / Portfolio Link', enabled: false }
    ];
    const customQuestions = formConfig.custom_questions || [];

    // Construct Dynamic CSV Headers
    const headers: { id: string; label: string; isCustom?: boolean }[] = [];
    enabledFields.forEach((f: any) => {
      if (f.enabled) {
        headers.push({ id: f.id, label: f.label });
      }
    });

    customQuestions.forEach((q: any) => {
      headers.push({ id: q.id, label: q.label, isCustom: true });
    });

    headers.push({ id: 'registered_at', label: 'Registered At' });

    // Escape quotes for CSV values
    const escapeCSV = (val: string) => `"${(val || '').toString().replace(/"/g, '""')}"`;

    // Write headers row
    let csvContent = headers.map(h => escapeCSV(h.label)).join(',') + '\n';

    // Write applicant rows
    (regs || []).forEach(r => {
      const p = registrantsProfiles.find(prof => prof.id === r.user_id);
      const details = r.registration_details || {};

      const rowValues = headers.map(h => {
        if (h.id === 'registered_at') {
          return new Date(r.created_at).toLocaleString();
        }

        if (h.isCustom) {
          const customAnswers = details.custom_answers || {};
          return customAnswers[h.id] || details[h.id] || 'N/A';
        }

        // Standard fields mapping
        if (h.id === 'full_name') {
          return details.full_name || p?.full_name || 'Anonymous Student';
        }
        if (h.id === 'email') {
          return details.email || 'N/A';
        }
        if (h.id === 'department') {
          return details.department || p?.department || 'N/A';
        }
        if (h.id === 'year') {
          return details.year || p?.university_year || 'N/A';
        }
        if (h.id === 'remarks') {
          return details.remarks || 'No remarks provided';
        }
        if (h.id === 'portfolio_link') {
          return details.portfolio_link || 'N/A';
        }

        return details[h.id] || 'N/A';
      });

      csvContent += rowValues.map(v => escapeCSV(v)).join(',') + '\n';
    });

    const safeTitle = event.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${safeTitle}_registrants.csv`);
    return res.status(200).send(csvContent);
  } catch (error: any) {
    console.error('Error exporting event registrants CSV:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
