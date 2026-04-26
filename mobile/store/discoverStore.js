import { create } from 'zustand';
import client from '../api/client';

export const useDiscoverStore = create((set, get) => ({
  users: [],
  isLoading: false,
  isRefreshing: false,
  error: null,
  
  // Unified in-feed suggestions (users + public teams)
  suggestions: [],
  suggestionsLoading: false,

  // Pagination
  page: 1,
  limit: 10,
  total: 0,
  hasMore: true,

  // Filters
  filters: {
    search: '',
    field: '',
    skills: []
  },

  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
      page: 1,
      users: [],
      hasMore: true,
      isLoading: false,
      isRefreshing: false
    }));
    get().fetchUsers();
  },

  fetchUsers: async (isNextPage = false) => {
    const state = get();
    if (state.isLoading || (!isNextPage && state.isRefreshing)) return;
    if (isNextPage && !state.hasMore) return;

    if (isNextPage) {
      set({ isLoading: true });
    } else {
      set({ isRefreshing: true });
    }

    try {
      const currentPage = isNextPage ? state.page + 1 : 1;
      const params = {
        page: currentPage,
        limit: state.limit,
        search: state.filters.search,
        field: state.filters.field,
        skills: state.filters.skills.join(',')
      };

      const res = await client.get('/users/discover', { params });
      const fetchedUsers = res.data.data?.users || [];
      const pagination = res.data.data?.pagination || { total: 0 };

      set((state) => ({
        users: isNextPage ? [...state.users, ...fetchedUsers] : fetchedUsers,
        page: currentPage,
        total: pagination.total,
        hasMore: (currentPage * state.limit) < pagination.total,
        isLoading: false,
        isRefreshing: false,
        error: null
      }));
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch users', 
        isLoading: false,
        isRefreshing: false 
      });
    }
  },

  // Fetch smart interleaved suggestions (users + public teams)
  fetchSuggestions: async () => {
    if (get().suggestionsLoading) return;
    set({ suggestionsLoading: true });
    try {
      const res = await client.get('/match/unified');
      set({ suggestions: res.data.data || [], suggestionsLoading: false });
    } catch (error) {
      // Fail silently - suggestions are non-critical
      set({ suggestions: [], suggestionsLoading: false });
    }
  },

  resetFilters: () => {
    set({
      filters: { search: '', field: '', skills: [] },
      page: 1,
      users: [],
      hasMore: true
    });
    get().fetchUsers();
  }
}));
