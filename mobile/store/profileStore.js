import { create } from 'zustand';
import client from '../api/client';

export const useProfileStore = create((set) => ({
  profile: null,
  isProfileLoaded: false,
  isLoading: false,
  error: null,

  fetchProfile: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await client.get('/profile/me');
      set({ 
        profile: res.data.data, 
        isLoading: false, 
        isProfileLoaded: true 
      });
      return { success: true, profile: res.data.data };
    } catch (error) {
      // 404 is now handled as 200/null on backend, but we keep this for safety
      const isNotFound = error.response?.status === 404;
      set({ 
        error: isNotFound ? null : (error.response?.data?.message || 'Failed to fetch profile'), 
        isLoading: false,
        isProfileLoaded: true 
      });
      return { success: !isNotFound, error: error.response?.data?.message };
    }
  },

  updateProfile: async (profileData) => {
    set({ isLoading: true, error: null });
    try {
      const res = await client.post('/profile', profileData); // Works for update or create based on backend alias
      set({ profile: res.data.data, isLoading: false });
      return { success: true, profile: res.data.data };
    } catch (error) {
       set({ error: error.response?.data?.message || 'Update failed', isLoading: false });
       return { success: false, error: error.response?.data?.message };
    }
  },

  fetchProfileByUserId: async (userId) => {
    try {
      const res = await client.get(`/profile/user/${userId}`);
      return { success: true, profile: res.data.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Profile not found' };
    }
  },
  clearProfile: () => set({ profile: null, isProfileLoaded: false, error: null }),
}));
