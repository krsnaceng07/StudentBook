import { Request, Response } from 'express';
import { supabaseAdmin as supabase } from '../../config/supabase.js';

export const getMyTeam = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });

    // Find the team where current user is a member
    const { data: myMembership, error: membershipError } = await supabase
      .from('team_members')
      .select('team_id')
      .eq('user_id', userId)
      .single();

    if (membershipError || !myMembership) {
      return res.status(200).json({ success: true, data: null });
    }

    // Get team details
    const teamId = myMembership.team_id;
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('*')
      .eq('id', teamId)
      .single();

    if (teamError) throw teamError;

    // Get all members of this team
    const { data: members, error: membersError } = await supabase
      .from('team_members')
      .select('user_id, role, skill_tag')
      .eq('team_id', teamId);

    if (membersError) throw membersError;

    // Enhance members with profile data
    const enhancedMembers = await Promise.all(
      members.map(async (member: any) => {
        const { data: profile } = await supabase
          .from('extended_profiles')
          .select('full_name, initials')
          .eq('id', member.user_id)
          .single();
        
        return {
          ...member,
          profile: profile || null,
        };
      })
    );

    const maxMembers = team.max_members || 4;
    const openSlots = maxMembers - members.length;

    res.status(200).json({
      success: true,
      data: {
        team,
        members: enhancedMembers,
        open_slots: openSlots > 0 ? openSlots : 0,
      }
    });
  } catch (error: any) {
    console.error('Error fetching my team:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
