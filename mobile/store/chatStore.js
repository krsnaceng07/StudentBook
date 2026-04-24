import { create } from 'zustand';
import { io } from 'socket.io-client';
import client, { SOCKET_URL } from '../api/client';

export const useChatStore = create((set, get) => ({
  socket: null,
  personalConversations: [],
  teamConversations: [],
  activeConversationId: null,
  messages: [], // messages for the ACTIVE conversation
  isLoading: false,
  error: null,

  initSocket: (userId) => {
    const existingSocket = get().socket;
    
    // If socket exists, check if it's for the same user
    if (existingSocket) {
      if (existingSocket.auth?.userId === userId) return;
      
      // If different user, disconnect first
      console.log('[Socket] User ID changed, reconnecting...');
      existingSocket.disconnect();
    }

    console.log('[Socket] Initializing for user:', userId);
    
    const newSocket = io(SOCKET_URL, {
      query: { userId },
      auth: { userId } // Also store in auth for easy comparison
    });

    newSocket.on('connect', () => {
      console.log('[Socket] Connected as', userId);
    });

    newSocket.on('receive_message', (message) => {
      console.log('[Socket] Received message:', message);
      
      // 1. If message is for the current active chat, append & dedupe
      if (get().activeConversationId === message.conversationId) {
        set((state) => {
          const map = new Map();
          state.messages.forEach(m => map.set(m._id, m));
          map.set(message._id, message);
          
          return {
            messages: Array.from(map.values()).sort((a,b) => new Date(a.createdAt) - new Date(b.createdAt))
          };
        });
      }

      // 2. Refresh both lists to update 'last message' snippets
      get().fetchConversations();
    });

    newSocket.on('team_joined', ({ teamId }) => {
      console.log('[Socket] New team joined, syncing rooms...');
      newSocket.emit('sync_team_rooms');
      get().fetchConversations(); // Update lists
    });

    set({ socket: newSocket });
  },

  syncRooms: () => {
    const { socket } = get();
    if (socket) {
      console.log('[Socket] Manually syncing rooms...');
      socket.emit('sync_team_rooms');
    }
  },

  disconnectSocket: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null });
    }
  },

  fetchConversations: async () => {
    try {
      // Parallel fetch for personal and team conversations
      const [personalRes, teamRes] = await Promise.all([
        client.get('/chat/conversations?type=personal'),
        client.get('/chat/conversations?type=team')
      ]);
      
      set({ 
        personalConversations: personalRes.data.data,
        teamConversations: teamRes.data.data
      });
    } catch (error) {
      console.error('Fetch Conversations Error:', error);
    }
  },

  fetchMessages: async (conversationId, cursor = null) => {
    set({ isLoading: !cursor }); // only show loading for initial fetch
    try {
      const params = cursor ? { cursor } : {};
      const res = await client.get(`/chat/${conversationId}/messages`, { params });
      
      set((state) => {
        const incomingMessages = res.data.data;
        
        // If it's a fresh fetch (no cursor), just replace
        if (!cursor) {
          return {
            messages: incomingMessages,
            activeConversationId: conversationId,
            isLoading: false
          };
        }

        // If it's paginated, merge and dedupe
        const map = new Map();
        state.messages.forEach(m => map.set(m._id, m));
        incomingMessages.forEach(m => map.set(m._id, m));
        
        return {
          messages: Array.from(map.values()).sort((a,b) => new Date(a.createdAt) - new Date(b.createdAt)),
          activeConversationId: conversationId,
          isLoading: false
        };
      });
    } catch (error) {
      set({ error: 'Failed to fetch messages', isLoading: false });
    }
  },

  uploadMedia: async (file) => {
    try {
      console.log('[Upload] Starting upload for:', file.name, 'Type:', file.mimeType);
      
      const formData = new FormData();
      // Ensure the object structure matches what React Native's FormData expects
      const fileData = {
        uri: file.uri,
        name: file.name || 'upload.bin',
        type: file.mimeType || 'application/octet-stream',
      };

      formData.append('file', fileData);

      const res = await client.post('/upload/chat', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
        },
        // Increase timeout for large files
        timeout: 30000, 
      });

      console.log('[Upload] Success:', res.data.url);
      return { success: true, data: res.data };
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Unknown upload error';
      console.error('[Upload Error] Details:', {
        message: errorMsg,
        status: error.response?.status,
        data: error.response?.data
      });
      return { success: false, error: errorMsg };
    }
  },

  sendMessage: async (conversationId, text, replyToId = null, attachments = []) => {
    try {
      const res = await client.post(`/chat/${conversationId}/messages`, { 
        text,
        replyTo: replyToId,
        attachments
      });
      const newMessage = res.data.data;

      // Append & Dedupe locally for instant feedback
      set((state) => {
        const map = new Map();
        state.messages.forEach(m => map.set(m._id, m));
        map.set(newMessage._id, newMessage);
        
        return {
          messages: Array.from(map.values()).sort((a,b) => new Date(a.createdAt) - new Date(b.createdAt))
        };
      });
      
      // Update snippets
      get().fetchConversations();

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to send message' };
    }
  },

  createConversation: async (recipientId) => {
    try {
      const res = await client.post('/chat/conversations', { recipientId });
      get().fetchConversations();
      return { success: true, conversation: res.data.data };
    } catch (error) {
      return { success: false, error: 'Failed to create conversation' };
    }
  },

  clearActiveChat: () => set({ activeConversationId: null, messages: [] }),
}));
