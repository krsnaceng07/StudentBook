import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUIStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import client from '../../api/client';

interface DashboardData {
  profile: {
    full_name: string;
    university: string;
  };
  stats: {
    connections: number;
    bookmarks: number;
    pending: number;
  };
  upcomingEvents: Array<{
    id: string;
    title: string;
    organizer?: string;
    location?: string;
    event_type?: string;
    event_date: string;
  }>;
}

export default function HomeIndex() {
  const { isDarkMode } = useUIStore();
  const { user } = useAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<DashboardData>({
    profile: {
      full_name: user?.full_name || 'Aarav Sharma',
      university: 'Tribhuvan University',
    },
    stats: {
      connections: 0,
      bookmarks: 0,
      pending: 0,
    },
    upcomingEvents: [
      {
        id: '1',
        title: 'HackTU 2026',
        organizer: 'Tribhuvan University',
        event_type: 'Hackathon',
        event_date: '2026-06-15',
      },
      {
        id: '2',
        title: 'Web3 Workshop Series',
        organizer: 'Kathmandu University',
        event_type: 'Workshop',
        event_date: '2026-05-28',
      },
    ],
  });

  const fetchDashboard = async () => {
    try {
      const response = await client.get('/dashboard/home');
      if (response.data?.success) {
        setData(response.data.data);
      }
    } catch (err) {
      console.warn('Could not fetch dashboard, using fallbacks.', err);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchDashboard().finally(() => setLoading(false));
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchDashboard().finally(() => setRefreshing(false));
  }, []);

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${months[date.getMonth()]} ${date.getDate()}`;
    } catch {
      return dateStr;
    }
  };

  return (
    <SafeAreaView 
      className={`flex-1 ${isDarkMode ? 'bg-[#0F172A]' : 'bg-[#F8FAFC]'}`} 
      edges={['top']}
    >
      {/* Top Header */}
      <View className={`px-6 py-4 flex-row justify-between items-center border-b ${isDarkMode ? 'bg-[#0F172A] border-slate-805' : 'bg-white border-slate-100'}`}>
        <Text className={`text-xl font-extrabold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>CollabSpace</Text>
        
        {/* Quick actions row */}
        <View className="flex-row items-center gap-3">
          {/* My Team */}
          <TouchableOpacity 
            onPress={() => router.push('/teams')}
            className={`w-10 h-10 rounded-full items-center justify-center border ${
              isDarkMode ? 'bg-slate-805 border-slate-700' : 'bg-slate-50 border-slate-100'
            }`}
          >
            <Ionicons name="people-outline" size={18} color={isDarkMode ? '#94A3B8' : '#475569'} />
          </TouchableOpacity>

          {/* Messages */}
          <TouchableOpacity 
            onPress={() => router.push('/messages')}
            className={`w-10 h-10 rounded-full items-center justify-center border relative ${
              isDarkMode ? 'bg-slate-805 border-slate-700' : 'bg-slate-50 border-slate-100'
            }`}
          >
            <Ionicons name="chatbubble-ellipses-outline" size={18} color={isDarkMode ? '#94A3B8' : '#475569'} />
            <View className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500" />
          </TouchableOpacity>

          {/* Notifications */}
          <TouchableOpacity 
            className={`w-10 h-10 rounded-full items-center justify-center border ${
              isDarkMode ? 'bg-slate-805 border-slate-700' : 'bg-slate-50 border-slate-100'
            }`}
          >
            <Ionicons name="notifications-outline" size={18} color={isDarkMode ? '#94A3B8' : '#475569'} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Blue Header Banner */}
        <View className="bg-[#2563EB] px-6 pt-8 pb-10">
          <Text className="text-blue-100 text-sm font-medium mb-1">Good morning 👋</Text>
          <Text className="text-white text-2xl font-bold mb-1">{data.profile.full_name}</Text>
          <Text className="text-blue-100 text-sm">{data.profile.university}</Text>
        </View>

        {/* Stats Section (Row of 3 cards) */}
        <View className="flex-row justify-between px-6 -mt-6">
          {/* Card 1: Connections */}
          <View className={`w-[30%] rounded-2xl p-4 items-center justify-center border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 shadow-sm'}`}>
            <Text className="text-2xl mb-1">🤝</Text>
            <Text className={`text-lg font-bold mb-0.5 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              {data.stats.connections}
            </Text>
            <Text className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Connections</Text>
          </View>

          {/* Card 2: Bookmarks */}
          <View className={`w-[30%] rounded-2xl p-4 items-center justify-center border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 shadow-sm'}`}>
            <Text className="text-2xl mb-1">🔖</Text>
            <Text className={`text-lg font-bold mb-0.5 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              {data.stats.bookmarks}
            </Text>
            <Text className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Bookmarks</Text>
          </View>

          {/* Card 3: Pending */}
          <View className={`w-[30%] rounded-2xl p-4 items-center justify-center border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 shadow-sm'}`}>
            <Text className="text-2xl mb-1">📬</Text>
            <Text className={`text-lg font-bold mb-0.5 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              {data.stats.pending}
            </Text>
            <Text className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Pending</Text>
          </View>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#2563EB" className="my-8" />
        ) : (
          <>
            {/* Upcoming Events */}
            <View className="mt-8 px-6">
              <Text className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                Upcoming Events
              </Text>

              <View className="gap-4">
                {data.upcomingEvents.map((event) => (
                  <View 
                    key={event.id}
                    className={`flex-row rounded-2xl p-4 border items-center ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 shadow-sm'}`}
                  >
                    {/* Event Icon Block */}
                    <View className="w-12 h-12 rounded-xl bg-blue-50 items-center justify-center mr-4">
                      <Ionicons name="calendar" size={24} color="#2563EB" />
                    </View>

                    {/* Event Info */}
                    <View className="flex-1">
                      <View className="flex-row justify-between items-start mb-0.5">
                        <Text className={`font-bold text-[15px] flex-1 mr-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`} numberOfLines={1}>
                          {event.title}
                        </Text>
                        <Text className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                          {formatDate(event.event_date)}
                        </Text>
                      </View>
                      <Text className={`text-xs mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} numberOfLines={1}>
                        {event.organizer || event.location || 'Tribhuvan University'}
                      </Text>

                      {/* Badge */}
                      <View className="flex-row">
                        <View className={`px-3 py-1 rounded-full ${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
                          <Text className={`text-[10px] font-semibold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                            {event.event_type || 'Hackathon'}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* Profile Completion Callout */}
            <View className="mt-8 px-6 mb-8">
              <View className={`rounded-2xl p-5 border flex-row items-center justify-between ${isDarkMode ? 'bg-blue-950/30 border-blue-900' : 'bg-blue-50/50 border-blue-100'}`}>
                <View className="flex-1 mr-4">
                  <Text className={`font-bold text-[15px] mb-1 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                    Complete your profile
                  </Text>
                  <Text className={`text-xs ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                    A complete profile gets 5x more collaboration requests
                  </Text>
                </View>
                <Ionicons name="arrow-forward" size={20} color="#2563EB" />
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
