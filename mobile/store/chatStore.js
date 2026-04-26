import { create } from 'zustand';
import { io } from 'socket.io-client';
import client, { SOCKET_URL } from '../api/client';

export const useChatStore = create((set, get) => ({
  socket: null,
  personalConversations: [],
  teamConversations: [],
  activeConversationId: null,
  messages: [], // messages for the ACTIVE conversation
  typingUsers: {}, // conversationId -> { userId: name }
  onlineUsers: new Set(), // Set of userIds
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
    
    // We need the token for the secure handshake
    const { useAuthStore } = require('./authStore');
    const token = useAuthStore.getState().token;

    const newSocket = io(SOCKET_URL, {
      query: { token }, // Use token instead of userId for security
      auth: { userId } 
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
          // Use a Map to ensure unique messages by _id
          state.messages.forEach(m => map.set(m._id, m));
          map.set(message._id, message);
          
          const sortedMessages = Array.from(map.values()).sort(
            (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );

          return { messages: sortedMessages };
        });
      }

      // 2. Refresh both lists to update 'last message' snippets
      get().fetchConversations();
    });

    newSocket.on('typing', ({ conversationId, userId, name }) => {
      set((state) => {
        const current = { ...state.typingUsers };
        if (!current[conversationId]) current[conversationId] = {};
        current[conversationId][userId] = name;
        return { typingUsers: current };
      });
    });

    newSocket.on('stop_typing', ({ conversationId, userId }) => {
      set((state) => {
        const current = { ...state.typingUsers };
        if (current[conversationId]) {
          delete current[conversationId][userId];
        }
        return { typingUsers: current };
      });
    });

    newSocket.on('user_online', ({ userId }) => {
      set((state) => {
        const newOnline = new Set(state.onlineUsers);
        newOnline.add(userId);
        return { onlineUsers: newOnline };
      });
    });

    newSocket.on('user_offline', ({ userId }) => {
      set((state) => {
        const newOnline = new Set(state.onlineUsers);
        newOnline.delete(userId);
        return { onlineUsers: newOnline };
      });
    });

    newSocket.on('new_notification', (notification) => {
      console.log('[Socket] New notification received:', notification.type);
      const { useNotificationStore } = require('./notificationStore');
      useNotificationStore.getState().addNotification(notification);
    });

    newSocket.on('team_joined', ({ teamId }) => {
      console.log('[Socket] New team joined, syncing rooms...');
      newSocket.emit('sync_rooms');
      get().fetchConversations(); // Update lists
      
      // Refresh notifications to show the 'team_accepted' alert
      const { useNotificationStore } = require('./notificationStore');
      useNotificationStore.getState().fetchNotifications();
    });

    newSocket.on('new_team_request', ({ teamId, requesterName }) => {
      console.log('[Socket] New team request received');
      const { useNotificationStore } = require('./notificationStore');
      useNotificationStore.getState().fetchNotifications();
    });

    newSocket.on('new_connection_request', ({ senderId, senderName }) => {
      console.log('[Socket] New connection request received');
      const { useNotificationStore } = require('./notificationStore');
      useNotificationStore.getState().fetchNotifications();
      
      // Also refresh connection store to update pending badges
      const { useConnectionStore } = require('./connectionStore');
      useConnectionStore.getState().fetchPendingRequests();
    });

    newSocket.on('connection_accepted', ({ senderId, senderName }) => {
      console.log('[Socket] Connection accepted');
      const { useNotificationStore } = require('./notificationStore');
      useNotificationStore.getState().fetchNotifications();
      
      // Refresh connections list
      const { useConnectionStore } = require('./connectionStore');
      useConnectionStore.getState().fetchConnections();
    });

    newSocket.on('post_updated', ({ postId, likesCount, commentsCount }) => {
      const { usePostStore } = require('./postStore');
      usePostStore.getState().updatePostStats(postId, likesCount, commentsCount);
    });

    set({ socket: newSocket });
  },

  setTyping: (conversationId) => {
    const { socket } = get();
    if (socket) {
      const { useAuthStore } = require('./authStore');
      const user = useAuthStore.getState().user;
      socket.emit('typing', { conversationId, name: user?.name });
    }
  },

  stopTyping: (conversationId) => {
    const { socket } = get();
    if (socket) {
      socket.emit('stop_typing', { conversationId });
    }
  },

  syncRooms: () => {
    const { socket } = get();
    if (socket) {
      console.log('[Socket] Manually syncing rooms...');
      socket.emit('sync_rooms');
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
        
        const sortedMessages = Array.from(map.values()).sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );

        return {
          messages: sortedMessages,
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
    // 1. Create Optimistic Message
    const tempId = `temp_${Date.now()}`;
    const { useAuthStore } = require('./authStore');
    const { useProfileStore } = require('./profileStore');
    const user = useAuthStore.getState().user;
    const profile = useProfileStore.getState().profile;

    const optimisticMsg = {
      _id: tempId,
      conversationId,
      sender: {
        _id: user?._id || user?.id,
        name: user?.name,
        avatar: profile?.avatar || null
      },
      text,
      attachments,
      createdAt: new Date().toISOString(),
      sending: true
    };

    // 2. Add to UI immediately
    set((state) => ({
      messages: [...state.messages, optimisticMsg]
    }));

    try {
      const res = await client.post(`/chat/${conversationId}/messages`, { 
        text,
        replyTo: replyToId,
        attachments
      });
      const newMessage = res.data.data;

      // 3. Replace temp message with server message, but ONLY if not already added by socket
      set((state) => {
        const alreadyExists = state.messages.some(m => m._id === newMessage._id);
        if (alreadyExists) {
          // If socket already added it, just remove the temporary one
          return { messages: state.messages.filter(m => m._id !== tempId) };
        }
        // Otherwise replace the temp one with the real one
        return {
          messages: state.messages.map(m => m._id === tempId ? newMessage : m)
        };
      });
      
      get().fetchConversations();
      return { success: true };
    } catch (error) {
      // 4. Remove optimistic message on failure
      set((state) => ({
        messages: state.messages.filter(m => m._id !== tempId)
      }));
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
