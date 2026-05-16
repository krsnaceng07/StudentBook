import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { useChatStore } from '../../store/chatStore';
import { useAuthStore } from '../../store/authStore';
import ChatListItem from '../../components/ChatListItem';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import useUIStore from '../../store/uiStore';

export default function ChatListScreen() {
  const { 
    personalConversations, 
    teamConversations, 
    fetchConversations, 
    isLoading
  } = useChatStore();
  const { user } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'personal' | 'team'>('personal');
  const { isDarkMode } = useUIStore();

  useEffect(() => {
    // Socket is already initialized by _layout.tsx — just fetch conversations
    fetchConversations();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchConversations();
    setRefreshing(false);
  };

  const currentData = activeTab === 'personal' ? personalConversations : teamConversations;

  return (
    <SafeAreaView className={`flex-1 ${isDarkMode ? 'bg-[#0F172A]' : 'bg-white'}`} edges={['top']}>
      <View className="px-6 mb-6 mt-4">
        <Text className={`${isDarkMode ? 'text-white' : 'text-black'} text-3xl font-bold`}>Messages</Text>
      </View>

      {/* Tab Switcher */}
      <View className="px-6 mb-6">
        <View className={`flex-row ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'} p-1 rounded-2xl border`}>
          <TouchableOpacity 
            onPress={() => setActiveTab('personal')}
            className={`flex-1 py-3 items-center rounded-xl ${activeTab === 'personal' ? (isDarkMode ? 'bg-white' : 'bg-black') : ''}`}
          >
            <View className="flex-row items-center">
              <Ionicons name="person" size={18} color={activeTab === 'personal' ? (isDarkMode ? 'black' : 'white') : (isDarkMode ? '#64748b' : '#94A3B8')} />
              <Text className={`ml-2 font-bold ${activeTab === 'personal' ? (isDarkMode ? 'text-black' : 'text-white') : (isDarkMode ? 'text-slate-500' : 'text-slate-400')}`}>
                Personal
              </Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => setActiveTab('team')}
            className={`flex-1 py-3 items-center rounded-xl ${activeTab === 'team' ? (isDarkMode ? 'bg-white' : 'bg-black') : ''}`}
          >
            <View className="flex-row items-center">
              <Ionicons name="people" size={18} color={activeTab === 'team' ? (isDarkMode ? 'black' : 'white') : (isDarkMode ? '#64748b' : '#94A3B8')} />
              <Text className={`ml-2 font-bold ${activeTab === 'team' ? (isDarkMode ? 'text-black' : 'text-white') : (isDarkMode ? 'text-slate-500' : 'text-slate-400')}`}>
                Teams
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={currentData}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <ChatListItem conversation={item} />}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3B82F6" />
        }
        ListEmptyComponent={() => (
          !isLoading ? (
            <View className="items-center mt-20 px-10">
              <View className={`${isDarkMode ? 'bg-white/5' : 'bg-slate-100'} h-20 w-20 rounded-full items-center justify-center mb-4`}>
                <Ionicons 
                  name={activeTab === 'personal' ? "chatbubbles-outline" : "people-outline"} 
                  size={40} 
                  color={isDarkMode ? "#334155" : "#CBD5E1"} 
                />
              </View>
              <Text className={`${isDarkMode ? 'text-slate-500' : 'text-slate-400'} text-lg font-bold`}>
                No {activeTab} messages yet
              </Text>
              <Text className={`${isDarkMode ? 'text-slate-600' : 'text-slate-500'} text-center mt-2`}>
                {activeTab === 'personal' 
                  ? "Connect with students from the Discover tab to start collaborating."
                  : "Join or create a team to start building something amazing!"}
              </Text>
            </View>
          ) : (
            <ActivityIndicator size="large" color="#3B82F6" className="mt-10" />
          )
        )}
      />
    </SafeAreaView>
  );
}
