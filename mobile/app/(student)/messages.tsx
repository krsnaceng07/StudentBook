import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { useUIStore } from '../../store/uiStore';
import client from '../../api/client';

export default function Messages() {
  const router = useRouter();
  const { isDarkMode } = useUIStore();
  const [search, setSearch] = useState('');
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const response = await client.get('/student/messages');
      if (response.data && response.data.success) {
        setConversations(response.data.data || []);
      }
    } catch (err) {
      console.warn('Error fetching messages inbox:', err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchConversations();
    }, [])
  );

  const filtered = conversations.filter((c) =>
    (c.other_user?.full_name || 'Classmate').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView className={`flex-1 ${isDarkMode ? 'bg-[#0F172A]' : 'bg-[#F8FAFC]'}`}>
      {/* Header */}
      <View className="px-6 pt-4 pb-3 flex-row items-center justify-between">
        <Text className={`text-2xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          Messages
        </Text>
        <TouchableOpacity 
          onPress={fetchConversations}
          className={`w-10 h-10 rounded-full items-center justify-center ${isDarkMode ? 'bg-slate-800' : 'bg-white shadow-sm'}`}
        >
          <Ionicons name="refresh" size={20} color={isDarkMode ? '#94A3B8' : '#475569'} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View className={`mx-6 mb-4 flex-row items-center rounded-xl px-4 py-2 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
        <Ionicons name="search" size={18} color={isDarkMode ? '#94A3B8' : '#64748B'} />
        <TextInput
          placeholder="Search messages..."
          placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'}
          value={search}
          onChangeText={setSearch}
          className={`flex-1 ml-2 font-medium ${isDarkMode ? 'text-white' : 'text-slate-800'}`}
        />
      </View>

      {/* Conversation List */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : filtered.length === 0 ? (
        <View className="flex-1 justify-center items-center px-12 pb-16">
          <View className={`w-24 h-24 rounded-full items-center justify-center mb-6 ${
            isDarkMode ? 'bg-slate-800' : 'bg-blue-50'
          }`}>
            <Text className="text-[52px] leading-[60px]">💬</Text>
          </View>
          <Text className={`text-[17px] font-bold text-center mb-2 ${isDarkMode ? 'text-white' : 'text-[#1E293B]'}`}>
            No messages yet
          </Text>
          <Text className={`text-xs text-center leading-5 px-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Connect with classmates in the Discover tab to start a conversation!
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.conversation_id}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => (
            <View className={`h-px mx-6 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`} />
          )}
          renderItem={({ item }) => {
            const userObj = item.other_user || { full_name: 'Classmate', initials: '??' };
            return (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => router.push({
                  pathname: `/chat/${item.conversation_id}`,
                  params: { 
                    name: userObj.full_name,
                    initials: userObj.initials 
                  }
                })}
                className={`flex-row items-center px-6 py-4`}
              >
                {/* Avatar */}
                <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 bg-blue-600`}>
                  <Text className={`font-bold text-base text-white`}>{userObj.initials || '??'}</Text>
                </View>

                {/* Content */}
                <View className="flex-1">
                  <Text className={`font-bold text-base ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    {userObj.full_name || 'Anonymous Student'}
                  </Text>
                  <Text
                    className={`text-sm mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}
                    numberOfLines={1}
                  >
                    {item.last_message || 'Start chatting...'}
                  </Text>
                </View>

                {/* Right side */}
                <View className="items-end ml-2 gap-2">
                  <Text className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                    {item.created_at ? new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}
