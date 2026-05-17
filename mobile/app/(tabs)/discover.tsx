import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUIStore } from '../../store/uiStore';
import { Ionicons } from '@expo/vector-icons';

export default function Discover() {
  const { isDarkMode } = useUIStore();
  const [activeFilter, setActiveFilter] = useState('All');

  const filters = ['All', 'Development', 'Design', 'Business'];

  const teammates = [
    {
      id: 1,
      initials: 'PR',
      color: 'bg-purple-100 text-purple-600',
      name: 'Priya Rana',
      location: 'Tribhuvan University · Lalitpur',
      skills: ['React', 'Node.js', 'MongoDB'],
      bio: 'Looking to join a startup project or hackathon team.',
    },
    {
      id: 2,
      initials: 'BT',
      color: 'bg-orange-100 text-orange-600',
      name: 'Bikash Thapa',
      location: 'Purbanchal University · Biratnagar',
      skills: ['Flutter', 'Firebase'],
      bio: 'Mobile app developer, open to collabs.',
    },
    {
      id: 3,
      initials: 'SM',
      color: 'bg-teal-100 text-teal-600',
      name: 'Sunita Magar',
      location: 'KU · Dhulikhel',
      skills: ['Figma', 'UI/UX'],
      bio: 'Designer looking for dev partners.',
    },
  ];

  const getSkillColor = (skill: string) => {
    switch (skill) {
      case 'React': return 'bg-blue-50 text-blue-600';
      case 'Node.js': return 'bg-green-50 text-green-600';
      case 'MongoDB': return 'bg-yellow-50 text-yellow-700';
      case 'Flutter': return 'bg-sky-50 text-sky-600';
      case 'Firebase': return 'bg-orange-50 text-orange-600';
      case 'Figma': return 'bg-purple-50 text-purple-600';
      case 'UI/UX': return 'bg-indigo-50 text-indigo-600';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <SafeAreaView className={`flex-1 ${isDarkMode ? 'bg-[#0F172A]' : 'bg-[#F8FAFC]'}`}>
      <View className="px-6 pt-4 pb-2">
        {/* Header */}
        <Text className={`text-2xl font-bold tracking-tight mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          Find teammates
        </Text>

        {/* Search Bar */}
        <View className={`flex-row items-center rounded-xl px-4 py-2 mb-4 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
          <Ionicons name="search" size={20} color={isDarkMode ? '#94A3B8' : '#64748B'} />
          <TextInput
            placeholder="Search by skill or name..."
            placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'}
            className={`flex-1 ml-2 font-medium ${isDarkMode ? 'text-white' : 'text-slate-800'}`}
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
                      ? 'bg-blue-500 border-blue-500'
                      : isDarkMode
                      ? 'bg-slate-800 border-slate-700'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <Text
                    className={`font-medium ${
                      isActive ? 'text-white' : isDarkMode ? 'text-slate-300' : 'text-slate-600'
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
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 }}>
        <View className="gap-4 mt-2">
          {teammates.map((t) => (
            <View
              key={t.id}
              className={`rounded-2xl p-4 border border-slate-100 ${
                isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white shadow-sm'
              }`}
            >
              <View className="flex-row items-center mb-3">
                <View className={`w-14 h-14 rounded-full items-center justify-center mr-4 ${t.color.split(' ')[0]}`}>
                  <Text className={`text-xl font-bold ${t.color.split(' ')[1]}`}>{t.initials}</Text>
                </View>
                <View className="flex-1">
                  <Text className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    {t.name}
                  </Text>
                  <Text className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    {t.location}
                  </Text>
                </View>
              </View>

              <View className="flex-row flex-wrap gap-2 mb-3">
                {t.skills.map((skill) => (
                  <View key={skill} className={`px-3 py-1 rounded-full ${getSkillColor(skill).split(' ')[0]}`}>
                    <Text className={`text-xs font-semibold ${getSkillColor(skill).split(' ')[1]}`}>
                      {skill}
                    </Text>
                  </View>
                ))}
              </View>

              <Text className={`text-sm mb-4 leading-5 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                {t.bio}
              </Text>

              <View className="flex-row gap-3">
                <TouchableOpacity className="flex-1 bg-blue-600 py-3 rounded-xl items-center">
                  <Text className="text-white font-semibold">Connect</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`flex-1 py-3 rounded-xl items-center border ${
                    isDarkMode ? 'border-slate-600' : 'border-slate-200'
                  }`}
                >
                  <Text className={`font-semibold ${isDarkMode ? 'text-white' : 'text-slate-700'}`}>
                    View
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
