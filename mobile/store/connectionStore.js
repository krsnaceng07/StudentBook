import { create } from 'zustand';
import client from '../api/client';

export const useConnectionStore = create((set, get) => ({
  incomingRequests: [],
  connections: [],
  isLoading: false,
  isRefreshing: false,
  error: null,

  fetchPending: async (isRefresh = false) => {
    if (isRefresh) {
      set({ isRefreshing: true });
    } else {
      set({ isLoading: true });
    }
    try {
      const res = await client.get('/connections/pending');
      set({ incomingRequests: res.data.data, isLoading: false, isRefreshing: false });
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch requests', isLoading: false, isRefreshing: false });
    }
  },


  fetchConnections: async () => {
    set({ isLoading: true });
    try {
      const res = await client.get('/connections');
      set({ connections: res.data.data, isLoading: false });
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch network', isLoading: false });
    }
  },

  sendRequest: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      await client.post(`/connections/request/${userId}`);
      set({ isLoading: false });
      return { success: true };
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to send request', isLoading: false });
      return { success: false, error: error.response?.data?.message };
    }
  },

  cancelRequest: async (connectionId) => {
    set({ isLoading: true, error: null });
    try {
      await client.put(`/connections/${connectionId}/cancel`);
      set({ isLoading: false });
      return { success: true };
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to cancel', isLoading: false });
      return { success: false };
    }
  },

  acceptRequest: async (connectionId) => {
    set({ isLoading: true, error: null });
    try {
      await client.put(`/connections/${connectionId}/accept`);
      set((state) => ({
        incomingRequests: state.incomingRequests.filter(r => r._id !== connectionId),
        isLoading: false
      }));
      get().fetchConnections(); // Refresh network
      return { success: true };
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to accept', isLoading: false });
      return { success: false };
    }
  },

  rejectRequest: async (connectionId) => {
    set({ isLoading: true, error: null });
    try {
      await client.put(`/connections/${connectionId}/reject`);
      set((state) => ({
        incomingRequests: state.incomingRequests.filter(r => r._id !== connectionId),
        isLoading: false
      }));
      return { success: true };
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to reject', isLoading: false });
      return { success: false };
    }
  },

  disconnectUser: async (connectionId) => {
    set({ isLoading: true, error: null });
    try {
      await client.put(`/connections/${connectionId}/disconnect`);
      set((state) => ({
        connections: state.connections.filter(c => c._id !== connectionId),
        isLoading: false
      }));
      return { success: true };
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to disconnect', isLoading: false });
      return { success: false };
    }
  },

  handleRequest: async (connectionId, action) => {
    if (action === 'accepted') return get().acceptRequest(connectionId);
    if (action === 'rejected') return get().rejectRequest(connectionId);
  },


  clearStatus: () => set({ error: null, isLoading: false }),
}));
