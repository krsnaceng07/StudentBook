import { create } from 'zustand';
import client from '../api/client';

export const useSettingsStore = create((set, get) => ({
  settings: null,
  isLoading: false,
  error: null,

  fetchSettings: async () => {
    set({ isLoading: true });
    try {
      const res = await client.get('/settings');
      const fetchedSettings = res.data.data.settings;
      set({ settings: fetchedSettings, isLoading: false, error: null });

      // Sync with AuthStore
      const { useAuthStore } = require('./authStore');
      const currentUser = useAuthStore.getState().user;
      if (currentUser) {
        useAuthStore.getState().setUser({ ...currentUser, settings: fetchedSettings });
      }
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch settings', 
        isLoading: false 
      });
    }
  },

  updateSettings: async (updates) => {
    // Optimistic update with deep merge for nested objects like notifications
    const previousSettings = JSON.parse(JSON.stringify(get().settings || {}));
    
    set((state) => {
      const newSettings = { ...state.settings };
      
      // Deep merge for updates
      Object.keys(updates).forEach(key => {
        if (typeof updates[key] === 'object' && updates[key] !== null && !Array.isArray(updates[key])) {
          newSettings[key] = { ...(newSettings[key] || {}), ...updates[key] };
        } else {
          newSettings[key] = updates[key];
        }
      });

      return { settings: newSettings };
    });

    try {
      await client.put('/settings', updates);
      
      // Sync with AuthStore
      const { useAuthStore } = require('./authStore');
      const currentUser = useAuthStore.getState().user;
      if (currentUser) {
        useAuthStore.getState().setUser({
          ...currentUser,
          settings: get().settings
        });
      }

      return { success: true };
    } catch (error) {
      // Rollback on failure
      set({ settings: previousSettings });
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update settings' 
      };
    }
  },

  changePassword: async (currentPassword, newPassword) => {
    set({ isLoading: true });
    try {
      await client.put('/settings/password', { currentPassword, newPassword });
      set({ isLoading: false });
      return { success: true };
    } catch (error) {
      set({ isLoading: false });
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to change password' 
      };
    }
  },

  updateEmail: async (email, password) => {
    set({ isLoading: true });
    try {
      const res = await client.put('/settings/email', { email, password });
      
      // Update AuthStore with new email
      const { useAuthStore } = require('./authStore');
      const currentUser = useAuthStore.getState().user;
      if (currentUser) {
        useAuthStore.getState().setUser({ ...currentUser, email: res.data.email });
      }

      set({ isLoading: false });
      return { success: true, email: res.data.email };
    } catch (error) {
      set({ isLoading: false });
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update email' 
      };
    }
  },

  deleteAccount: async (password) => {
    set({ isLoading: true });
    try {
      await client.delete('/settings/account', { data: { password } });
      const { useAuthStore } = require('./authStore');
      await useAuthStore.getState().logout();
      set({ isLoading: false });
      return { success: true };
    } catch (error) {
      set({ isLoading: false });
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to delete account' 
      };
    }
  }
}));
