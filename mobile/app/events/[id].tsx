import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useUIStore } from '../../store/uiStore';
import api from '../../api/client';

export default function EventDetailsPage() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isDarkMode } = useUIStore();
  const [bookmarked, setBookmarked] = useState(false);
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchEventDetails = async () => {
    if (!id) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const response = await api.get(`/events/${id}`);
      if (response.data?.success && response.data?.data) {
        setEvent(response.data.data);
      } else {
        setErrorMsg('Failed to load event details.');
      }
    } catch (error: any) {
      console.error('Error loading event details:', error);
      setErrorMsg('Failed to connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchEventDetails();
    }, [id])
  );

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'TBD';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const formatDeadline = (dateStr: string) => {
    if (!dateStr) return 'Not Specified';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <SafeAreaView className={`flex-1 items-center justify-center ${isDarkMode ? 'bg-[#0F172A]' : 'bg-[#F8FAFC]'}`}>
        <ActivityIndicator size="large" color="#2563EB" />
      </SafeAreaView>
    );
  }

  if (errorMsg || !event) {
    return (
      <SafeAreaView className={`flex-1 items-center justify-center px-6 ${isDarkMode ? 'bg-[#0F172A]' : 'bg-[#F8FAFC]'}`}>
        <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
        <Text className={`text-base font-bold mt-4 text-center ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{errorMsg || 'Event not found'}</Text>
        <TouchableOpacity 
          onPress={fetchEventDetails}
          className="mt-6 bg-[#2563EB] px-6 py-3 rounded-2xl"
        >
          <Text className="text-white font-bold">Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const teamSizeText = event.min_team || event.max_team
    ? `${event.min_team || 2}-${event.max_team || 4} members`
    : event.member_limit
      ? `${event.member_limit} members`
      : 'Individual Entry';

  const tags = event.tags && event.tags.length > 0
    ? event.tags
    : [event.event_type || 'Event', 'Tech'];

  return (
    <SafeAreaView 
      className={`flex-1 ${isDarkMode ? 'bg-[#0F172A]' : 'bg-[#F8FAFC]'}`}
      edges={['top']}
    >
      {/* Top Blue Header Banner */}
      <View className="bg-[#2563EB] px-6 pt-6 pb-12 rounded-b-[36px]">
        {/* Navigation row */}
        <View className="flex-row justify-between items-center mb-10">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="w-10 h-10 rounded-2xl items-center justify-center bg-white/20 border border-white/10"
          >
            <Ionicons name="arrow-back" size={20} color="white" />
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => setBookmarked(!bookmarked)}
            className={`w-10 h-10 rounded-2xl items-center justify-center ${
              bookmarked ? 'bg-[#F59E0B]' : 'bg-white/20'
            } border border-white/10`}
          >
            <Ionicons name={bookmarked ? "bookmark" : "bookmark-outline"} size={18} color="white" />
          </TouchableOpacity>
        </View>

        <Text className="text-white text-3xl font-extrabold mb-1">{event.title}</Text>
        <Text className="text-blue-100 text-sm font-semibold">{event.organizer || 'Tribhuvan University'}</Text>
      </View>

      <ScrollView 
        className="flex-1 px-6 -mt-6"
        showsVerticalScrollIndicator={false}
      >
        {/* 2x2 Grid Stats */}
        <View className="flex-row flex-wrap justify-between gap-3 mb-4">
          {/* Card 1: Date */}
          <View className={`w-[48%] rounded-3xl p-5 border ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100/80 shadow-sm'
          }`}>
            <Text className="text-xl mb-2">📅</Text>
            <Text className={`text-[10px] font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-400'} uppercase mb-0.5`}>Date</Text>
            <Text className={`text-xs font-bold leading-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{formatDate(event.event_date)}</Text>
          </View>

          {/* Card 2: Deadline */}
          <View className={`w-[48%] rounded-3xl p-5 border ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100/80 shadow-sm'
          }`}>
            <Text className="text-xl mb-2">⏰</Text>
            <Text className={`text-[10px] font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-400'} uppercase mb-0.5`}>Deadline</Text>
            <Text className={`text-xs font-bold leading-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{formatDeadline(event.reg_deadline)}</Text>
          </View>

          {/* Card 3: Venue */}
          <View className={`w-[48%] rounded-3xl p-5 border ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100/80 shadow-sm'
          }`}>
            <Text className="text-xl mb-2">📍</Text>
            <Text className={`text-[10px] font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-400'} uppercase mb-0.5`}>Venue</Text>
            <Text className={`text-xs font-bold leading-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{event.location || (event.is_online ? 'Online Event' : 'TBD')}</Text>
          </View>

          {/* Card 4: Team Size */}
          <View className={`w-[48%] rounded-3xl p-5 border ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100/80 shadow-sm'
          }`}>
            <Text className="text-xl mb-2">👥</Text>
            <Text className={`text-[10px] font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-400'} uppercase mb-0.5`}>Team Size</Text>
            <Text className={`text-xs font-bold leading-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{teamSizeText}</Text>
          </View>
        </View>

        {/* Prize Pool Highlight Card */}
        <View className={`rounded-3xl p-6 border flex-row items-center gap-4 mb-4 ${
          isDarkMode ? 'bg-[#78350F]/20 border-[#F59E0B]/30' : 'bg-[#FFFBEB] border-[#FEF3C7]'
        }`}>
          <Text className="text-2xl">🏆</Text>
          <View>
            <Text className={`text-[10px] font-bold uppercase tracking-wider ${
              isDarkMode ? 'text-amber-400' : 'text-amber-600'
            }`}>Prize Pool</Text>
            <Text className={`text-lg font-extrabold ${
              isDarkMode ? 'text-amber-300' : 'text-amber-800'
            }`}>{event.prize_pool || 'Certificate & Swag'}</Text>
          </View>
        </View>

        {/* About Card */}
        <View className={`rounded-3xl p-6 border mb-4 ${
          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'
        }`}>
          <Text className={`text-sm font-extrabold mb-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>About this Event</Text>
          <Text className={`text-xs leading-relaxed font-semibold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            {event.description || 'No description provided.'}
          </Text>
        </View>

        {/* Tags Card */}
        <View className={`rounded-3xl p-6 border mb-10 ${
          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'
        }`}>
          <Text className={`text-sm font-extrabold mb-3.5 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Tags</Text>
          <View className="flex-row flex-wrap gap-2">
            {tags.map((tag: string) => (
              <View 
                key={tag} 
                className={`px-4 py-2 rounded-2xl ${
                  isDarkMode ? 'bg-slate-800' : 'bg-slate-50 border border-slate-100'
                }`}
              >
                <Text className={`text-xs font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
