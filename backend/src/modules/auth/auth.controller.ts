import { Request, Response } from 'express';
import { supabaseAdmin } from '../../config/supabase.js';
import { sendSuccess, sendError } from '../../utils/response.js';

export const signupStudent = async (req: Request, res: Response) => {
  try {
    const { email, password, full_name, college_name, department, year } = req.body;

    // 1. Create Supabase Auth User
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true // Auto-confirm for now as per dev needs
    });

    if (authError) return sendError(res, authError.message, 400);
    const userId = authData.user.id;

    // 2. Create Profile row
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert([{ id: userId, email, role: 'student' }]);

    if (profileError) {
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return sendError(res, profileError.message, 400);
    }

    // 3. Create Student Profile row
    const { error: studentError } = await supabaseAdmin
      .from('student_profiles')
      .insert([{ 
        id: userId, 
        full_name: full_name || email.split('@')[0], 
        college_name: college_name || 'Not specified', 
        department: department || '', 
        year: year || '1st'
      }]);

    if (studentError) {
      await supabaseAdmin.from('profiles').delete().eq('id', userId);
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return sendError(res, studentError.message, 400);
    }

    return sendSuccess(res, { userId }, 'Student registered successfully', 201);
  } catch (error) {
    return sendError(res, 'Failed to register student', 500, error);
  }
};

export const signupCollege = async (req: Request, res: Response) => {
  try {
    const { email, password, college_name, college_type, location, contact_email } = req.body;

    // 1. Create Supabase Auth User
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });

    if (authError) return sendError(res, authError.message, 400);
    const userId = authData.user.id;

    // 2. Create Profile row
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert([{ id: userId, email, role: 'college' }]);

    if (profileError) {
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return sendError(res, profileError.message, 400);
    }

    // 3. Create College Profile row
    const { error: collegeError } = await supabaseAdmin
      .from('college_profiles')
      .insert([{ 
        id: userId, 
        college_name: college_name || email.split('@')[0], 
        college_type: college_type || 'other', 
        location: location || 'Not specified', 
        contact_email: contact_email || email 
      }]);

    if (collegeError) {
      await supabaseAdmin.from('profiles').delete().eq('id', userId);
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return sendError(res, collegeError.message, 400);
    }

    return sendSuccess(res, { userId }, 'College registered successfully', 201);
  } catch (error) {
    return sendError(res, 'Failed to register college', 500, error);
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password
    });

    if (error) return sendError(res, error.message, 401);

    // Fetch role from profiles
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single();

    if (profileError || !profile) {
      return sendError(res, 'User profile not found', 404);
    }

    return sendSuccess(res, {
      session: data.session,
      user: {
        ...data.user,
        role: profile.role
      }
    }, 'Login successful');
  } catch (error) {
    return sendError(res, 'Login failed', 500, error);
  }
};

export const getMe = async (req: any, res: Response) => {
  return sendSuccess(res, { user: req.user });
};
