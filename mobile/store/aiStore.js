import { create } from 'zustand';
import api from '../api/client';

export const useAIStore = create((set, get) => ({
  messages: [],
  loading: false,
  error: null,

  askAI: async (query, field = 'General') => {
    // Add user message to state
    const userMessage = { role: 'user', content: query, timestamp: new Date() };
    set({ 
      messages: [...get().messages, userMessage],
      loading: true, 
      error: null 
    });

    try {
      const response = await api.post('/ai/ask', { query, field });
      if (response.data.success) {
        const aiMessage = { 
          role: 'ai', 
          content: response.data.data.answer, 
          timestamp: new Date(),
          tags: response.data.data.suggestedTags
        };
        set({ 
          messages: [...get().messages, aiMessage],
          loading: false 
        });
      }
    } catch (err) {
      set({ 
        error: err.response?.data?.message || 'AI is taking a nap. Try again later.', 
        loading: false 
      });
    }
  },

  clearChat: () => set({ messages: [] })
}));
