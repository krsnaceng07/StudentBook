import { create } from 'zustand';
import client from '../api/client';
import { usePostStore } from './postStore';

export const useCommentStore = create((set, get) => ({
  comments: [],
  isLoading: false,
  replyTo: null,

  setReplyTo: (comment) => set({ replyTo: comment }),

  fetchComments: async (postId) => {
    set({ isLoading: true });
    try {
      const res = await client.get(`/posts/${postId}/comments`);
      set({ comments: res.data.data, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch comments:', error);
      set({ isLoading: false });
    }
  },

  addComment: async (postId, content) => {
    const { replyTo } = get();
    const parentId = replyTo ? replyTo._id : null;

    try {
      const res = await client.post(`/posts/${postId}/comments`, { content, parentId });
      const newComment = res.data.data;
      
      // Update global post count
      usePostStore.getState().fetchPosts(); 

      set((state) => ({
        comments: [...state.comments, newComment],
        replyTo: null
      }));
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to add comment' };
    }
  },

  likeComment: async (commentId) => {
    const previousComments = get().comments;
    
    // Optimistic Update
    set((state) => ({
      comments: state.comments.map((c) => 
        c._id === commentId 
          ? { 
              ...c, 
              isLiked: !c.isLiked, 
              likesCount: c.isLiked ? c.likesCount - 1 : c.likesCount + 1 
            } 
          : c
      )
    }));

    try {
      await client.post(`/posts/comments/${commentId}/like`);
    } catch (error) {
      // Rollback
      set({ comments: previousComments });
    }
  }
}));
