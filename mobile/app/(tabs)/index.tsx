import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useRouter } from 'expo-router';
import {
  View, Text, FlatList, TouchableOpacity, ActivityIndicator,
  RefreshControl, Animated, Platform, ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDiscoverStore } from '../../store/discoverStore';
import { usePostStore } from '../../store/postStore';
import { useNotificationStore } from '../../store/notificationStore';
import UserCard from '../../components/UserCard';
import TeamCard from '../../components/TeamCard';
import PostCard from '../../components/PostCard';
import SkeletonCard from '../../components/SkeletonCard';
import CreatePostModal from '../../components/CreatePostModal';

// ─── Constants ───────────────────────────────────────────────────────────────
const HEADER_HEIGHT = 130;
const SUGGESTION_EVERY_N_POSTS = 3;

// MUST be defined at module level — NOT inside a component.
// If created inside a component it gets a new identity every render → FlatList
// unmounts and remounts every time, causing the visible hang/glitch.
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

// ─── Horizontal scroll "Suggested Matches" at the top (original design) ──────
const SuggestedUsers = React.memo(({ users, onSeeAll }: { users: any[]; onSeeAll: () => void }) => {
  if (users.length === 0) return null;
  // Only show USER type in the horizontal scroll (original behaviour)
  const userItems = users.filter(u => u.type === 'user');
  if (userItems.length === 0) return null;

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
        snapToInterval={296}
        snapToAlignment="start"
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingRight: 40 }}
      >
        {userItems.map((user: any, idx: number) => (
          <View key={user._id || `suggested-${idx}`} className="mr-4 w-[280px]">
            <UserCard user={user} />
          </View>
        ))}
      </ScrollView>
    </View>
  );
});

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const {
    suggestions, suggestionsLoading, fetchSuggestions, fetchUsers,
  } = useDiscoverStore();

  const {
    posts, isLoading: postsLoading, isRefreshing: postsRefreshing,
    hasMore: hasMorePosts, fetchPosts,
  } = usePostStore();

  const { unreadCount, fetchNotifications } = useNotificationStore();

  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [postToEdit, setPostToEdit] = useState<any>(null);

  // ── Animation ────────────────────────────────────────────────────────────
  const scrollY = useRef(new Animated.Value(0)).current;
  const clampedScroll = Animated.diffClamp(scrollY, 0, HEADER_HEIGHT);
  const headerTranslate = clampedScroll.interpolate({
    inputRange: [0, HEADER_HEIGHT],
    outputRange: [0, -HEADER_HEIGHT],
    extrapolate: 'clamp',
  });
  const headerOpacity = clampedScroll.interpolate({
    inputRange: [0, HEADER_HEIGHT / 2, HEADER_HEIGHT],
    outputRange: [1, 0.5, 0],
    extrapolate: 'clamp',
  });

  // ── Initial load ─────────────────────────────────────────────────────────
  useEffect(() => {
    fetchPosts();
    fetchSuggestions();
    fetchNotifications();
  }, []);

  const onRefresh = useCallback(() => {
    fetchPosts();
    fetchSuggestions();
    fetchUsers();
    fetchNotifications();
  }, [fetchPosts, fetchSuggestions, fetchUsers, fetchNotifications]);

  const handleLoadMorePosts = useCallback(() => {
    if (hasMorePosts && !postsLoading) fetchPosts(true);
  }, [hasMorePosts, postsLoading, fetchPosts]);

  const handleEditPost = useCallback((post: any) => {
    setPostToEdit(post);
    setIsCreateModalVisible(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsCreateModalVisible(false);
    setPostToEdit(null);
  }, []);

  // ── Build interleaved feed ─────────────────────────────────────────────
  // Strategy: after every N posts, insert the next suggestion from the list.
  // Suggestions alternate naturally user/team because backend interleaves them.
  const feedData = useMemo(() => {
    const items: any[] = [];
    let sugIdx = 0;

    posts.forEach((post, idx) => {
      items.push({ kind: 'post', data: post, _id: `post-${post._id}` });

      if ((idx + 1) % SUGGESTION_EVERY_N_POSTS === 0 && sugIdx < suggestions.length) {
        const s = suggestions[sugIdx++];
        items.push({ kind: 'suggestion', data: s, _id: s._id });
      }
    });

    // Append any leftover suggestions after all posts
    while (sugIdx < suggestions.length) {
      const s = suggestions[sugIdx++];
      items.push({ kind: 'suggestion', data: s, _id: s._id });
    }

    return items;
  }, [posts, suggestions]);

  // ── Render item ──────────────────────────────────────────────────────────
  const renderItem = useCallback(({ item }: { item: any }) => {
    if (item.kind === 'suggestion') {
      if (item.data.type === 'user') {
        return (
          <View className="px-6">
            <UserCard user={item.data} />
          </View>
        );
      }
      if (item.data.type === 'team') {
        return (
          <View className="px-6">
            <TeamCard team={item.data} />
          </View>
        );
      }
      return null;
    }
    // Regular post
    return (
      <View className="px-4">
        <PostCard post={item.data} onEdit={handleEditPost} />
      </View>
    );
  }, [handleEditPost]);

  const keyExtractor = useCallback((item: any) => item._id, []);

  // ── ListHeader — horizontal scroll Suggested Matches + "Campus Feed" label ─
  const ListHeaderComponent = useMemo(() => (
    <View className="px-6 mb-4">
      <SuggestedUsers
        users={suggestions}
        onSeeAll={() => router.push('/network/discover')}
      />
      <Text className="text-white text-xl font-bold mb-4">Campus Feed</Text>
    </View>
  ), [suggestions, router]);

  // ── Empty state ──────────────────────────────────────────────────────────
  const ListEmptyComponent = useMemo(() => (
    postsLoading ? (
      <View className="px-6">
        {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
      </View>
    ) : (
      <View className="items-center mt-10 px-10">
        <Ionicons name="newspaper-outline" size={60} color="#334155" />
        <Text className="text-slate-500 text-lg font-bold mt-4">No posts yet</Text>
        <Text className="text-slate-600 text-center mt-2">
          Be the first to share something with your campus!
        </Text>
      </View>
    )
  ), [postsLoading]);

  return (
    <View className="flex-1 bg-[#0F172A]">

      {/* ── Sticky animated header ──────────────────────────────────────── */}
      <Animated.View
        style={{
          position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100,
          backgroundColor: '#0F172A',
          transform: [{ translateY: headerTranslate }],
          opacity: headerOpacity,
          paddingTop: insets.top + 10,
        }}
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
                  <Text className="text-white text-[10px] font-bold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => router.push({ pathname: '/search' } as any)}
            activeOpacity={0.8}
            className="flex-row items-center bg-white/5 rounded-2xl border border-white/10 px-4 py-3 mb-4"
          >
            <Ionicons name="search" size={20} color="#3B82F6" />
            <Text className="flex-1 ml-3 text-slate-400 text-base">Search students, teams, or posts...</Text>
            <Ionicons name="options-outline" size={22} color="#94A3B8" />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* ── Main feed ───────────────────────────────────────────────────── */}
      <AnimatedFlatList
        data={feedData}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ListHeaderComponent={ListHeaderComponent}
        ListEmptyComponent={ListEmptyComponent}
        ListFooterComponent={() =>
          hasMorePosts && postsLoading ? (
            <View className="py-6">
              <ActivityIndicator color="#3B82F6" />
            </View>
          ) : null
        }
        onEndReached={handleLoadMorePosts}
        onEndReachedThreshold={0.5}
        removeClippedSubviews={Platform.OS === 'android'}
        initialNumToRender={6}
        maxToRenderPerBatch={10}
        windowSize={11}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={postsRefreshing}
            onRefresh={onRefresh}
            tintColor="#3B82F6"
            progressViewOffset={HEADER_HEIGHT + 20}
          />
        }
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        contentContainerStyle={{
          paddingTop: HEADER_HEIGHT + insets.top + 20,
          paddingBottom: 100,
        }}
      />

      {/* ── FAB ─────────────────────────────────────────────────────────── */}
      <TouchableOpacity
        onPress={() => setIsCreateModalVisible(true)}
        activeOpacity={0.8}
        className="absolute bottom-10 right-6 h-16 w-16 bg-[#3B82F6] rounded-full items-center justify-center shadow-2xl z-[1000] border border-white/20"
      >
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>

      {/* ── Create Post Modal ────────────────────────────────────────────── */}
      <CreatePostModal
        isVisible={isCreateModalVisible}
        onClose={handleCloseModal}
        postToEdit={postToEdit}
      />
    </View>
  );
}
