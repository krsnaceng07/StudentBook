import React, { useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNotificationStore } from '../store/notificationStore';
import { useRouter } from 'expo-router';
import { formatDistanceToNow } from 'date-fns';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function NotificationsScreen() {
  const { notifications, isLoading, isRefreshing, fetchNotifications, markAsRead, markAllAsRead } = useNotificationStore();
  const router = useRouter();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'like': return { name: 'heart', color: '#EF4444', bg: '#FEE2E2' };
      case 'comment': return { name: 'chatbubble', color: '#3B82F6', bg: '#DBEAFE' };
      case 'connection_request': return { name: 'person-add', color: '#8B5CF6', bg: '#EDE9FE' };
      case 'connection_accepted': return { name: 'checkmark-circle', color: '#10B981', bg: '#D1FAE5' };
      default: return { name: 'notifications', color: '#64748B', bg: '#F1F5F9' };
    }
  };

  const getMessage = (notif: any) => {
    switch (notif.type) {
      case 'like': return 'liked your post';
      case 'comment': return 'commented on your post';
      case 'connection_request': return 'sent you a connection request';
      case 'connection_accepted': return 'accepted your connection request';
      default: return 'sent you a notification';
    }
  };

  const handleNotificationPress = (notif: any) => {
    if (!notif.isRead) markAsRead(notif._id);
    
    if (notif.type === 'like' || notif.type === 'comment') {
      // In a real app, you'd navigate to the post details
      // For now, we'll just go to the network feed or similar
      // router.push(`/post/${notif.post._id}`);
    } else if (notif.type === 'connection_request') {
      router.push('/network/requests');
    } else if (notif.type === 'connection_accepted') {
      router.push('/network/connections');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0F172A]" edges={['top']}>
      {/* Header */}
      <View className="px-6 flex-row items-center justify-between mb-6 mt-4">
        <View className="flex-row items-center">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="h-10 w-10 bg-white/5 rounded-full items-center justify-center border border-white/10 mr-4"
          >
            <Ionicons name="arrow-back" size={20} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-2xl font-bold">Notifications</Text>
        </View>
        <TouchableOpacity onPress={markAllAsRead}>
          <Text className="text-[#3B82F6] text-sm font-medium">Mark all read</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => {
          const icon = getIcon(item.type);
          return (
            <TouchableOpacity 
              onPress={() => handleNotificationPress(item)}
              className={`px-6 py-4 flex-row items-center border-b border-white/5 ${item.isRead ? 'opacity-60' : 'bg-[#3B82F6]/5'}`}
            >
              <TouchableOpacity 
                onPress={() => router.push(`/profile/${item.sender._id}`)}
                className="relative"
              >
                <View className="h-12 w-12 bg-white/10 rounded-full items-center justify-center border border-white/10 overflow-hidden">
                  {item.sender.avatar ? (
                    <Image source={{ uri: item.sender.avatar }} className="w-full h-full" />
                  ) : (
                    <Text className="text-white font-bold">{item.sender.name.charAt(0)}</Text>
                  )}
                </View>
                <View 
                  style={{ backgroundColor: icon.color }}
                  className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full items-center justify-center border-2 border-[#0F172A]"
                >
                  <Ionicons name={icon.name as any} size={12} color="white" />
                </View>
              </TouchableOpacity>

              <View className="ml-4 flex-1">
                <Text className="text-white text-sm">
                  <Text className="font-bold">{item.sender.name}</Text> {getMessage(item)}
                </Text>
                <Text className="text-slate-500 text-[10px] mt-1">
                  {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                </Text>
              </View>

              {!item.isRead && (
                <View className="h-2 w-2 bg-[#3B82F6] rounded-full ml-2" />
              )}
            </TouchableOpacity>
          );
        }}
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={() => fetchNotifications(true)} tintColor="#3B82F6" />
        }
        ListEmptyComponent={() => (
          !isLoading && (
            <View className="items-center mt-20 px-10">
              <View className="bg-white/5 h-20 w-20 rounded-full items-center justify-center mb-4">
                <Ionicons name="notifications-off-outline" size={40} color="#334155" />
              </View>
              <Text className="text-slate-500 text-lg font-bold">No notifications</Text>
              <Text className="text-slate-600 text-center mt-2">
                When people interact with you, it will show up here.
              </Text>
            </View>
          )
        )}
      />
    </SafeAreaView>
  );
}
