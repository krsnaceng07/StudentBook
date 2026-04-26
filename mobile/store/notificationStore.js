import { create } from 'zustand';
import client from '../api/client';

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  isRefreshing: false,
  error: null,

  fetchNotifications: async (isRefresh = false) => {
    if (isRefresh) {
      set({ isRefreshing: true });
    } else {
      set({ isLoading: true });
    }

    try {
      const res = await client.get('/notifications');
      const notifications = res.data.data;
      const unreadCount = notifications.filter(n => !n.isRead).length;
      
      set({ 
        notifications, 
        unreadCount, 
        isLoading: false, 
        isRefreshing: false 
      });
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch notifications', 
        isLoading: false, 
        isRefreshing: false 
      });
    }
  },

  addNotification: (notification) => {
    set((state) => {
      // Deduplicate
      const exists = state.notifications.find(n => n._id === notification._id);
      if (exists) return state;

      const newNotifications = [notification, ...state.notifications];
      return {
        notifications: newNotifications,
        unreadCount: newNotifications.filter(n => !n.isRead).length
      };
    });
  },

  markAsRead: async (id) => {
    try {
      await client.put(`/notifications/${id}/read`);
      set((state) => {
        const newNotifications = state.notifications.map(n => 
          n._id === id ? { ...n, isRead: true } : n
        );
        return {
          notifications: newNotifications,
          unreadCount: newNotifications.filter(n => !n.isRead).length
        };
      });
    } catch (error) {
      console.error('Mark as read error:', error);
    }
  },

  markAllAsRead: async () => {
    try {
      await client.put('/notifications/read-all');
      set((state) => ({
        notifications: state.notifications.map(n => ({ ...n, isRead: true })),
        unreadCount: 0
      }));
    } catch (error) {
      console.error('Mark all as read error:', error);
    }
  }
}));
