import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useUIStore } from '../../store/uiStore';
import client from '../../api/client';

const EVENT_FILTERS = ['All Events', 'Hackathon', 'Workshop', 'Competition'];

interface EventItem {
  id: string;
  type: 'Hackathon' | 'Workshop' | 'Seminar' | 'Competition';
  title: string;
  organizer: string;
  date: string;
  prize?: string;
  teamSize?: string;
  topAccentColor: string;
  badgeBg: string;
  badgeText: string;
  isBookmarked?: boolean;
}

const MOCK_EVENTS: EventItem[] = [
  {
    id: 'hacktu_2026',
    type: 'Hackathon',
    title: 'HackTU 2026',
    organizer: 'Tribhuvan University',
    date: 'Jun 15',
    prize: 'NPR 1,00,000',
    teamSize: '2-4',
    topAccentColor: 'bg-blue-600',
    badgeBg: 'bg-blue-50',
    badgeText: 'text-blue-600',
    isBookmarked: true
  },
  {
    id: 'web3_workshop',
    type: 'Workshop',
    title: 'Web3 Workshop Series',
    organizer: 'Kathmandu University',
    date: 'May 28',
    teamSize: '1-1',
    topAccentColor: 'bg-emerald-600',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-600',
    isBookmarked: true
  },
  {
    id: 'ai_summit',
    type: 'Seminar',
    title: 'AI Innovation Summit',
    organizer: 'Tribhuvan University',
    date: 'Jul 10',
    teamSize: '1-1',
    topAccentColor: 'bg-purple-600',
    badgeBg: 'bg-purple-50',
    badgeText: 'text-purple-600',
    isBookmarked: true
  },
  {
    id: 'design_pitch',
    type: 'Competition',
    title: 'Design Pitch 2026',
    organizer: 'Pokhara University',
    date: 'Aug 05',
    prize: 'NPR 50,000',
    teamSize: '1-3',
    topAccentColor: 'bg-pink-600',
    badgeBg: 'bg-pink-50',
    badgeText: 'text-pink-600',
    isBookmarked: false
  }
];

export default function Events() {
  const { isDarkMode } = useUIStore();
  const [activeFilter, setActiveFilter] = useState('All Events');
  const [events, setEvents] = useState<EventItem[]>(MOCK_EVENTS);
  const [loading, setLoading] = useState(false);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await client.get('/events');
      if (response.data && response.data.success && response.data.data.length > 0) {
        const liveEvents = response.data.data.map((e: any) => ({
          id: e.id,
          type: e.event_type || 'Hackathon',
          title: e.title,
          organizer: e.organizer || 'Society Team',
          date: e.event_date ? new Date(e.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'TBD',
          prize: 'NPR 1,00,000',
          teamSize: '2-4',
          topAccentColor: e.event_type === 'Workshop' ? 'bg-emerald-600' : e.event_type === 'Seminar' ? 'bg-purple-600' : 'bg-blue-600',
          badgeBg: e.event_type === 'Workshop' ? 'bg-emerald-50' : e.event_type === 'Seminar' ? 'bg-purple-50' : 'bg-blue-50',
          badgeText: e.event_type === 'Workshop' ? 'text-emerald-600' : e.event_type === 'Seminar' ? 'text-purple-600' : 'text-blue-600',
          isBookmarked: false
        }));
        setEvents(liveEvents);
      }
    } catch (err) {
      console.warn('Error fetching events, using mocks:', err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchEvents();
    }, [])
  );

  const toggleBookmark = (id: string) => {
    setEvents(prev => prev.map(e => e.id === id ? { ...e, isBookmarked: !e.isBookmarked } : e));
  };

  const filteredEvents = activeFilter === 'All Events' 
    ? events 
    : events.filter(e => e.type === activeFilter);

  return (
    <SafeAreaView 
      className={`flex-1 ${isDarkMode ? 'bg-[#0F172A]' : 'bg-[#F8FAFC]'}`}
      edges={['top']}
    >
      {/* Top Header */}
      <View className={`px-6 pt-4 pb-4 ${isDarkMode ? 'bg-[#0F172A]' : 'bg-white border-b border-slate-100 shadow-sm'}`}>
        <Text className={`text-2xl font-bold tracking-tight mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          Events
        </Text>

        {/* Filter Pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
          <View className="flex-row gap-2 pb-2">
            {EVENT_FILTERS.map((filter) => {
              const isActive = filter === activeFilter;
              return (
                <TouchableOpacity
                  key={filter}
                  onPress={() => setActiveFilter(filter)}
                  className={`px-4 py-1.5 rounded-full border ${
                    isActive
                      ? 'bg-blue-600 border-blue-600'
                      : isDarkMode
                      ? 'bg-slate-800 border-slate-700'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <Text className={`font-semibold text-xs ${isActive ? 'text-white' : isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>
                    {filter}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </View>

      {/* Events List */}
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 32, paddingTop: 16 }}
      >
        <View className="gap-4">
          {filteredEvents.map((event) => (
            <View 
              key={event.id} 
              className={`rounded-3xl border border-slate-100 overflow-hidden ${
                isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white shadow-sm'
              }`}
            >
              {/* Colored Line Accent Header */}
              <View className={`h-[5px] w-full ${event.topAccentColor}`} />

              <View className="p-5">
                {/* Badge & Bookmark Row */}
                <View className="flex-row justify-between items-center mb-3">
                  <View className={`px-3 py-1 rounded-full ${isDarkMode ? 'bg-slate-700' : event.badgeBg}`}>
                    <Text className={`text-[10px] font-semibold ${isDarkMode ? 'text-slate-300' : event.badgeText}`}>
                      {event.type}
                    </Text>
                  </View>

                  <TouchableOpacity onPress={() => toggleBookmark(event.id)}>
                    <Ionicons 
                      name={event.isBookmarked ? 'bookmark' : 'bookmark-outline'} 
                      size={18} 
                      color={event.isBookmarked ? '#F59E0B' : '#94A3B8'} 
                    />
                  </TouchableOpacity>
                </View>

                {/* Event Name */}
                <Text className={`text-[17px] font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  {event.title}
                </Text>

                {/* Organizer */}
                <Text className={`text-xs mb-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  {event.organizer}
                </Text>

                {/* Footer details row with icons */}
                <View className="flex-row items-center gap-4">
                  {/* Date info */}
                  <View className="flex-row items-center gap-1.5">
                    <Ionicons name="calendar-outline" size={14} color="#94A3B8" />
                    <Text className={`text-[11px] font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      {event.date}
                    </Text>
                  </View>

                  {/* Prize Info (Optional) */}
                  {event.prize && (
                    <View className="flex-row items-center gap-1.5">
                      <Ionicons name="trophy-outline" size={14} color="#94A3B8" />
                      <Text className={`text-[11px] font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        {event.prize}
                      </Text>
                    </View>
                  )}

                  {/* Team limit info */}
                  {event.teamSize && (
                    <View className="flex-row items-center gap-1.5">
                      <Ionicons name="people-outline" size={14} color="#94A3B8" />
                      <Text className={`text-[11px] font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        {event.teamSize}
                      </Text>
                    </View>
                  )}
                </View>

              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
