import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, ActivityIndicator, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSearchStore } from '../../store/searchStore';
import UserCard from '../../components/UserCard';
import PostCard from '../../components/PostCard';

const TABS = ['All', 'Students', 'Teams', 'Posts'];

export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const { results, isLoading, performUnifiedSearch, recentSearches, removeRecentSearch, clearResults } = useSearchStore();
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    // Focus input on mount
    setTimeout(() => inputRef.current?.focus(), 100);
    return () => clearResults();
  }, []);

  const handleSearch = (text: string) => {
    setQuery(text);
    performUnifiedSearch(text);
  };

  const renderTeamCard = ({ item }: { item: any }) => (
    <TouchableOpacity 
      onPress={() => router.push(`/teams/${item._id}`)}
      className="bg-white/5 p-4 rounded-2xl border border-white/10 mb-3"
    >
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center flex-1">
          <View className="h-10 w-10 rounded-xl bg-[#3B82F6]/20 items-center justify-center mr-3">
            <Ionicons name="people" size={20} color="#3B82F6" />
          </View>
          <View className="flex-1">
            <Text className="text-white font-bold text-lg" numberOfLines={1}>{item.name}</Text>
            <Text className="text-slate-400 text-xs">Led by {item.leaderName}</Text>
          </View>
        </View>
        <View className="bg-[#3B82F6]/10 px-2 py-1 rounded-lg">
          <Text className="text-[#3B82F6] text-[10px] font-bold uppercase">{item.category}</Text>
        </View>
      </View>
      <Text className="text-slate-300 text-sm mb-3" numberOfLines={2}>{item.description}</Text>
      <View className="flex-row flex-wrap gap-2">
        {item.tags?.slice(0, 3).map((tag: string) => (
          <View key={tag} className="bg-white/5 px-2 py-1 rounded-md border border-white/5">
            <Text className="text-slate-500 text-[10px]">#{tag}</Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );

  const renderSection = (title: string, data: any[], renderItem: any, seeAllType?: string) => {
    if (data.length === 0) return null;
    return (
      <View className="mb-6">
        <View className="flex-row items-center justify-between mb-4 px-6">
          <Text className="text-slate-400 text-xs font-bold uppercase tracking-widest">{title}</Text>
          {seeAllType && data.length >= 5 && (
            <TouchableOpacity onPress={() => setActiveTab(seeAllType)}>
              <Text className="text-[#3B82F6] text-xs font-bold">See More</Text>
            </TouchableOpacity>
          )}
        </View>
        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={(item) => item._id || item.userId}
          scrollEnabled={false}
          contentContainerStyle={{ paddingHorizontal: 24 }}
        />
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0F172A]" edges={['top']}>
      {/* Search Header */}
      <View className="px-6 py-4 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View className="flex-1 flex-row items-center bg-white/5 rounded-2xl border border-white/10 px-4 py-2.5">
          <Ionicons name="search" size={20} color="#3B82F6" />
          <TextInput
            ref={inputRef}
            className="flex-1 ml-2 text-white text-base"
            placeholder="Search students, teams, posts..."
            placeholderTextColor="#64748B"
            value={query}
            onChangeText={handleSearch}
            autoCapitalize="none"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Ionicons name="close-circle" size={20} color="#64748B" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Tabs */}
      {query.length >= 2 && (
        <View className="px-6 mb-4">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {TABS.map(tab => (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                className={`mr-4 px-4 py-2 rounded-full border ${activeTab === tab ? 'bg-[#3B82F6] border-[#3B82F6]' : 'bg-white/5 border-white/10'}`}
              >
                <Text className={`text-sm font-bold ${activeTab === tab ? 'text-white' : 'text-slate-400'}`}>{tab}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Content */}
      <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
        {query.length < 2 ? (
          <View className="px-6 pt-4">
            {recentSearches.length > 0 && (
              <View className="mb-8">
                <Text className="text-white text-lg font-bold mb-4">Recent Searches</Text>
                {recentSearches.map((s: string) => (
                  <View key={s} className="flex-row items-center justify-between py-3 border-b border-white/5">
                    <TouchableOpacity onPress={() => handleSearch(s)} className="flex-row items-center flex-1">
                      <Ionicons name="time-outline" size={18} color="#64748B" />
                      <Text className="text-slate-300 ml-3 text-base">{s}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => removeRecentSearch(s)}>
                      <Ionicons name="close" size={18} color="#64748B" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
            
            <Text className="text-white text-lg font-bold mb-4">Trending Tags</Text>
            <View className="flex-row flex-wrap gap-2">
              {['MachineLearning', 'Hackathon', 'UI_Design', 'Internship', 'Startup', 'StudyGroup'].map(tag => (
                <TouchableOpacity 
                  key={tag} 
                  onPress={() => handleSearch(tag)}
                  className="bg-white/5 px-4 py-2 rounded-xl border border-white/10"
                >
                  <Text className="text-slate-400 text-sm">#{tag}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : (
          isLoading ? (
            <View className="items-center mt-20">
              <ActivityIndicator color="#3B82F6" size="large" />
              <Text className="text-slate-500 mt-4 font-medium">Scanning StudentSociety...</Text>
            </View>
          ) : (
            <View className="pt-2">
              {activeTab === 'All' && (
                <>
                  {renderSection('Students', results.users, ({ item }) => <UserCard user={item} />, 'Students')}
                  {renderSection('Teams', results.teams, renderTeamCard, 'Teams')}
                  {renderSection('Campus Feed', results.posts, ({ item }) => <PostCard post={item} />, 'Posts')}
                </>
              )}
              {activeTab === 'Students' && renderSection('Students', results.users, ({ item }) => <UserCard user={item} />)}
              {activeTab === 'Teams' && renderSection('Teams', results.teams, renderTeamCard)}
              {activeTab === 'Posts' && renderSection('Campus Feed', results.posts, ({ item }) => <PostCard post={item} />)}
              
              {results.users.length === 0 && results.teams.length === 0 && results.posts.length === 0 && (
                <View className="items-center mt-20 px-10">
                  <Ionicons name="search-outline" size={60} color="#334155" />
                  <Text className="text-slate-500 text-lg font-bold mt-4">No results for "{query}"</Text>
                  <Text className="text-slate-600 text-center mt-2">Try searching for different keywords or specific field names.</Text>
                </View>
              )}
            </View>
          )
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
