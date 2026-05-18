import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUIStore } from '../../store/uiStore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import client from '../../api/client';

interface Teammate {
  id: string;
  initials: string;
  avatar_color: string;
  name: string;
  university: string;
  year: string;
  status_badge: 'Open to Join' | 'Looking for Team' | 'Exploring';
  skills: string[];
  bio?: string;
  is_online?: boolean;
}

const MOCK_TEAMMATES: Teammate[] = [
  {
    id: 'priya_thapa',
    initials: 'PT',
    avatar_color: 'bg-purple-100 text-purple-600 border-purple-200',
    name: 'Priya Thapa',
    university: 'Kathmandu University',
    year: '2nd Year',
    status_badge: 'Open to Join',
    skills: ['IoT', 'C++', 'Arduino'],
    is_online: true,
    bio: 'Hardware + software bridge builder. Love IoT and embedded systems.'
  },
  {
    id: 'rohan_kc',
    initials: 'RK',
    avatar_color: 'bg-emerald-100 text-emerald-600 border-emerald-200',
    name: 'Rohan KC',
    university: 'Pokhara University',
    year: '4th Year',
    status_badge: 'Looking for Team',
    skills: ['Node.js', 'React', 'PostgreSQL'],
    is_online: true,
    bio: 'Passionate full-stack developer looking to team up for tech contests.'
  },
  {
    id: 'sita_gurung',
    initials: 'SG',
    avatar_color: 'bg-pink-100 text-pink-600 border-pink-200',
    name: 'Sita Gurung',
    university: 'Tribhuvan University',
    year: '3rd Year',
    status_badge: 'Open to Join',
    skills: ['Figma', 'UI/UX', 'React'],
    is_online: true,
    bio: 'Product designer interested in creating seamless user flows and interface animations.'
  },
  {
    id: 'dinesh_rai',
    initials: 'DR',
    avatar_color: 'bg-blue-100 text-blue-600 border-blue-200',
    name: 'Dinesh Rai',
    university: 'Kathmandu University',
    year: '3rd Year',
    status_badge: 'Looking for Team',
    skills: ['React', 'Python', 'AWS'],
    is_online: true,
    bio: 'Cloud and web developer open for interesting collaboration opportunities.'
  }
];

export default function Discover() {
  const { isDarkMode } = useUIStore();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [loading, setLoading] = useState(false);
  const [teammates, setTeammates] = useState<Teammate[]>(MOCK_TEAMMATES);

  const filters = ['All', 'Seeking Team', 'Open to Join', 'Exploring'];

  const fetchTeammates = async () => {
    setLoading(true);
    try {
      const response = await client.get(`/student/discover?search=${searchQuery}`);
      if (response.data && response.data.success) {
        const liveUsers = response.data.data.map((user: any) => ({
          id: user.id,
          initials: user.initials || '??',
          avatar_color: 'bg-blue-100 text-blue-600 border-blue-200',
          name: user.full_name || 'Anonymous User',
          university: user.university || 'University Student',
          year: user.role_title || 'Student',
          status_badge: 'Open to Join',
          skills: user.skills || [],
          bio: user.bio || '',
          is_online: true
        }));
        setTeammates(liveUsers);
      } else {
        setTeammates(MOCK_TEAMMATES);
      }
    } catch (err) {
      console.warn('Error discover query, using fallback mocks:', err);
      setTeammates(MOCK_TEAMMATES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchTeammates();
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery, activeFilter]);

  return (
    <SafeAreaView 
      className={`flex-1 ${isDarkMode ? 'bg-[#0F172A]' : 'bg-[#F8FAFC]'}`}
      edges={['top']}
    >
      <View className={`px-6 pt-4 pb-2 ${isDarkMode ? 'bg-[#0F172A]' : 'bg-white border-b border-slate-100 shadow-sm'}`}>
        {/* Header */}
        <Text className={`text-2xl font-bold tracking-tight mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          Discover
        </Text>

        {/* Search Bar */}
        <View className={`flex-row items-center rounded-2xl px-4 py-3 mb-4 border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
          <Ionicons name="search" size={20} color={isDarkMode ? '#94A3B8' : '#64748B'} />
          <TextInput
            placeholder="Search by skill..."
            placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'}
            value={searchQuery}
            onChangeText={setSearchQuery}
            className={`flex-1 ml-3 font-medium text-sm ${isDarkMode ? 'text-white' : 'text-slate-800'}`}
          />
        </View>

        {/* Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
          <View className="flex-row gap-2 pb-2">
            {filters.map((filter) => {
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
                  <Text
                    className={`font-semibold text-xs ${
                      isActive ? 'text-white' : isDarkMode ? 'text-slate-300' : 'text-slate-500'
                    }`}
                  >
                    {filter}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </View>

      {/* Teammate Cards */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : (
        <ScrollView 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24, paddingTop: 12 }}
        >
          <View className="gap-4">
            {teammates.length === 0 ? (
              <View className="py-20 items-center justify-center">
                <Ionicons name="people-outline" size={48} color="#94A3B8" />
                <Text className={`text-base font-semibold mt-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  No classmates found
                </Text>
              </View>
            ) : (
              teammates.map((t) => (
                <TouchableOpacity
                  key={t.id}
                  onPress={() => router.push(`/profile/${t.id}`)}
                  className={`rounded-3xl p-5 border border-slate-100 ${
                    isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white shadow-sm'
                  }`}
                >
                  <View className="flex-row items-center mb-3">
                    {/* Circle initials avatar */}
                    <View className={`w-14 h-14 rounded-full items-center justify-center mr-4 border ${t.avatar_color.split(' ')[0]} ${t.avatar_color.split(' ')[2]}`}>
                      <Text className={`text-[17px] font-bold ${t.avatar_color.split(' ')[1]}`}>{t.initials}</Text>
                    </View>

                    {/* Meta info */}
                    <View className="flex-1">
                      <View className="flex-row items-center mb-0.5">
                        <Text className={`text-[15px] font-bold mr-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                          {t.name}
                        </Text>
                        {t.is_online && (
                          <View className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                        )}
                      </View>
                      
                      <Text className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-400'}`}>
                        {t.university} · {t.year}
                      </Text>
                    </View>
                  </View>

                  {/* Status Badge */}
                  <View className="flex-row mb-3 pl-18">
                    <View className={`px-3 py-1 rounded-full ${
                      t.status_badge === 'Open to Join'
                        ? isDarkMode ? 'bg-emerald-950/30' : 'bg-emerald-50'
                        : isDarkMode ? 'bg-blue-950/30' : 'bg-blue-50'
                    }`}>
                      <Text className={`text-[10px] font-semibold ${
                        t.status_badge === 'Open to Join'
                          ? isDarkMode ? 'text-emerald-400' : 'text-emerald-600'
                          : isDarkMode ? 'text-blue-400' : 'text-blue-600'
                      }`}>
                        {t.status_badge}
                      </Text>
                    </View>
                  </View>

                  {/* Skills Pills */}
                  <View className="flex-row flex-wrap gap-2">
                    {t.skills.map((skill) => (
                      <View 
                        key={skill} 
                        className={`px-3 py-1.5 rounded-xl border ${
                          isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-100'
                        }`}
                      >
                        <Text className={`text-[11px] font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                          {skill}
                        </Text>
                      </View>
                    ))}
                    <View 
                      className={`px-3 py-1.5 rounded-xl border ${
                        isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-100'
                      }`}
                    >
                      <Text className={`text-[11px] font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                        +1
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
