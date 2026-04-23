import React, { useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useConnectionStore } from '../../store/connectionStore';
import NetworkUserCard from '../../components/NetworkUserCard';
import { useRouter } from 'expo-router';

export default function ConnectionsScreen() {
  const { connections, isLoading, isRefreshing, fetchConnections } = useConnectionStore();
  const router = useRouter();

  useEffect(() => {
    fetchConnections();
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
        <View>
          <Text className="text-white text-2xl font-bold">My Connections</Text>
          <Text className="text-slate-400 text-xs">{connections.length} total students</Text>
        </View>
      </View>

      <FlatList
        data={connections}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <NetworkUserCard user={item} />}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
        refreshControl={
          <RefreshControl 
            refreshing={isRefreshing} 
            onRefresh={fetchConnections} 
            tintColor="#3B82F6" 
          />
        }
        ListEmptyComponent={() => (
          !isLoading && (
            <View className="items-center mt-20 px-10">
              <View className="bg-white/5 h-20 w-20 rounded-full items-center justify-center mb-4">
                <Ionicons name="people-outline" size={40} color="#334155" />
              </View>
              <Text className="text-slate-500 text-lg font-bold">No connections yet</Text>
              <Text className="text-slate-600 text-center mt-2">
                Grow your network by connecting with students from the Discover tab!
              </Text>
            </View>
          )
        )}
      />
    </View>
  );
}
