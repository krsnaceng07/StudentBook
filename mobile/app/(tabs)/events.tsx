import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useUIStore } from '../../store/uiStore';

const EVENT_FILTERS = ['All', 'Hackathon', 'Workshop', 'Competition'];

const MOCK_EVENTS = [
  {
    id: '1',
    type: 'Hackathon',
    groupTitle: 'Nepal Tech Hackathon 2025',
    groupColor: 'bg-purple-100',
    groupText: 'text-purple-700',
    badgeColor: 'bg-purple-100 text-purple-700',
    name: 'Nepal Tech Hackathon',
    date: 'Dec 15–16 · Kathmandu',
    organizer: 'Organized by TechNepal',
  },
  {
    id: '2',
    type: 'Workshop',
    groupTitle: 'AI/ML Workshop',
    groupColor: 'bg-green-100',
    groupText: 'text-green-700',
    badgeColor: 'bg-green-100 text-green-700',
    name: 'Intro to Machine Learning',
    date: 'Nov 28 · Online',
    organizer: 'KU Computer Club',
  },
  {
    id: '3',
    type: 'Competition',
    groupTitle: 'Business Idea Competition',
    groupColor: 'bg-yellow-100',
    groupText: 'text-yellow-800',
    badgeColor: 'bg-yellow-100 text-yellow-800',
    name: 'Student Startup Pitch 2025',
    date: 'Jan 10 · Pokhara',
    organizer: 'Entrepreneurs Hub Nepal',
  },
];

export default function Events() {
  const { isDarkMode } = useUIStore();
  const [activeFilter, setActiveFilter] = useState('All');

  const filteredEvents =
    activeFilter === 'All' ? MOCK_EVENTS : MOCK_EVENTS.filter((e) => e.type === activeFilter);

  return (
    <SafeAreaView className={`flex-1 ${isDarkMode ? 'bg-[#0F172A]' : 'bg-[#F8FAFC]'}`}>
      <View className="px-6 pt-4 pb-2 flex-row items-center justify-between">
        <Text className={`text-2xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          Events
        </Text>
        <TouchableOpacity className={`w-10 h-10 rounded-full items-center justify-center ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
          <Ionicons name="options-outline" size={20} color={isDarkMode ? '#94A3B8' : '#475569'} />
        </TouchableOpacity>
      </View>

      {/* Filter Pills */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-6 mb-4" contentContainerStyle={{ gap: 8 }}>
        {EVENT_FILTERS.map((filter) => {
          const isActive = filter === activeFilter;
          return (
            <TouchableOpacity
              key={filter}
              onPress={() => setActiveFilter(filter)}
              className={`px-4 py-1.5 rounded-full border ${
                isActive
                  ? 'bg-blue-500 border-blue-500'
                  : isDarkMode
                  ? 'bg-slate-800 border-slate-700'
                  : 'bg-white border-slate-200'
              }`}
            >
              <Text className={`font-medium ${isActive ? 'text-white' : isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                {filter}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Event Groups */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 32, gap: 16 }}>
        {filteredEvents.map((event) => (
          <View key={event.id} className={`rounded-2xl overflow-hidden border ${isDarkMode ? 'border-slate-700' : 'border-slate-100'}`}>
            {/* Group Header */}
            <View className={`px-4 py-3 ${isDarkMode ? 'bg-slate-800' : event.groupColor}`}>
              <Text className={`font-bold text-base ${isDarkMode ? 'text-white' : event.groupText}`}>
                {event.groupTitle}
              </Text>
            </View>

            {/* Event Card */}
            <View className={`px-4 pt-3 pb-4 ${isDarkMode ? 'bg-slate-800/60' : 'bg-white'}`}>
              <View className="flex-row items-start justify-between mb-1">
                <Text className={`text-base font-bold flex-1 mr-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  {event.name}
                </Text>
                <View className={`px-2.5 py-0.5 rounded-full ${isDarkMode ? 'bg-slate-700' : event.badgeColor.split(' ')[0]}`}>
                  <Text className={`text-xs font-semibold ${isDarkMode ? 'text-slate-300' : event.badgeColor.split(' ')[1]}`}>
                    {event.type}
                  </Text>
                </View>
              </View>
              <Text className={`text-sm mb-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{event.date}</Text>
              <Text className={`text-sm mb-4 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{event.organizer}</Text>

              <View className="flex-row gap-3">
                <TouchableOpacity className="flex-1 bg-blue-600 py-3 rounded-xl items-center">
                  <Text className="text-white font-semibold">Register</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`px-5 py-3 rounded-xl items-center border ${isDarkMode ? 'border-slate-600' : 'border-slate-200'}`}
                >
                  <Text className={`font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
