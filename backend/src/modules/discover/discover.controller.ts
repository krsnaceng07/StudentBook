import { Request, Response } from 'express';
import { supabaseAdmin as supabase } from '../../config/supabase.js';

export const getDiscoverUsers = async (req: Request, res: Response) => {
  try {
    const { search, filter } = req.query;
    const currentUserId = (req as any).user?.id;

    if (!currentUserId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    // 1. Fetch current user's own department, university, and skills for matching
    let myUniversity = '';
    let myDepartment = '';
    let mySkills: string[] = [];

    const { data: myProfile } = await supabase
      .from('extended_profiles')
      .select('university, department, skills')
      .eq('id', currentUserId)
      .single();

    if (myProfile) {
      myUniversity = myProfile.university || '';
      myDepartment = myProfile.department || '';
      mySkills = myProfile.skills || [];
    }

    // 2. Fetch connection status of all relations for the current user
    const { data: connectionsData } = await supabase
      .from('connections')
      .select('id, sender_id, receiver_id, status')
      .or(`sender_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`);

    const myConnections = connectionsData || [];

    // Helper to calculate active connection state relative to current user
    const getConnectionState = (targetId: string) => {
      const conn = myConnections.find(
        c => (c.sender_id === currentUserId && c.receiver_id === targetId) ||
             (c.sender_id === targetId && c.receiver_id === currentUserId)
      );
      if (!conn) return { status: 'none', connectionId: null };
      if (conn.status === 'accepted') return { status: 'accepted', connectionId: conn.id };
      if (conn.status === 'pending') {
        const state = conn.sender_id === currentUserId ? 'pending_sent' : 'pending_received';
        return { status: state, connectionId: conn.id };
      }
      return { status: 'none', connectionId: null };
    };

    // 3. Query candidates (students only, excluding current user)
    let query = supabase
      .from('extended_profiles')
      .select('id, initials, full_name, role_title, university, department, university_year, location, bio, skills, avatar_url, goal, profiles!inner(role)')
      .eq('profiles.role', 'student')
      .neq('id', currentUserId);

    // Apply basic search if query is provided
    if (search && typeof search === 'string') {
      const safeSearch = search.replace(/[^a-zA-Z0-9\s]/g, '').trim();
      if (safeSearch) {
        query = query.or(`full_name.ilike.%${safeSearch}%,skills.cs.{${safeSearch}},department.ilike.%${safeSearch}%`);
      }
    }

    const { data: users, error } = await query.limit(50);

    if (error) throw error;

    // 4. Score and filter candidates to deliver optimal "Suggested Peers"
    const suggestedUsers = (users || []).map((u: any) => {
      let score = 0;
      const matchingReasons: string[] = [];

      // Check university match
      if (u.university && myUniversity && u.university.toLowerCase() === myUniversity.toLowerCase()) {
        score += 1;
        matchingReasons.push('Same University');
      }

      // Check department match
      if (u.department && myDepartment && u.department.toLowerCase() === myDepartment.toLowerCase()) {
        score += 3;
        matchingReasons.push(`Same Dept: ${u.department}`);
      }

      // Check common skills match
      const candidateSkills = u.skills || [];
      const commonSkills = candidateSkills.filter((s: string) => 
        mySkills.some(myS => myS.toLowerCase() === s.toLowerCase())
      );
      if (commonSkills.length > 0) {
        score += commonSkills.length;
        matchingReasons.push(`${commonSkills.length} Common Skill${commonSkills.length > 1 ? 's' : ''}`);
      }

      // Default label if no specific overlap matches
      if (matchingReasons.length === 0) {
        matchingReasons.push('Recommended Classmate');
      }

      // Fetch dynamic connection status
      const connInfo = getConnectionState(u.id);

      return {
        id: u.id,
        initials: u.initials || u.full_name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || '??',
        name: u.full_name || 'Anonymous Peer',
        university: u.university || 'Classmate',
        department: u.department || '',
        university_year: u.university_year || '',
        year: `${u.department || 'Student'}${u.university_year ? ` - ${u.university_year}` : ''}`,
        skills: u.skills || [],
        bio: u.bio || '',
        avatar_url: u.avatar_url || null,
        matching_reasons: matchingReasons,
        connectionStatus: connInfo.status,
        connectionId: connInfo.connectionId,
        score
      };
    });

    // 5. Sort candidates in descending order of recommendation score
    suggestedUsers.sort((a, b) => b.score - a.score);

    res.status(200).json({
      success: true,
      data: suggestedUsers
    });

  } catch (error: any) {
    console.error('Error fetching discover users:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
