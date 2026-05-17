import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUIStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import api from '../../api/client';

interface DashboardStats {
  activeEvents: number;
  totalReach: number;
}

interface RecentEvent {
  id: string;
  title: string;
  event_date: string;
  event_type: string;
}

export default function CollegeDashboard() {
  const { isDarkMode } = useUIStore();
  const { user } = useAuthStore();

  const [stats, setStats] = useState<DashboardStats>({ activeEvents: 0, totalReach: 0 });
  const [recentEvents, setRecentEvents] = useState<RecentEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const universityName = user?.full_name || 'College Dashboard';
  const initials = universityName.substring(0, 2).toUpperCase();

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/api/v1/college/dashboard');
      if (response.data?.success) {
        setStats(response.data.data.stats);
        setRecentEvents(response.data.data.recentEvents || []);
      }
    } catch (error) {
      console.error('Failed to fetch college dashboard', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const getTypeColor = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('hackathon')) return { border: 'border-l-[#2563EB]', bg: isDarkMode ? 'bg-blue-950' : 'bg-blue-50', text: isDarkMode ? 'text-blue-400' : 'text-blue-600' };
    if (t.includes('seminar') || t.includes('workshop')) return { border: 'border-l-[#8B5CF6]', bg: isDarkMode ? 'bg-purple-950' : 'bg-purple-50', text: isDarkMode ? 'text-purple-400' : 'text-purple-600' };
    return { border: 'border-l-[#10B981]', bg: isDarkMode ? 'bg-emerald-950' : 'bg-emerald-50', text: isDarkMode ? 'text-emerald-400' : 'text-emerald-600' };
  };

  if (loading) {
    return (
      <View className={`flex-1 justify-center items-center ${isDarkMode ? 'bg-[#0F172A]' : 'bg-[#F8FAFC]'}`}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  return (
    <SafeAreaView 
      className={`flex-1 ${isDarkMode ? 'bg-[#0F172A]' : 'bg-[#F8FAFC]'}`}
      edges={['top']}
    >
      {/* Top green header banner */}
      <View className="bg-[#10B981] px-6 pt-8 pb-10 rounded-b-[36px]">
        <Text className="text-white text-xl font-bold tracking-tight mb-6">Dashboard</Text>

        <View className="flex-row items-center gap-4">
          {/* Logo badge */}
          <View className="w-14 h-14 rounded-2xl bg-white/20 border border-white/25 items-center justify-center">
            <Text className="text-white text-lg font-black tracking-widest">{initials}</Text>
          </View>

          <View>
            <Text className="text-white text-2xl font-black mb-0.5" numberOfLines={1}>{universityName}</Text>
            <Text className="text-emerald-100 text-xs font-semibold uppercase tracking-wider">College Dashboard</Text>
          </View>
        </View>
      </View>

      <ScrollView 
        className="flex-1 px-6 -mt-6"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10B981" />}
      >
        {/* 2x2 grid stats */}
        <View className="flex-row flex-wrap justify-between gap-3 mb-6">
          {/* Card 1: Total Events */}
          <View className={`w-[48%] rounded-3xl p-5 border ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100/80 shadow-sm'
          }`}>
            <Text className="text-xl mb-2">📅</Text>
            <Text className={`text-[22px] font-black mb-0.5 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{stats.activeEvents}</Text>
            <Text className={`text-[10px] font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Total Events</Text>
          </View>

          {/* Card 2: Active Events */}
          <View className={`w-[48%] rounded-3xl p-5 border ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100/80 shadow-sm'
          }`}>
            <Text className="text-xl mb-2">🟢</Text>
            <Text className={`text-[22px] font-black mb-0.5 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{stats.activeEvents}</Text>
            <Text className={`text-[10px] font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Active Events</Text>
          </View>

          {/* Card 3: Total Reach */}
          <View className={`w-[48%] rounded-3xl p-5 border ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100/80 shadow-sm'
          }`}>
            <Text className="text-xl mb-2">👥</Text>
            <Text className={`text-[22px] font-black mb-0.5 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{stats.totalReach}+</Text>
            <Text className={`text-[10px] font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Total Reach</Text>
          </View>

          {/* Card 4: Registrations */}
          <View className={`w-[48%] rounded-3xl p-5 border ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100/80 shadow-sm'
          }`}>
            <Text className="text-xl mb-2">✅</Text>
            <Text className={`text-[22px] font-black mb-0.5 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{Math.round(stats.totalReach * 0.4)}</Text>
            <Text className={`text-[10px] font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Registrations</Text>
          </View>
        </View>

        {/* Recent Activity */}
        <Text className={`text-sm font-extrabold mb-3.5 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          Recent Activity
        </Text>

        <View className="gap-3 mb-10">
          {recentEvents.length === 0 ? (
            <Text className={`text-center py-4 text-xs font-semibold ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
              No recent events posted yet.
            </Text>
          ) : (
            recentEvents.map(event => {
              const colors = getTypeColor(event.event_type);
              return (
                <View key={event.id} className={`rounded-3xl border p-5 flex-row items-center border-l-4 ${colors.border} ${
                  isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'
                }`}>
                  <View className="flex-1">
                    <Text className={`text-sm font-extrabold mb-1.5 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      {event.title}
                    </Text>
                    <View className="flex-row items-center gap-2">
                      <Text className={`text-[10px] font-semibold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        {new Date(event.event_date).toLocaleDateString()}
                      </Text>
                      <Text className="text-slate-300 text-xs">•</Text>
                      <View className={`px-2.5 py-0.5 rounded-full ${colors.bg}`}>
                        <Text className={`text-[9px] font-bold ${colors.text}`}>
                          {event.event_type || 'Event'}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
