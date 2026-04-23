import { create } from 'zustand';
import client from '../api/client';

export const usePostStore = create((set, get) => ({
  posts: [],
  isLoading: false,
  isRefreshing: false,
  error: null,
  
  // Pagination
  page: 1,
  hasMore: true,

  filters: {
    search: '',
  },

  // Network Feed
  networkPosts: [],
  networkPage: 1,
  networkHasMore: true,

  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
      page: 1,
      posts: [],
      hasMore: true,
      isLoading: false,  // Reset so next fetch is never dropped
      isRefreshing: false
    }));
    get().fetchPosts();
  },

  fetchPosts: async (isNextPage = false) => {
    const state = get();
    if (state.isLoading) return;
    if (isNextPage && !state.hasMore) return;

    if (isNextPage) {
      set({ isLoading: true });
    } else {
      set({ isRefreshing: true, page: 1 });
    }

    try {
      const currentPage = isNextPage ? state.page + 1 : 1;
      const searchParam = state.filters.search ? `&search=${state.filters.search}` : '';
      const res = await client.get(`/posts?page=${currentPage}&limit=10${searchParam}`);
      const { data, pagination } = res.data;

      set((state) => ({
        posts: isNextPage ? [...state.posts, ...data] : data,
        page: currentPage,
        hasMore: pagination.hasMore,
        isLoading: false,
        isRefreshing: false,
        error: null
      }));
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch posts', 
        isLoading: false, 
        isRefreshing: false 
      });
    }
  },

  fetchNetworkPosts: async (isNextPage = false) => {
    const state = get();
    if (state.isLoading) return;
    if (isNextPage && !state.networkHasMore) return;

    if (isNextPage) {
      set({ isLoading: true });
    } else {
      set({ isRefreshing: true, networkPage: 1 });
    }

    try {
      const currentPage = isNextPage ? state.networkPage + 1 : 1;
      const res = await client.get(`/posts/network?page=${currentPage}&limit=10`);
      const { data, pagination } = res.data;

      set((state) => ({
        networkPosts: isNextPage ? [...state.networkPosts, ...data] : data,
        networkPage: currentPage,
        networkHasMore: pagination.hasMore,
        isLoading: false,
        isRefreshing: false,
        error: null
      }));
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch network posts', 
        isLoading: false, 
        isRefreshing: false 
      });
    }
  },

  createPost: async (content, images = [], tags = []) => {
    set({ isLoading: true });
    try {
      const res = await client.post('/posts', { content, images, tags });
      const newPost = res.data.data;
      
      set((state) => ({
        posts: [newPost, ...state.posts],
        isLoading: false
      }));
      return { success: true };
    } catch (error) {
      set({ isLoading: false });
      return { success: false, error: error.response?.data?.message || 'Failed to create post' };
    }
  },
  
  updatePost: async (postId, content, tags = []) => {
    set({ isLoading: true });
    try {
      const res = await client.put(`/posts/${postId}`, { content, tags });
      const updatedPost = res.data.data;
      
      set((state) => ({
        posts: state.posts.map((post) => post._id === postId ? updatedPost : post),
        isLoading: false
      }));
      return { success: true };
    } catch (error) {
      set({ isLoading: false });
      return { success: false, error: error.response?.data?.message || 'Failed to update post' };
    }
  },

  likePost: async (postId) => {
    // Optimistic UI Update
    const previousPosts = get().posts;
    const previousNetworkPosts = get().networkPosts;
    
    const updateLikes = (posts) => posts.map((post) => 
      post._id === postId 
        ? { 
            ...post, 
            isLiked: !post.isLiked, 
            likesCount: post.isLiked ? post.likesCount - 1 : post.likesCount + 1 
          } 
        : post
    );

    set((state) => ({
      posts: updateLikes(state.posts),
      networkPosts: updateLikes(state.networkPosts)
    }));

    try {
      await client.post(`/posts/${postId}/like`);
    } catch (error) {
      // Rollback on error
      set({ posts: previousPosts, networkPosts: previousNetworkPosts });
    }
  },

  addComment: async (postId, content, parentId = null) => {
    try {
      const res = await client.post(`/posts/${postId}/comments`, { content, parentId });
      const newComment = res.data.data;
      
      const updateCommentsCount = (posts) => posts.map((post) => 
        post._id === postId 
          ? { ...post, commentsCount: post.commentsCount + 1 } 
          : post
      );

      set((state) => ({
        posts: updateCommentsCount(state.posts),
        networkPosts: updateCommentsCount(state.networkPosts)
      }));
      
      return { success: true, comment: newComment };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to add comment' };
    }
  }
}));
