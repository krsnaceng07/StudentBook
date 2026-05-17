import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useUIStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import client from '../../api/client';

export default function ChatScreen() {
  const { conversationId, name, initials } = useLocalSearchParams();
  const router = useRouter();
  const { isDarkMode } = useUIStore();
  const { user } = useAuthStore();
  
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const fetchChatHistory = async () => {
    try {
      const response = await client.get(`/messages/${conversationId}`);
      if (response.data && response.data.success) {
        setMessages(response.data.data || []);
      }
    } catch (err) {
      console.warn('Error fetching chat history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChatHistory();
    // Poll chat history every 4 seconds for live updates
    const interval = setInterval(fetchChatHistory, 4000);
    return () => clearInterval(interval);
  }, [conversationId]);

  const handleSendMessage = async () => {
    if (!message.trim() || sending) return;
    
    setSending(true);
    const content = message.trim();
    setMessage('');
    
    try {
      const response = await client.post('/messages/send', {
        conversationId,
        content
      });
      if (response.data && response.data.success) {
        // Append locally instantly
        setMessages(prev => [...prev, response.data.data]);
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
      }
    } catch (err) {
      console.warn('Failed to send message:', err);
    } finally {
      setSending(false);
    }
  };

  const otherName = typeof name === 'string' ? name : 'Classmate';
  const otherInitials = typeof initials === 'string' ? initials : '??';

  return (
    <SafeAreaView className={`flex-1 ${isDarkMode ? 'bg-[#0F172A]' : 'bg-[#F8FAFC]'}`} edges={['top', 'bottom']}>
      {/* Header */}
      <View className={`px-4 py-3 flex-row items-center border-b ${isDarkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
        <TouchableOpacity onPress={() => router.back()} className="mr-3 p-2">
          <Ionicons name="chevron-back" size={24} color={isDarkMode ? '#F8FAFC' : '#0F172A'} />
        </TouchableOpacity>
        
        <View className="flex-row items-center flex-1">
          <View className="w-10 h-10 rounded-full bg-blue-600 items-center justify-center mr-3">
            <Text className="text-white font-bold">{otherInitials}</Text>
          </View>
          <View>
            <Text className={`font-bold text-base ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{otherName}</Text>
            <View className="flex-row items-center mt-0.5">
              <Text className="text-blue-500 text-xs font-medium">Online</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity onPress={fetchChatHistory} className="p-2">
          <Ionicons name="refresh" size={20} color={isDarkMode ? '#94A3B8' : '#64748B'} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {loading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#2563EB" />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            className="flex-1 px-4"
            contentContainerStyle={{ paddingVertical: 16 }}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            renderItem={({ item }) => {
              const isMe = item.sender_id === user?.id;
              
              return (
                <View className={`mb-4 max-w-[80%] ${isMe ? 'self-end' : 'self-start'}`}>
                  <View 
                    className={`px-4 py-3 rounded-2xl ${
                      isMe 
                        ? 'bg-blue-600 rounded-tr-sm' 
                        : isDarkMode 
                          ? 'bg-slate-800 rounded-tl-sm' 
                          : 'bg-white rounded-tl-sm shadow-sm'
                    }`}
                  >
                    <Text className={`text-[15px] leading-6 ${isMe ? 'text-white' : isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                      {item.content}
                    </Text>
                  </View>
                </View>
              );
            }}
          />
        )}

        {/* Input Bar */}
        <View className={`px-4 py-3 flex-row items-center border-t ${isDarkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-100 bg-white'}`}>
          <View className={`flex-1 flex-row items-center px-4 py-2.5 rounded-full mr-3 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
            <TextInput
              className={`flex-1 mr-2 text-[15px] ${isDarkMode ? 'text-white' : 'text-slate-900'}`}
              placeholder="Message..."
              placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'}
              value={message}
              onChangeText={setMessage}
              multiline
              maxLength={500}
            />
          </View>
          <TouchableOpacity 
            onPress={handleSendMessage}
            className={`w-11 h-11 rounded-full items-center justify-center ${message.trim() ? 'bg-blue-600' : isDarkMode ? 'bg-slate-700' : 'bg-slate-500 opacity-50'}`}
            disabled={!message.trim() || sending}
          >
            <Ionicons name="send" size={18} color="white" style={{ marginLeft: 2 }} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
