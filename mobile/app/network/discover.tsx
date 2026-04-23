import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, ActivityIndicator, RefreshControl, Keyboard } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDiscoverStore } from '../../store/discoverStore';
import UserCard from '../../components/UserCard';
import { useRouter } from 'expo-router';
import SkeletonCard from '../../components/SkeletonCard';

const POPULAR_SKILLS = ['React', 'Node', 'Python', 'UI/UX', 'AI', 'Fullstack'];
const FIELDS = ['Engineering', 'Design', 'Business', 'Marketing', 'Science'];

export default function DiscoverPeopleScreen() {
  const { 
    users, isLoading, isRefreshing, filters,
    fetchUsers, setFilters, resetFilters, hasMore
  } = useDiscoverStore();
  
  const router = useRouter();
  const [localSearch, setLocalSearch] = useState(filters.search);
  const [showFilters, setShowFilters] = useState(false);

  // Use a ref to track if we should trigger a search
  const searchTimeout = React.useRef<NodeJS.Timeout | null>(null);

  const handleSearchChange = (text: string) => {
    setLocalSearch(text);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setFilters({ search: text });
    }, 500);
  };

  useEffect(() => {
    fetchUsers();
    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, []);

  const onRefresh = useCallback(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleLoadMore = useCallback(() => {
    if (hasMore && !isLoading) {
      fetchUsers(true);
    }
  }, [hasMore, isLoading, fetchUsers]);

  const toggleSkill = useCallback((skill: string) => {
    const newSkills = filters.skills.includes(skill)
      ? (filters.skills as string[]).filter((s: string) => s !== skill)
      : [...filters.skills, skill];
    setFilters({ skills: newSkills });
  }, [filters.skills, setFilters]);

  const renderHeader = useMemo(() => (
    <View className="px-6 pb-4">
      <View className="flex-row items-center justify-between mb-6">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-2xl font-bold">Discover People</Text>
        </View>
      </View>

      <View className="flex-row items-center bg-white/5 rounded-2xl border border-white/10 px-4 py-3 mb-4">
        <Ionicons name="search" size={20} color="#94A3B8" />
        <TextInput
          className="flex-1 ml-2 text-white text-base"
          placeholder="Search by name, skills..."
          placeholderTextColor="#94A3B8"
          value={localSearch}
          onChangeText={handleSearchChange}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity onPress={() => setShowFilters(!showFilters)}>
          <Ionicons name="options-outline" size={22} color={showFilters ? "#3B82F6" : "#94A3B8"} />
        </TouchableOpacity>
      </View>

      {showFilters && (
        <View className="bg-white/10 rounded-2xl border border-white/10 p-4 mb-4">
          <Text className="text-slate-400 text-xs uppercase font-bold mb-3">Field of Study</Text>
          <View className="flex-row flex-wrap gap-2 mb-4">
            {FIELDS.map((f) => (
              <TouchableOpacity 
                key={f}
                onPress={() => setFilters({ field: filters.field === f ? '' : f })}
                className={`px-3 py-1.5 rounded-full border ${filters.field === f ? 'bg-[#3B82F6] border-[#3B82F6]' : 'bg-white/5 border-white/10'}`}
              >
                <Text className={`text-xs ${filters.field === f ? 'text-white' : 'text-slate-400'}`}>{f}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text className="text-slate-400 text-xs uppercase font-bold mb-3">Skills</Text>
          <View className="flex-row flex-wrap gap-2 mb-4">
            {POPULAR_SKILLS.map((s) => (
              <TouchableOpacity 
                key={s}
                onPress={() => toggleSkill(s)}
                className={`px-3 py-1.5 rounded-full border ${filters.skills.includes(s) ? 'bg-[#3B82F6] border-[#3B82F6]' : 'bg-white/5 border-white/10'}`}
              >
                <Text className={`text-xs ${filters.skills.includes(s) ? 'text-white' : 'text-slate-400'}`}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity 
            onPress={() => { resetFilters(); setLocalSearch(''); }} 
            className="mt-2 items-center"
          >
            <Text className="text-[#3B82F6] text-xs font-bold uppercase">Clear All Filters</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  ), [localSearch, showFilters, filters, router, setFilters, resetFilters, toggleSkill]);

  return (
    <View className="flex-1 bg-[#0F172A] pt-14">
      <FlatList
        data={users}
        keyExtractor={(item) => item.userId}
        renderItem={({ item }) => (
          <View className="px-6">
            <UserCard user={item} />
          </View>
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={() => (
          isLoading ? (
            <View className="px-6">
              {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
            </View>
          ) : (
            <View className="items-center mt-10 px-10">
              <Ionicons name="people-outline" size={60} color="#334155" />
              <Text className="text-slate-500 text-lg font-bold mt-4">No matches found</Text>
              <Text className="text-slate-600 text-center mt-2">Try adjusting your search or filters.</Text>
            </View>
          )
        )}
        ListFooterComponent={() => (
          hasMore && isLoading && (
            <View className="py-6">
              <ActivityIndicator color="#3B82F6" />
            </View>
          )
        )}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="#3B82F6" />
        }
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </View>
  );
}
