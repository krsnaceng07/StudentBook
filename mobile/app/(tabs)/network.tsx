import React, { useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useConnectionStore } from '../../store/connectionStore';
import { usePostStore } from '../../store/postStore';
import NetworkUserCard from '../../components/NetworkUserCard';
import PostCard from '../../components/PostCard';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function NetworkScreen() {
  const { fetchConnections } = useConnectionStore();
  const { networkPosts, isLoading, isRefreshing, fetchNetworkPosts, networkHasMore } = usePostStore();
  const router = useRouter();

  useEffect(() => {
    fetchConnections();
    fetchNetworkPosts();
  }, []);

  const onRefresh = () => {
    fetchConnections();
    fetchNetworkPosts();
  };

  const loadMore = () => {
    if (networkHasMore && !isLoading) {
      fetchNetworkPosts(true);
    }
  };

  const renderHeader = () => (
    <View className="px-6 mb-6 mt-4">
      <View className="flex-row items-center justify-between mb-6">
        <Text className="text-white text-3xl font-bold">My Network</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-[#0F172A]" edges={['top']}>
      <FlatList
        data={networkPosts}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <PostCard post={item} />}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={() => (
          !isLoading && (
            <View className="items-center mt-20 px-10">
              <View className="bg-white/5 h-20 w-20 rounded-full items-center justify-center mb-4">
                <Ionicons name="newspaper-outline" size={40} color="#334155" />
              </View>
              <Text className="text-slate-500 text-lg font-bold">No posts in your network</Text>
              <Text className="text-slate-600 text-center mt-2">
                Connect with more people to see what they are sharing!
              </Text>
            </View>
          )
        )}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="#3B82F6" />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={() => (
          isLoading && networkPosts.length > 0 ? (
            <View className="py-4">
              <ActivityIndicator color="#3B82F6" />
            </View>
          ) : <View className="h-20" />
        )}
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </SafeAreaView>
  );
}
