import { create } from 'zustand';
import { TokenStorage } from '../utils/storage';
import client from '../api/client';

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  setToken: async (token) => {
    try {
      await TokenStorage.setItem('token', token);
      
      // The API client now pulls the token dynamically from the store
      set({ token, isAuthenticated: !!token });
    } catch (e) {
      console.error('TokenStorage Set Error:', e);
    }
  },

  loadToken: async () => {
    try {
      const token = await TokenStorage.getItem('token');
      
      // The API client now pulls the token dynamically from the store

      set({ token, isAuthenticated: !!token });
      return token;
    } catch (e) {
      console.error('TokenStorage Load Error:', e);
      return null;
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await client.post('/auth/login', { email, password });
      const { token, user } = res.data.data;
      
      await TokenStorage.setItem('token', token);
      
      // The API client now pulls the token dynamically from the store
      
      set({ token, user, isAuthenticated: true, isLoading: false });
      return { success: true };
    } catch (error) {
      set({ error: error.response?.data?.message || 'Login failed', isLoading: false });
      return { success: false, error: error.response?.data?.message };
    }
  },

  register: async (name, username, email, password) => {
    set({ isLoading: true, error: null });
    try {
      await client.post('/auth/register', { name, username, email, password });
      set({ isLoading: false });
      return { success: true };
    } catch (error) {
      set({ error: error.response?.data?.message || 'Registration failed', isLoading: false });
      return { success: false, error: error.response?.data?.message };
    }
  },

  fetchMe: async () => {
    try {
      const res = await client.get('/auth/me');
      const { user } = res.data.data;
      set({ user, isAuthenticated: true });
      return { success: true, user };
    } catch (error) {
      console.error('Fetch Me Error:', error);
      // If token is invalid, log out
      if (error.response?.status === 401) {
        await TokenStorage.deleteItem('token');
        set({ token: null, user: null, isAuthenticated: false });
      }
      return { success: false };
    }
  },

  logout: async () => {
    try {
      const { useChatStore } = require('./chatStore');
      const { useProfileStore } = require('./profileStore');
      const { usePostStore } = require('./postStore');
      const { useDiscoverStore } = require('./discoverStore');
      const { useConnectionStore } = require('./connectionStore');
      const { useTeamStore } = require('./teamStore');
      
      useChatStore.getState().disconnectSocket();
      useProfileStore.getState().clearProfile();
      usePostStore.setState({ posts: [], page: 1, hasMore: true, filters: { search: '' } });
      useDiscoverStore.setState({ users: [], page: 1, hasMore: true, filters: { search: '', field: '', skills: [] } });
      useConnectionStore.setState({ connections: [], incomingRequests: [] });
      useTeamStore.setState({ teams: [], myTeams: [], activeTeam: null, pendingRequests: [] });
    } catch (e) {
      console.error('Logout cleanup error:', e);
    }

    await TokenStorage.deleteItem('token');
    set({ token: null, user: null, isAuthenticated: false });
  },

  forgotPassword: async (email) => {
    set({ isLoading: true, error: null });
    try {
      const res = await client.post('/auth/forgot-password', { email });
      set({ isLoading: false });
      return { success: true, message: res.data.message };
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to send reset link';
      set({ error: msg, isLoading: false });
      return { success: false, error: msg };
    }
  },

  resetPassword: async (token, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await client.post(`/auth/reset-password/${token}`, { password });
      set({ isLoading: false });
      return { success: true, message: res.data.message };
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to reset password';
      set({ error: msg, isLoading: false });
      return { success: false, error: msg };
    }
  },

  setUser: (user) => set({ user }),
}));
