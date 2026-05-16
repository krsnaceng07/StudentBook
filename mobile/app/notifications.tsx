import React, { useEffect, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNotificationStore } from '../store/notificationStore';
import { useConnectionStore } from '../store/connectionStore';
import { useRouter } from 'expo-router';
import { formatDistanceToNow, isToday } from 'date-fns';
import { SafeAreaView } from 'react-native-safe-area-context';
import useUIStore from '../store/uiStore';

export default function NotificationsScreen() {
  const { notifications, isLoading, isRefreshing, fetchNotifications, markAsRead, markAllAsRead } = useNotificationStore();
  const { acceptRequest, rejectRequest, isLoading: connLoading } = useConnectionStore();
  const router = useRouter();
  const { isDarkMode } = useUIStore();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const getIcon = (type: string) => {
    if (isDarkMode) {
      switch (type) {
        case 'like': return { name: 'heart', color: '#FFFFFF', bg: 'rgba(255,255,255,0.1)' };
        case 'comment': return { name: 'chatbubble', color: '#FFFFFF', bg: 'rgba(255,255,255,0.1)' };
        case 'connection_request': return { name: 'person-add', color: '#FFFFFF', bg: 'rgba(255,255,255,0.1)' };
        case 'connection_accepted': return { name: 'checkmark-circle', color: '#FFFFFF', bg: 'rgba(255,255,255,0.1)' };
        case 'team_request': return { name: 'people', color: '#FFFFFF', bg: 'rgba(255,255,255,0.1)' };
        case 'team_accepted': return { name: 'ribbon', color: '#FFFFFF', bg: 'rgba(255,255,255,0.1)' };
        default: return { name: 'notifications', color: '#FFFFFF', bg: 'rgba(255,255,255,0.1)' };
      }
    }
    switch (type) {
      case 'like': return { name: 'heart', color: '#EF4444', bg: '#EF444415' };
      case 'comment': return { name: 'chatbubble', color: '#3B82F6', bg: '#3B82F615' };
      case 'connection_request': return { name: 'person-add', color: isDarkMode ? '#8B5CF6' : '#000000', bg: '#8B5CF615' };
      case 'connection_accepted': return { name: 'checkmark-circle', color: '#10B981', bg: '#10B98115' };
      case 'team_request': return { name: 'people', color: '#F59E0B', bg: '#F59E0B15' };
      case 'team_accepted': return { name: 'ribbon', color: '#10B981', bg: '#10B98115' };
      default: return { name: 'notifications', color: '#64748B', bg: '#64748B15' };
    }
  };

  const handleAction = async (notif: any, action: 'accept' | 'reject') => {
    if (!notif.relatedId) return;
    
    let res;
    if (action === 'accept') {
      res = await acceptRequest(notif.relatedId);
    } else {
      res = await rejectRequest(notif.relatedId);
    }

    if (res.success) {
      markAsRead(notif._id);
      fetchNotifications(true); // Refresh to update list
    }
  };

  const groupedNotifications = useMemo(() => {
    const today: any[] = [];
    const earlier: any[] = [];
    
    notifications.forEach((n: any) => {
      if (isToday(new Date(n.createdAt))) today.push(n);
      else earlier.push(n);
    });
    
    return { today, earlier };
  }, [notifications]);

  const renderItem = ({ item }: { item: any }) => {
    const icon = getIcon(item.type);
    const isActionable = item.type === 'connection_request' && !item.isRead;

    return (
      <View className={`px-6 py-5 border-b ${isDarkMode ? 'border-white/5' : 'border-slate-100'} ${item.isRead ? 'opacity-70' : (isDarkMode ? 'bg-white/5' : 'bg-slate-50')}`}>
        <View className="flex-row items-start">
          <TouchableOpacity 
            onPress={() => router.push(`/profile/${item.sender?._id}`)}
            className="relative"
          >
            <View className={`${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-200'} h-14 w-14 rounded-2xl items-center justify-center border overflow-hidden`}>
              {item.sender?.avatar ? (
                <Image source={{ uri: item.sender.avatar }} className="w-full h-full" />
              ) : (
                <Text className={`${isDarkMode ? 'text-white' : 'text-black'} font-black text-xl`}>{item.sender?.name?.charAt(0) || '?'}</Text>
              )}
            </View>
            <View 
              style={{ backgroundColor: icon.color }}
              className={`absolute -bottom-1 -right-1 h-6 w-6 rounded-lg items-center justify-center border-2 ${isDarkMode ? 'border-black' : 'border-white'}`}
            >
              <Ionicons name={icon.name as any} size={12} color="white" />
            </View>
          </TouchableOpacity>

          <View className="ml-4 flex-1">
            <View className="flex-row justify-between items-start">
                <View className="flex-1">
                  <Text className={`${isDarkMode ? 'text-white' : 'text-black'} text-[15px] leading-5`}>
                    <Text className="font-black">{item.sender?.name || 'Someone'}</Text> {item.message || 'interacted with you'}
                  </Text>
                 <Text className="text-slate-500 text-[11px] font-bold mt-1.5 uppercase tracking-tighter">
                   {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                 </Text>
               </View>
                {!item.isRead && (
                  <View className="h-2 w-2 bg-[#3B82F6] rounded-full mt-1.5" />
                )}
            </View>

            {isActionable && (
              <View className="flex-row gap-3 mt-4">
                <TouchableOpacity 
                  onPress={() => handleAction(item, 'accept')}
                  disabled={connLoading}
                  className={`${isDarkMode ? 'bg-white' : 'bg-black'} px-6 py-2.5 rounded-xl flex-row items-center justify-center shadow-lg`}
                >
                  <Text className={`${isDarkMode ? 'text-black' : 'text-white'} font-black text-xs`}>Accept</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => handleAction(item, 'reject')}
                  disabled={connLoading}
                  className={`${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'} px-6 py-2.5 rounded-xl border items-center justify-center`}
                >
                  <Text className={`${isDarkMode ? 'text-slate-400' : 'text-slate-500'} font-black text-xs`}>Decline</Text>
                </TouchableOpacity>
              </View>
            )}

            {!isActionable && !item.isRead && (
               <TouchableOpacity 
                 onPress={() => markAsRead(item._id)}
                 className="mt-3"
               >
                 <Text className={`${isDarkMode ? 'text-[#3B82F6]' : 'text-blue-600'} text-[11px] font-black uppercase`}>Mark Read</Text>
               </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className={`flex-1 ${isDarkMode ? 'bg-[#0F172A]' : 'bg-white'}`} edges={['top']}>
      {/* Header */}
      <View className="px-6 flex-row items-center justify-between mb-4 mt-4">
        <View className="flex-row items-center">
          <TouchableOpacity 
            onPress={() => router.back()}
            className={`${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-200'} h-10 w-10 rounded-full items-center justify-center border mr-4`}
          >
            <Ionicons name="arrow-back" size={20} color={isDarkMode ? "white" : "black"} />
          </TouchableOpacity>
          <Text className={`${isDarkMode ? 'text-white' : 'text-black'} text-3xl font-black`}>Alerts</Text>
        </View>
        <TouchableOpacity 
          onPress={markAllAsRead}
          className={`${isDarkMode ? 'bg-white/10 border-white/10' : 'bg-slate-50 border-slate-200'} px-4 py-2 rounded-xl border`}
        >
          <Text className={`${isDarkMode ? 'text-white' : 'text-black'} text-xs font-black`}>Clear All</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={[
          ...(groupedNotifications.today.length > 0 ? [{ type: 'section', title: 'Today' }, ...groupedNotifications.today] : []),
          ...(groupedNotifications.earlier.length > 0 ? [{ type: 'section', title: 'Earlier' }, ...groupedNotifications.earlier] : [])
        ]}
        keyExtractor={(item, index) => item._id || `section-${index}`}
        renderItem={({ item }) => {
          if (item.type === 'section') {
            return (
              <View className={`px-6 pt-6 pb-2 ${isDarkMode ? 'bg-[#0F172A]' : 'bg-white'}`}>
                <Text className={`${isDarkMode ? 'text-slate-500' : 'text-slate-400'} text-xs font-black uppercase tracking-[2px]`}>{item.title}</Text>
              </View>
            );
          }
          return renderItem({ item });
        }}
        contentContainerStyle={{ paddingBottom: 60 }}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={() => fetchNotifications(true)} tintColor="#3B82F6" />
        }
        ListEmptyComponent={() => (
          !isLoading && (
            <View className="items-center mt-32 px-10">
              <View className={`${isDarkMode ? 'bg-white/5' : 'bg-slate-100'} h-24 w-24 rounded-[32px] items-center justify-center mb-6 rotate-12`}>
                <Ionicons name="notifications-off" size={44} color={isDarkMode ? "#334155" : "#CBD5E1"} />
              </View>
              <Text className={`${isDarkMode ? 'text-white' : 'text-black'} text-xl font-black`}>All Caught Up!</Text>
              <Text className={`${isDarkMode ? 'text-slate-600' : 'text-slate-500'} text-center mt-3 leading-5`}>
                No new alerts right now. We'll notify you when something important happens.
              </Text>
            </View>
          )
        )}
        ListHeaderComponent={isLoading && !isRefreshing ? <ActivityIndicator color="#3B82F6" className="mt-10" /> : null}
      />
    </SafeAreaView>
  );
}
