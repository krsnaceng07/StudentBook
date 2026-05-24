import { create } from 'zustand';
import { supabase } from '../config/supabase';
import client from '../api/client';

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  session: null,
  isAuthenticated: false,
  isLoading: true, // start loading to check session
  error: null,

  initializeAuth: async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.log('[AuthStore] Session recovery failed (likely expired/invalid token). Cleaning session.');
        try {
          await supabase.auth.signOut();
        } catch (_) {}
        set({ 
          session: null, 
          token: null,
          isAuthenticated: false,
          isLoading: false
        });
        return;
      }
      
      set({ 
        session, 
        token: session?.access_token || null,
        isAuthenticated: !!session,
        isLoading: false
      });

      if (session) {
        useAuthStore.getState().fetchMe();
      }

      // Listen for auth changes
      supabase.auth.onAuthStateChange((_event, newSession) => {
        set({ 
          session: newSession, 
          token: newSession?.access_token || null,
          isAuthenticated: !!newSession 
        });
        
        if (newSession) {
           useAuthStore.getState().fetchMe();
        } else {
           set({ user: null });
        }
      });
    } catch (e) {
      // Check if it's a Refresh Token error
      const isRefreshTokenError = e.message?.includes('Refresh Token') || e.status === 400 || (e.name === 'AuthApiError' && e.message?.includes('Refresh'));
      if (isRefreshTokenError) {
        console.log('[AuthStore] Catch: Refresh token is invalid/expired. Clearing session.');
        try {
          await supabase.auth.signOut();
        } catch (_) {}
        set({ 
          session: null, 
          token: null, 
          isAuthenticated: false, 
          isLoading: false 
        });
      } else {
        console.warn('[AuthStore] Initialize Auth Warning:', e);
        set({ isLoading: false });
      }
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      // 1. Direct login via Supabase Client SDK (Infinite cloud scalability, bypasses localtunnel completely)
      const { data: { session, user }, error: sbError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (sbError) throw sbError;

      // 2. Fetch the user role from the profiles table directly
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profileError || !profile) {
        throw new Error('User profile not found. Please contact support.');
      }

      const userWithRole = {
        ...user,
        role: profile.role
      };

      set({ 
        isLoading: false, 
        user: userWithRole, 
        session, 
        token: session.access_token, 
        isAuthenticated: true 
      });
      return { success: true };
    } catch (error) {
      const msg = error.message || 'Login failed';
      set({ error: msg, isLoading: false });
      return { success: false, error: msg };
    }
  },

  registerStudent: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await client.post('/auth/signup/student', data);
      set({ isLoading: false });
      return { success: true };
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Registration failed';
      set({ error: msg, isLoading: false });
      return { success: false, error: msg };
    }
  },

  registerCollege: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await client.post('/auth/signup/college', data);
      set({ isLoading: false });
      return { success: true };
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Registration failed';
      set({ error: msg, isLoading: false });
      return { success: false, error: msg };
    }
  },

  fetchMe: async () => {
    try {
      // The Axios client interceptor needs to be updated to pull from supabase.auth.getSession()
      // But for now, we can also fetch from Supabase directly
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return { success: false };

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();

      if (error) throw error;
      
      if (!profile) {
        // User exists in Auth but not in Profiles yet
        console.log('[AuthStore] No profile found for authenticated user.');
        set({ user: { id: session.user.id, email: session.user.email }, isAuthenticated: true });
        return { success: false, reason: 'no_profile' };
      }

      set({ user: profile, isAuthenticated: true });
      return { success: true, user: profile };
    } catch (error) {
      // PGRST116 is handled by maybeSingle() returning null
      console.error('Fetch Me Error:', error);
      set({ user: { id: 'error_fallback' }, isAuthenticated: true });
      return { success: false };
    }
  },

  logout: async () => {
    try {
      // Only clean up what still exists
      const { useUIStore } = require('./uiStore');
    } catch (e) {
      console.error('Logout cleanup error:', e);
    }

    await supabase.auth.signOut();
    set({ session: null, token: null, user: null, isAuthenticated: false });
  },

  forgotPassword: async (email) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      set({ isLoading: false });
      return { success: true, message: 'Password reset email sent' };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { success: false, error: error.message };
    }
  },

  resetPassword: async (email, token, password) => {
    set({ isLoading: true, error: null });
    try {
      // 1. Verify the OTP/Token
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'recovery'
      });
      if (verifyError) throw verifyError;

      // 2. Update the password (verifyOtp signs the user in)
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });
      if (updateError) throw updateError;

      set({ isLoading: false });
      return { success: true };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { success: false, error: error.message };
    }
  },

  setUser: (user) => set({ user }),
}));
