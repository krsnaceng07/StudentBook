import { create } from 'zustand';
import api from '../api/client';

export const useStudyStore = create((set, get) => ({
  feed: [],
  questions: [],
  loading: false,
  error: null,
  pagination: { page: 1, total: 0 },

  fetchFeed: async (field = 'All', type = 'All', page = 1) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get(`/study/feed?field=${field}&type=${type}&page=${page}`);
      if (response.data.success) {
        set({ 
          feed: page === 1 ? response.data.data : [...get().feed, ...response.data.data],
          pagination: response.data.pagination,
          loading: false 
        });
      }
    } catch (err) {
      set({ error: 'Failed to fetch feed', loading: false });
    }
  },

  createPost: async (postData) => {
    set({ loading: true });
    try {
      const response = await api.post('/study/post', postData);
      if (response.data.success) {
        set({ feed: [response.data.data, ...get().feed], loading: false });
        return true;
      }
    } catch (err) {
      set({ error: 'Failed to create post', loading: false });
      return false;
    }
  },

  askQuestion: async (questionData) => {
    set({ loading: true });
    try {
      const response = await api.post('/study/question', questionData);
      if (response.data.success) {
        set({ questions: [response.data.data, ...get().questions], loading: false });
        return true;
      }
    } catch (err) {
      set({ error: 'Failed to ask question', loading: false });
      return false;
    }
  },

  answerQuestion: async (answerData) => {
    set({ loading: true });
    try {
      const response = await api.post('/study/answer', answerData);
      if (response.data.success) {
        // Update the question's answer count locally if needed
        set({ loading: false });
        return true;
      }
    } catch (err) {
      set({ error: 'Failed to submit answer', loading: false });
      return false;
    }
  }
}));
