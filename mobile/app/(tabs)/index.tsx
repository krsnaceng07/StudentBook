import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { View, Text, TextInput, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Keyboard, ScrollView, Animated, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDiscoverStore } from '../../store/discoverStore';
import { usePostStore } from '../../store/postStore';
import { useNotificationStore } from '../../store/notificationStore';
import UserCard from '../../components/UserCard';
import PostCard from '../../components/PostCard';
import SkeletonCard from '../../components/SkeletonCard';
import CreatePostModal from '../../components/CreatePostModal';

const POPULAR_SKILLS = ['React', 'Node', 'Python', 'UI/UX', 'AI', 'Fullstack'];
const FIELDS = ['Engineering', 'Design', 'Business', 'Marketing', 'Science'];

// The height of the section we want to hide - Reduced since CreatePostBox is removed
const HEADER_MAX_HEIGHT = 160; 

// Create Animated FlatList to support useNativeDriver
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

// Move SuggestedUsers to a memoized component to prevent re-renders on scroll
const SuggestedUsers = React.memo(({ users, onSeeAll }: { users: any[], onSeeAll: () => void }) => {
  if (users.length === 0) return null;
  return (
    <View className="mb-8">
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-white text-xl font-bold">Suggested Matches</Text>
        <TouchableOpacity onPress={onSeeAll}>
          <Text className="text-[#3B82F6] text-sm font-medium">See all</Text>
        </TouchableOpacity>
      </View>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        className="-mx-6 px-6"
        decelerationRate="fast"
        snapToInterval={296} // card width 280 + mr-4 16
        snapToAlignment="start"
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingRight: 40 }}
      >
        {users.map((user: any, idx: number) => (
          <View key={user.userId || `suggested-${idx}`} className="mr-4 w-[280px]">
            <UserCard user={user} />
          </View>
        ))}
      </ScrollView>
    </View>
  );
});

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { 
    users, isLoading: usersLoading, isRefreshing: usersRefreshing, filters: userFilters,
    fetchUsers, setFilters: setUserFilters, resetFilters: resetUserFilters 
  } = useDiscoverStore();

  const { 
    posts, isLoading: postsLoading, isRefreshing: postsRefreshing, hasMore: hasMorePosts,
    fetchPosts, setFilters: setPostFilters, filters: postFilters
  } = usePostStore();

  const { unreadCount, fetchNotifications } = useNotificationStore();

  // Animation Refs
  const scrollY = useRef(new Animated.Value(0)).current;
  
  // diffClamp logic: 
  const clampedScroll = Animated.diffClamp(scrollY, 0, HEADER_MAX_HEIGHT);

  // Interpolate to move the header up
  const headerTranslate = clampedScroll.interpolate({
    inputRange: [0, HEADER_MAX_HEIGHT],
    outputRange: [0, -HEADER_MAX_HEIGHT],
    extrapolate: 'clamp',
  });

  // Interpolate for opacity
  const headerOpacity = clampedScroll.interpolate({
    inputRange: [0, HEADER_MAX_HEIGHT / 2, HEADER_MAX_HEIGHT],
    outputRange: [1, 0.5, 0],
    extrapolate: 'clamp',
  });

  const [localSearch, setLocalSearch] = useState(userFilters.search);
  const [showFilters, setShowFilters] = useState(false);
  const [customSkill, setCustomSkill] = useState('');
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [postToEdit, setPostToEdit] = useState<any>(null);

  // Use a ref for search timeout to prevent unnecessary effect triggers
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleSearchChange = (text: string) => {
    setLocalSearch(text);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setUserFilters({ search: text });
      setPostFilters({ search: text });
    }, 400); // 400ms as requested
  };

  const handleEditPost = useCallback((post: any) => {
    setPostToEdit(post);
    setIsCreateModalVisible(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsCreateModalVisible(false);
    setPostToEdit(null);
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchPosts();
    fetchNotifications();
    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, []);

  const onRefresh = useCallback(() => {
    fetchUsers();
    fetchPosts();
  }, [fetchUsers, fetchPosts]);

  const handleLoadMorePosts = () => {
    if (hasMorePosts && !postsLoading) {
      fetchPosts(true);
    }
  };

  const renderItem = useCallback(({ item }: { item: any }) => (
    <View className="px-4">
      <PostCard post={item} onEdit={handleEditPost} />
    </View>
  ), [handleEditPost]);

  const toggleSkill = (skill: string) => {
    const newSkills = userFilters.skills.includes(skill)
      ? (userFilters.skills as string[]).filter((s: string) => s !== skill)
      : [...userFilters.skills, skill];
    setUserFilters({ skills: newSkills });
  };

  const addCustomSkill = () => {
    if (customSkill.trim() && !userFilters.skills.includes(customSkill.trim())) {
      toggleSkill(customSkill.trim());
      setCustomSkill('');
      Keyboard.dismiss();
    }
  };

  const renderHeader = useMemo(() => (
    <View className="px-6 mb-4">
      <SuggestedUsers 
        users={users} 
        onSeeAll={() => router.push('/network/discover')} 
      />
      <Text className="text-white text-xl font-bold mb-4">Campus Feed</Text>
    </View>
  ), [users, router]);

  const ListEmptyComponent = useMemo(() => (
    postsLoading ? (
      <View className="px-6">
        {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
      </View>
    ) : (
      <View className="items-center mt-10 px-10">
        <Ionicons name="newspaper-outline" size={60} color="#334155" />
        <Text className="text-slate-500 text-lg font-bold mt-4">No posts yet</Text>
        <Text className="text-slate-600 text-center mt-2">Be the first to share something with your campus!</Text>
      </View>
    )
  ), [postsLoading]);

  return (
    <View className="flex-1 bg-[#0F172A]">
      {/* Animated Header Section */}
      <Animated.View 
        style={[
          {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 100,
            backgroundColor: '#0F172A',
            transform: [{ translateY: headerTranslate }],
            opacity: headerOpacity,
            paddingTop: insets.top + 10,
          }
        ]}
      >
        <View className="px-6 mb-4">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-white text-3xl font-bold">Discover</Text>
            <TouchableOpacity 
              onPress={() => router.push('/notifications')}
              className="bg-white/5 h-10 w-10 rounded-full items-center justify-center border border-white/10"
            >
              <Ionicons name="notifications-outline" size={20} color="#3B82F6" />
              {unreadCount > 0 && (
                <View className="absolute -top-1 -right-1 bg-red-500 h-5 w-5 rounded-full items-center justify-center border-2 border-[#0F172A]">
                  <Text className="text-white text-[10px] font-bold">{unreadCount > 9 ? '9+' : unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
          
          <View className="flex-row items-center bg-white/5 rounded-2xl border border-white/10 px-4 py-3 mb-2">
            <Ionicons name="search" size={20} color="#94A3B8" />
            <TextInput
              className="flex-1 ml-1 text-white text-base"
              placeholder="Search matches or posts..."
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
            <View className="bg-white/5 rounded-2xl border border-white/10 p-4 mb-4">
              <Text className="text-slate-400 text-xs uppercase font-bold mb-3">Field of Study</Text>
              <View className="flex-row flex-wrap gap-2 mb-4">
                {FIELDS.map((f: string) => (
                  <TouchableOpacity 
                    key={f}
                    onPress={() => setUserFilters({ field: userFilters.field === f ? '' : f })}
                    className={`px-3 py-1.5 rounded-full border ${userFilters.field === f ? 'bg-[#3B82F6] border-[#3B82F6]' : 'bg-white/5 border-white/10'}`}
                  >
                    <Text className={`text-xs ${userFilters.field === f ? 'text-white' : 'text-slate-400'}`}>{f}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text className="text-slate-400 text-xs uppercase font-bold mb-3">Skills (Select or Add)</Text>
              <View className="flex-row flex-wrap gap-2 mb-4">
                {POPULAR_SKILLS.map((s: string) => (
                  <TouchableOpacity 
                    key={s}
                    onPress={() => toggleSkill(s)}
                    className={`px-3 py-1.5 rounded-full border ${userFilters.skills.includes(s) ? 'bg-[#3B82F6] border-[#3B82F6]' : 'bg-white/5 border-white/10'}`}
                  >
                    <Text className={`text-xs ${userFilters.skills.includes(s) ? 'text-white' : 'text-slate-400'}`}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View className="flex-row items-center bg-white/5 rounded-xl border border-white/10 px-3 py-1">
                <TextInput
                  className="flex-1 text-white text-sm"
                  placeholder="Add custom skill..."
                  placeholderTextColor="#64748B"
                  value={customSkill}
                  onChangeText={setCustomSkill}
                  onSubmitEditing={addCustomSkill}
                />
                <TouchableOpacity onPress={addCustomSkill}>
                  <Ionicons name="add-circle" size={24} color="#3B82F6" />
                </TouchableOpacity>
              </View>

              <TouchableOpacity onPress={() => { resetUserFilters(); setLocalSearch(''); setPostFilters({ search: '' }); }} className="mt-4 items-center">
                <Text className="text-[#3B82F6] text-xs font-bold uppercase">Clear All Filters</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Animated.View>

      <AnimatedFlatList
        data={posts}
        keyExtractor={(item: any) => item._id}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={ListEmptyComponent}
        ListFooterComponent={() => (
          hasMorePosts && postsLoading && (
            <View className="py-6">
              <ActivityIndicator color="#3B82F6" />
            </View>
          )
        )}
        onEndReached={handleLoadMorePosts}
        onEndReachedThreshold={0.5}
        removeClippedSubviews={Platform.OS === 'android'} 
        initialNumToRender={6}
        maxToRenderPerBatch={10}
        windowSize={11}
        decelerationRate="normal"
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl 
            refreshing={usersRefreshing || postsRefreshing} 
            onRefresh={onRefresh} 
            tintColor="#3B82F6" 
            progressViewOffset={HEADER_MAX_HEIGHT + 20}
          />
        }
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        contentContainerStyle={{ 
          paddingTop: HEADER_MAX_HEIGHT + insets.top + 20,
          paddingBottom: 40 
        }}
      />

      {/* Floating Action Button */}
      <TouchableOpacity 
        onPress={() => setIsCreateModalVisible(true)}
        activeOpacity={0.8}
        className="absolute bottom-10 right-6 h-16 w-16 bg-[#3B82F6] rounded-full items-center justify-center shadow-2xl z-[1000] border border-white/20"
      >
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>

      {/* Create Post Modal */}
      <CreatePostModal 
        isVisible={isCreateModalVisible} 
        onClose={handleCloseModal} 
        postToEdit={postToEdit}
      />
    </View>
  );
}
