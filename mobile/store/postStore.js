import { create } from 'zustand';

/**
 * Post Store for managing network posts, creations, likes, and details
 */
export const usePostStore = create((set) => ({
  networkPosts: [],
  isLoading: false,
  isRefreshing: false,
  networkHasMore: false,

  fetchNetworkPosts: async () => {
    // Mock fetch
    set({ isLoading: true });
    setTimeout(() => {
      set({ isLoading: false });
    }, 200);
  },

  createPost: async (content) => {
    console.log('[PostStore] Mock createPost:', content);
    return { success: true };
  },

  updatePost: async (id, content) => {
    console.log('[PostStore] Mock updatePost:', id, content);
    return { success: true };
  },

  likePost: async (id) => {
    console.log('[PostStore] Mock likePost:', id);
  },

  deletePost: async (id) => {
    console.log('[PostStore] Mock deletePost:', id);
    return { success: true };
  }
}));

export default usePostStore;
