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

    // Mock stats for now
    const stats = {
      connections: 12,
      events_joined: 3,
      teams: 2,
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

    res.status(200).json({ 
      success: true, 
      data: {
        profile
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

