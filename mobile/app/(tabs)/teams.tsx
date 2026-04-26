import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, ActivityIndicator, RefreshControl, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTeamStore } from '../../store/teamStore';
import { SafeAreaView } from 'react-native-safe-area-context';
import TeamCard from '../../components/TeamCard';

const CATEGORIES = ['All', 'Study Group', 'Research', 'Startup', 'Hackathon', 'Competitive Exams', 'Open Source', 'Project'];

export default function TeamsScreen() {
  const { teams, fetchTeams, isLoading } = useTeamStore();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchTeams();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTeams(search, selectedCategory !== 'All' ? selectedCategory : undefined);
    setRefreshing(false);
  };

  const handleSearch = (text: string) => {
    setSearch(text);
    fetchTeams(text, selectedCategory !== 'All' ? selectedCategory : undefined);
  };

  const handleCategorySelect = (cat: string) => {
    setSelectedCategory(cat);
    fetchTeams(search, cat !== 'All' ? cat : undefined);
  };

  const { suggestedTeams, otherTeams } = useMemo(() => {
    const suggested = teams.filter(t => t.matchScore && t.matchScore >= 50);
    const others = teams.filter(t => !t.matchScore || t.matchScore < 50);
    return { suggestedTeams: suggested, otherTeams: others };
  }, [teams]);

  const renderHeader = () => (
    <View className="mb-6">
      {/* Search Bar */}
      <View className="bg-white/5 border border-white/10 rounded-3xl px-4 flex-row items-center mb-6">
        <Ionicons name="search" size={20} color="#64748b" />
        <TextInput
          placeholder="Find your squad..."
          placeholderTextColor="#64748b"
          className="flex-1 text-white py-4 ml-3 font-medium"
          value={search}
          onChangeText={handleSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch('')}>
            <Ionicons name="close-circle" size={20} color="#64748b" />
          </TouchableOpacity>
        )}
      </View>

      {/* Categories Scroll */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6 -mx-6 px-6">
        <View className="flex-row gap-3 pr-12">
          {CATEGORIES.map((cat) => (
            <TouchableOpacity 
              key={cat}
              onPress={() => handleCategorySelect(cat)}
              className={`px-5 py-2.5 rounded-2xl border ${selectedCategory === cat ? 'bg-[#3B82F6] border-[#3B82F6]' : 'bg-white/5 border-white/10'}`}
            >
              <Text className={`font-bold text-xs ${selectedCategory === cat ? 'text-white' : 'text-slate-400'}`}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Suggested Section */}
      {suggestedTeams.length > 0 && !search && selectedCategory === 'All' && (
        <View className="mb-8">
          <View className="flex-row items-center justify-between mb-4">
             <View className="flex-row items-center">
               <Text className="text-white text-xl font-bold">Suggested for You</Text>
               <View className="bg-[#3B82F6]/20 px-2 py-0.5 rounded-md ml-2">
                 <Text className="text-[#3B82F6] text-[10px] font-bold">SMART MATCH</Text>
               </View>
             </View>
          </View>
          {suggestedTeams.map(team => (
            <TeamCard key={team._id} team={{ ...team, teamId: team._id }} />
          ))}
          <View className="flex-row items-center mb-2 mt-4">
            <Text className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Recent Teams</Text>
            <View className="flex-1 h-[1px] bg-white/5 ml-4" />
          </View>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-[#0F172A]" edges={['top']}>
      <FlatList
        data={otherTeams}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}
        ListHeaderComponent={(
          <View>
            {/* Title Header */}
            <View className="flex-row justify-between items-center mb-8 mt-6">
              <View>
                <Text className="text-white text-4xl font-black">Teams</Text>
                <Text className="text-slate-500 font-medium">Build. Grow. Conquer.</Text>
              </View>
              <TouchableOpacity 
                onPress={() => router.push('/teams/create')}
                className="bg-[#3B82F6] h-14 w-14 rounded-[22px] items-center justify-center shadow-2xl shadow-[#3B82F6]/40"
              >
                <Ionicons name="add" size={32} color="white" />
              </TouchableOpacity>
            </View>
            {renderHeader()}
          </View>
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3B82F6" />
        }
        renderItem={({ item }) => (
          <TeamCard team={{ ...item, teamId: item._id }} />
        )}
        ListEmptyComponent={() => (
          !isLoading ? (
            <View className="items-center mt-20 px-10 text-center">
               <View className="bg-white/5 h-24 w-24 rounded-[32px] items-center justify-center mb-6 border border-white/5">
                <Ionicons name="people-outline" size={48} color="#334155" />
              </View>
              <Text className="text-slate-400 text-xl font-bold">No squads found</Text>
              <Text className="text-slate-600 text-center mt-3 leading-5">
                Don't wait for the perfect team. Create one and lead the mission!
              </Text>
              <TouchableOpacity 
                onPress={() => router.push('/teams/create')}
                className="mt-8 bg-white/5 border border-white/10 px-6 py-3 rounded-2xl"
              >
                <Text className="text-[#3B82F6] font-bold">Create New Team</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ActivityIndicator size="large" color="#3B82F6" className="mt-10" />
          )
        )}
      />
    </SafeAreaView>
  );
}
