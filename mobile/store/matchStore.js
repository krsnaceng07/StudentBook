import { create } from 'zustand';
import client from '../api/client';

export const useMatchStore = create((set) => ({
  matches: [],
  isLoading: false,
  error: null,

  fetchMatches: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await client.get('/match/suggested');
      set({ matches: res.data.data, isLoading: false });
      return { success: true, data: res.data.data };
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch suggestions', 
        isLoading: false 
      });
      return { success: false, error: error.response?.data?.message };
    }
  },

  clearMatches: () => set({ matches: [] }),
}));
