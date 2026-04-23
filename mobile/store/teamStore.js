import { create } from 'zustand';
import client from '../api/client';

export const useTeamStore = create((set, get) => ({
  teams: [],
  myTeams: [],
  activeTeam: null,
  pendingRequests: [],
  isLoading: false,
  error: null,

  fetchTeams: async (search = '', tag = '') => {
    set({ isLoading: true });
    try {
      const params = {};
      if (search) params.search = search;
      if (tag) params.tag = tag;
      
      const res = await client.get('/teams', { params });
      set({ teams: res.data.data, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch teams', isLoading: false });
    }
  },

  fetchTeamDetails: async (teamId) => {
    set({ isLoading: true });
    try {
      const res = await client.get(`/teams/${teamId}`);
      set({ activeTeam: res.data.data, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch team details', isLoading: false });
    }
  },

  createTeam: async (teamData) => {
    set({ isLoading: true });
    try {
      const res = await client.post('/teams', teamData);
      set((state) => ({
        teams: [res.data.data, ...state.teams],
        isLoading: false
      }));
      return { success: true, team: res.data.data };
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to create team', isLoading: false });
      return { success: false, error: error.response?.data?.message };
    }
  },

  requestToJoin: async (teamId, message = '') => {
    try {
      await client.post(`/teams/${teamId}/request`, { message });
      set((state) => {
        if (state.activeTeam && state.activeTeam._id === teamId) {
          return { activeTeam: { ...state.activeTeam, hasPendingRequest: true } };
        }
        return state;
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Request failed' };
    }
  },

  fetchTeamRequests: async (teamId) => {
    try {
      const res = await client.get(`/teams/${teamId}/requests`);
      set({ pendingRequests: res.data.data });
    } catch (error) {
      console.error('Fetch Team Requests Error:', error);
    }
  },

  handleJoinRequest: async (requestId, status) => {
    try {
      await client.put(`/teams/request/${requestId}`, { status });
      set((state) => ({
        pendingRequests: state.pendingRequests.filter(r => r._id !== requestId)
      }));
      return { success: true };
    } catch (error) {
      return { success: false };
    }
  },

  clearActiveTeam: () => set({ activeTeam: null, pendingRequests: [] }),
}));
