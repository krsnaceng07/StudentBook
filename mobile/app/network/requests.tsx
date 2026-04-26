import React, { useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useConnectionStore } from '../../store/connectionStore';
import RequestCard from '../../components/RequestCard';
import { useRouter } from 'expo-router';

export default function RequestsScreen() {
  const { incomingRequests, isLoading, isRefreshing, fetchPendingRequests } = useConnectionStore();
  const router = useRouter();

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  return (
    <View className="flex-1 bg-[#0F172A] pt-14">
      {/* Header */}
      <View className="px-6 flex-row items-center mb-6">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="h-10 w-10 bg-white/5 rounded-full items-center justify-center border border-white/10 mr-4"
        >
          <Ionicons name="arrow-back" size={20} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-2xl font-bold">Pending Requests</Text>
      </View>

      <FlatList
        data={incomingRequests}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <RequestCard request={item} />}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={() => fetchPendingRequests(true)} tintColor="#3B82F6" />
        }
        ListEmptyComponent={() => (
          !isLoading && (
            <View className="items-center mt-20">
              <Ionicons name="mail-unread-outline" size={60} color="#334155" />
              <Text className="text-slate-500 text-lg font-bold mt-4">No pending requests</Text>
              <Text className="text-slate-600 text-center mt-2 px-10">
                When people want to connect with you, their invites will show up here.
              </Text>
            </View>
          )
        )}
      />
    </View>
  );
}
