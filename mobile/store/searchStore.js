import { create } from 'zustand';
import client from '../api/client';

export const useSearchStore = create((set, get) => ({
  results: {
    users: [],
    teams: [],
    posts: []
  },
  isLoading: false,
  error: null,
  recentSearches: [],

  performUnifiedSearch: async (query) => {
    if (!query || query.length < 2) {
      set({ results: { users: [], teams: [], posts: [] }, isLoading: false });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const res = await client.get(`/search/unified?q=${encodeURIComponent(query)}`);
      set({ 
        results: res.data.data, 
        isLoading: false,
        recentSearches: [...new Set([query, ...get().recentSearches])].slice(0, 5)
      });
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Search failed', 
        isLoading: false 
      });
    }
  },

  clearResults: () => set({ results: { users: [], teams: [], posts: [] }, error: null }),
  
  removeRecentSearch: (search) => set((state) => ({
    recentSearches: state.recentSearches.filter(s => s !== search)
  }))
}));
