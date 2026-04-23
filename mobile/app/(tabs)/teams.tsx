import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTeamStore } from '../../store/teamStore';

export default function TeamsScreen() {
  const { teams, fetchTeams, isLoading } = useTeamStore();
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchTeams();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTeams(search);
    setRefreshing(false);
  };

  const handleSearch = (text: string) => {
    setSearch(text);
    // Debounce search in a real app, but for now:
    fetchTeams(text);
  };

  return (
    <View className="flex-1 bg-[#0F172A] pt-14">
      {/* Header */}
      <View className="px-6 flex-row justify-between items-center mb-6">
        <View>
          <Text className="text-white text-3xl font-bold">Teams</Text>
          <Text className="text-slate-500 mt-1">Collaborate with peers</Text>
        </View>
        <TouchableOpacity 
          onPress={() => router.push('/teams/create')}
          className="bg-[#3B82F6] h-12 w-12 rounded-2xl items-center justify-center shadow-lg shadow-[#3B82F6]/20"
        >
          <Ionicons name="add" size={28} color="white" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View className="px-6 mb-6">
        <View className="bg-white/5 border border-white/10 rounded-2xl px-4 flex-row items-center">
          <Ionicons name="search" size={20} color="#64748b" />
          <TextInput
            placeholder="Search teams by name, tech or goal..."
            placeholderTextColor="#64748b"
            className="flex-1 text-white py-4 ml-3"
            value={search}
            onChangeText={handleSearch}
          />
        </View>
      </View>

      {/* Teams List */}
      <FlatList
        data={teams}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3B82F6" />
        }
        renderItem={({ item }) => (
          <TouchableOpacity 
            onPress={() => router.push(`/teams/${item._id}`)}
            className="bg-white/5 rounded-3xl border border-white/10 p-5 mb-4"
          >
            <View className="flex-row justify-between items-start mb-3">
              <View className="flex-1">
                <Text className="text-white text-xl font-bold">{item.name}</Text>
                <View className="flex-row items-center mt-1">
                  <Ionicons name="person-circle-outline" size={12} color="#64748b" />
                  <Text className="text-slate-500 text-xs ml-1">Led by {item.leader?.name}</Text>
                </View>
              </View>
              {!item.isPublic && (
                <View className="bg-amber-500/10 px-2 py-1 rounded-lg flex-row items-center border border-amber-500/20">
                  <Ionicons name="lock-closed" size={10} color="#F59E0B" />
                  <Text className="text-amber-500 text-[10px] font-bold ml-1 uppercase">Invite Only</Text>
                </View>
              )}
            </View>

            <Text className="text-slate-400 text-sm leading-5 mb-4" numberOfLines={2}>
              {item.description}
            </Text>

            <View className="flex-row flex-wrap gap-2 mb-4">
              {item.tags?.slice(0,3).map((tag: string, idx: number) => (
                <View key={idx} className="bg-[#3B82F6]/10 px-3 py-1 rounded-full">
                  <Text className="text-[#3B82F6] text-[10px] font-bold">#{tag}</Text>
                </View>
              ))}
            </View>

            <View className="flex-row items-center justify-between pt-4 border-t border-white/5">
              <Text className="text-slate-500 text-xs">{item.members?.length || 0} Members</Text>
              <Text className="text-[#3B82F6] text-xs font-bold">View Details →</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={() => (
          !isLoading ? (
            <View className="items-center mt-20 px-10 text-center">
               <View className="bg-white/5 h-20 w-20 rounded-full items-center justify-center mb-4">
                <Ionicons name="people-outline" size={40} color="#334155" />
              </View>
              <Text className="text-slate-500 text-lg font-bold">No teams found</Text>
              <Text className="text-slate-600 text-center mt-2">
                Be the first to build a squad! Create a team and invite your connections.
              </Text>
            </View>
          ) : (
            <ActivityIndicator size="large" color="#3B82F6" className="mt-10" />
          )
        )}
      />
    </View>
  );
}
