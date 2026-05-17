import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useUIStore } from '../../store/uiStore';

interface EventDetails {
  title: string;
  organizer: string;
  date: string;
  deadline: string;
  venue: string;
  teamSize: string;
  prize: string;
  about: string;
  tags: string[];
}

const FALLBACK_EVENTS: Record<string, EventDetails> = {
  '1': {
    title: 'HackTU 2026',
    organizer: 'Tribhuvan University',
    date: 'June 15, 2026',
    deadline: 'Jun 1',
    venue: 'Pulchowk Engineering Campus',
    teamSize: '2-4 members',
    prize: 'NPR 1,00,000',
    about: "Nepal's biggest student hackathon. 36 hours. Build solutions for real Nepali problems. Cash prizes, mentorship, and direct startup funding opportunities.",
    tags: ['AI', 'FinTech', 'Social Impact'],
  },
  '2': {
    title: 'Web3 Workshop Series',
    organizer: 'Kathmandu University',
    date: 'May 28, 2026',
    deadline: 'May 25',
    venue: 'KU Main Campus, Dhulikhel',
    teamSize: 'Individual Entry',
    prize: 'Certificate & Swag',
    about: 'Learn the fundamentals of blockchain development, smart contracts, and decentralized applications from industry leading experts.',
    tags: ['Web3', 'Blockchain', 'Solidity'],
  },
  'default': {
    title: 'AI Innovation Summit',
    organizer: 'Lalitpur Engineering College',
    date: 'July 10, 2026',
    deadline: 'Jun 30',
    venue: 'LEC Conference Hall',
    teamSize: '1-3 members',
    prize: 'NPR 50,000',
    about: 'Join us for a full day of research presentations, keynote speakers, and collaborative project workshops focused on Generative AI solutions.',
    tags: ['AI', 'Research', 'Tech'],
  }
};

export default function EventDetailsPage() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isDarkMode } = useUIStore();
  const [bookmarked, setBookmarked] = useState(false);

  const event = FALLBACK_EVENTS[id] || FALLBACK_EVENTS['default'];

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
        <Text className="text-blue-100 text-sm font-semibold">{event.organizer}</Text>
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
            <Text className={`text-xs font-bold leading-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{event.date}</Text>
          </View>

          {/* Card 2: Deadline */}
          <View className={`w-[48%] rounded-3xl p-5 border ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100/80 shadow-sm'
          }`}>
            <Text className="text-xl mb-2">⏰</Text>
            <Text className={`text-[10px] font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-400'} uppercase mb-0.5`}>Deadline</Text>
            <Text className={`text-xs font-bold leading-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{event.deadline}</Text>
          </View>

          {/* Card 3: Venue */}
          <View className={`w-[48%] rounded-3xl p-5 border ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100/80 shadow-sm'
          }`}>
            <Text className="text-xl mb-2">📍</Text>
            <Text className={`text-[10px] font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-400'} uppercase mb-0.5`}>Venue</Text>
            <Text className={`text-xs font-bold leading-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{event.venue}</Text>
          </View>

          {/* Card 4: Team Size */}
          <View className={`w-[48%] rounded-3xl p-5 border ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100/80 shadow-sm'
          }`}>
            <Text className="text-xl mb-2">👥</Text>
            <Text className={`text-[10px] font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-400'} uppercase mb-0.5`}>Team Size</Text>
            <Text className={`text-xs font-bold leading-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{event.teamSize}</Text>
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
            }`}>{event.prize}</Text>
          </View>
        </View>

        {/* About Card */}
        <View className={`rounded-3xl p-6 border mb-4 ${
          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'
        }`}>
          <Text className={`text-sm font-extrabold mb-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>About this Event</Text>
          <Text className={`text-xs leading-relaxed font-semibold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            {event.about}
          </Text>
        </View>

        {/* Tags Card */}
        <View className={`rounded-3xl p-6 border mb-10 ${
          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'
        }`}>
          <Text className={`text-sm font-extrabold mb-3.5 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Tags</Text>
          <View className="flex-row flex-wrap gap-2">
            {event.tags.map((tag) => (
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
