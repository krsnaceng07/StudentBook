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
  fetchTimeout: null,

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
      auth: { token, userId } 
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
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );

          return { messages: sortedMessages };
        });
      }

      // 2. Refresh lists to update 'last message' snippets (debounced)
      if (get().fetchTimeout) clearTimeout(get().fetchTimeout);
      const timeout = setTimeout(() => {
        get().fetchConversations();
      }, 1000);
      set({ fetchTimeout: timeout });
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

      // Show a subtle toast if it's not a message (messages have their own feedback)
      if (notification.type !== 'message') {
        const { useUIStore } = require('./uiStore');
        useUIStore.getState().showToast(`New ${notification.type.replace('_', ' ')} alert!`, 'info');
      }
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

    newSocket.on('message_seen', ({ conversationId, userId }) => {
      if (get().activeConversationId === conversationId) {
        set((state) => ({
          messages: state.messages.map(m => 
            m.sender._id === userId ? m : { ...m, status: 'seen' }
          )
        }));
      }
    });

    newSocket.on('message_reaction', ({ messageId, userId, emoji, action }) => {
      set((state) => ({
        messages: state.messages.map(m => {
          if (m._id === messageId) {
            const reactions = [...(m.reactions || [])];
            if (action === 'add') {
              reactions.push({ user: userId, emoji });
            } else {
              const idx = reactions.findIndex(r => (r.user._id || r.user) === userId && r.emoji === emoji);
              if (idx > -1) reactions.splice(idx, 1);
            }
            return { ...m, reactions };
          }
          return m;
        })
      }));
    });

    newSocket.on('message_deleted', ({ messageId }) => {
      set((state) => ({
        messages: state.messages.map(m => 
          m._id === messageId ? { ...m, status: 'deleted', text: 'This message was deleted', attachments: [] } : m
        )
      }));
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
    if (!conversationId || conversationId === 'undefined' || conversationId === 'null' || conversationId === 'new') return;
    set({ 
      isLoading: !cursor, 
      activeConversationId: conversationId // Set immediately to capture socket messages during load
    });
    try {
      const params = cursor ? { cursor } : {};
      const res = await client.get(`/chat/${conversationId}/messages`, { params });
      
      set((state) => {
        const incomingMessages = res.data.data;
        
        // Use a Map to merge incoming messages with any messages received via socket during the fetch
        const map = new Map();
        if (cursor) {
          // If paginating, keep existing
          state.messages.forEach(m => map.set(m._id, m));
        }
        // Add incoming from server
        incomingMessages.forEach(m => map.set(m._id, m));
        
        // Also keep any socket messages that arrived while we were fetching (if not already in incoming)
        if (!cursor) {
           state.messages.forEach(m => {
             if (m.conversationId === conversationId) map.set(m._id, m);
           });
        }

        const sortedMessages = Array.from(map.values()).sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        return {
          messages: sortedMessages,
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
        }
      });

      console.log('[Upload] Success:', res.data.url);
      // Return ONLY the file data without the success flag to avoid validation errors
      const cleanFileData = {
        url: res.data.url,
        type: res.data.type,
        name: res.data.name,
        size: res.data.size
      };
      return { success: true, data: cleanFileData };
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Unknown upload error';
      console.log('[Upload Error] Details:', {
        message: errorMsg,
        status: error.response?.status,
        data: error.response?.data
      });
      const { useUIStore } = require('./uiStore');
      useUIStore.getState().showToast(errorMsg, 'error');
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
      messages: [optimisticMsg, ...state.messages]
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

  toggleReaction: async (messageId, emoji) => {
    try {
      const res = await client.patch(`/chat/messages/${messageId}/reaction`, { emoji });
      const { action } = res.data;
      
      // Update local state immediately for snappy feel
      const userId = require('./authStore').useAuthStore.getState().user._id;
      set((state) => ({
        messages: state.messages.map(m => {
          if (m._id === messageId) {
            const reactions = [...(m.reactions || [])];
            if (action === 'add') {
              reactions.push({ user: userId, emoji });
            } else {
              const idx = reactions.findIndex(r => (r.user._id || r.user) === userId && r.emoji === emoji);
              if (idx > -1) reactions.splice(idx, 1);
            }
            return { ...m, reactions };
          }
          return m;
        })
      }));

      // Notify socket
      const { socket, activeConversationId } = get();
      if (socket) {
        socket.emit('message_reaction', { 
          conversationId: activeConversationId, 
          messageId, 
          emoji, 
          action 
        });
      }
    } catch (error) {
      console.error('Toggle Reaction Error:', error);
    }
  },

  markAsSeen: async (conversationId) => {
    if (!conversationId || conversationId === 'undefined' || conversationId === 'null' || conversationId === 'new') return;
    try {
      await client.patch(`/chat/conversations/${conversationId}/seen`);
      
      const { socket } = get();
      if (socket) {
        socket.emit('message_seen', { conversationId });
      }

      // Update local state
      set((state) => ({
        messages: state.messages.map(m => 
          m.status !== 'seen' ? { ...m, status: 'seen' } : m
        )
      }));
    } catch (error) {
      console.error('Mark as Seen Error:', error);
    }
  },

  deleteMessage: async (messageId) => {
    try {
      await client.delete(`/chat/messages/${messageId}`);
      // Local state will be updated by socket or manually here if needed
      set((state) => ({
        messages: state.messages.map(m => 
          m._id === messageId ? { ...m, status: 'deleted', text: 'This message was deleted', attachments: [] } : m
        )
      }));
      return { success: true };
    } catch (error) {
      console.error('Delete Message Error:', error);
      return { success: false, error: 'Failed to delete message' };
    }
  },

  clearActiveChat: () => set({ activeConversationId: null, messages: [] }),
}));
