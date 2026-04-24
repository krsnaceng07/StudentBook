import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { useChatStore } from '../../store/chatStore';
import { useAuthStore } from '../../store/authStore';
import ChatListItem from '../../components/ChatListItem';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

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
    <SafeAreaView className="flex-1 bg-[#0F172A]" edges={['top']}>
      <View className="px-6 mb-6 mt-4">
        <Text className="text-white text-3xl font-bold">Messages</Text>
      </View>

      {/* Tab Switcher */}
      <View className="px-6 mb-6">
        <View className="flex-row bg-white/5 p-1 rounded-2xl border border-white/10">
          <TouchableOpacity 
            onPress={() => setActiveTab('personal')}
            className={`flex-1 py-3 items-center rounded-xl ${activeTab === 'personal' ? 'bg-[#3B82F6]' : ''}`}
          >
            <View className="flex-row items-center">
              <Ionicons name="person" size={18} color={activeTab === 'personal' ? 'white' : '#64748b'} />
              <Text className={`ml-2 font-bold ${activeTab === 'personal' ? 'text-white' : 'text-slate-500'}`}>
                Personal
              </Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => setActiveTab('team')}
            className={`flex-1 py-3 items-center rounded-xl ${activeTab === 'team' ? 'bg-[#A855F7]' : ''}`}
          >
            <View className="flex-row items-center">
              <Ionicons name="people" size={18} color={activeTab === 'team' ? 'white' : '#64748b'} />
              <Text className={`ml-2 font-bold ${activeTab === 'team' ? 'text-white' : 'text-slate-500'}`}>
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
              <View className="bg-white/5 h-20 w-20 rounded-full items-center justify-center mb-4">
                <Ionicons 
                  name={activeTab === 'personal' ? "chatbubbles-outline" : "people-outline"} 
                  size={40} 
                  color="#334155" 
                />
              </View>
              <Text className="text-slate-500 text-lg font-bold">
                No {activeTab} messages yet
              </Text>
              <Text className="text-slate-600 text-center mt-2">
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
