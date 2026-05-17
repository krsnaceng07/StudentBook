import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { sendError } from '../utils/response.js';

export const authMiddleware = async (req: any, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'No token provided', 401);
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return sendError(res, 'Invalid or expired token', 401);
    }

    // Fetch user role and profile basic info
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      console.log(`[AuthMiddleware] Profile missing for user ${user.id}. Creating default...`);
      
      const { data: newProfile, error: insertError } = await supabaseAdmin
        .from('profiles')
        .insert([{ id: user.id, email: user.email, role: 'student' }])
        .select()
        .single();
      
      if (insertError) {
        console.error('[AuthMiddleware] Failed to auto-create profile:', insertError);
        return sendError(res, 'User profile not found', 404);
      }

      // Also ensure extended_profile exists
      await supabaseAdmin
        .from('extended_profiles')
        .insert([{ 
          id: user.id, 
          full_name: user.email?.split('@')[0] || 'Aarav Sharma', 
          university: 'Tribhuvan University' 
        }]);

      req.user = {
        ...user,
        role: 'student'
      };
    } else {
      req.user = {
        ...user,
        role: profile.role
      };
    }

    next();
  } catch (error) {
    return sendError(res, 'Authentication failed', 500, error);
  }
};
