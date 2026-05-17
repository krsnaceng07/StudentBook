import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useUIStore } from '../../store/uiStore';

const MOCK_PROFILE = {
  initials: 'KS',
  name: 'Krishna Sharma',
  university: 'Tribhuvan University',
  location: 'Kathmandu, Nepal',
  role_title: 'Android Developer',
  year: 'Final Year',
  stats: {
    connections: 12,
    events_joined: 3,
    teams: 2,
  },
  skills: [
    { name: 'Kotlin', color: 'bg-green-100 text-green-700' },
    { name: 'Android', color: 'bg-green-100 text-green-700' },
    { name: 'Firebase', color: 'bg-green-100 text-green-700' },
    { name: 'Figma', color: 'bg-green-100 text-green-700' },
  ],
  interests: [
    { name: 'Hackathons', color: 'bg-blue-100 text-blue-700' },
    { name: 'AI/ML', color: 'bg-blue-100 text-blue-700' },
    { name: 'Startups', color: 'bg-blue-100 text-blue-700' },
  ],
  goal: "Looking to collaborate on innovative mobile applications, especially those focused on education and productivity. Open to joining hackathon teams!",
};

export default function Profile() {
  const { isDarkMode } = useUIStore();

  return (
    <SafeAreaView className={`flex-1 ${isDarkMode ? 'bg-[#0F172A]' : 'bg-[#F8FAFC]'}`} edges={['top']}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        
        {/* Banner Section */}
        <View className={`h-40 ${isDarkMode ? 'bg-blue-900' : 'bg-blue-100'} relative`}>
          <View className="absolute top-4 left-6 right-6 flex-row justify-between items-center z-10">
            <Text className={`text-xl font-bold ${isDarkMode ? 'text-blue-100' : 'text-blue-900'}`}>My profile</Text>
            <TouchableOpacity>
              <Ionicons name="settings-outline" size={24} color={isDarkMode ? '#DBEAFE' : '#1E3A8A'} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Profile Content */}
        <View className={`flex-1 px-6 ${isDarkMode ? 'bg-[#0F172A]' : 'bg-white'} rounded-t-3xl -mt-6 pt-0`}>
          
          {/* Avatar (Overlapping banner) */}
          <View className="items-center -mt-16 mb-4">
            <View className={`w-32 h-32 rounded-full items-center justify-center border-4 ${isDarkMode ? 'bg-blue-600 border-[#0F172A]' : 'bg-blue-500 border-white'}`}>
              <Text className="text-white text-4xl font-bold">{MOCK_PROFILE.initials}</Text>
            </View>
          </View>

          {/* Info */}
          <View className="items-center mb-6">
            <Text className={`text-2xl font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              {MOCK_PROFILE.name}
            </Text>
            <Text className={`text-sm mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              {MOCK_PROFILE.university} • {MOCK_PROFILE.location}
            </Text>
            <Text className={`text-[15px] font-medium ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
              {MOCK_PROFILE.role_title} • {MOCK_PROFILE.year}
            </Text>
          </View>

          {/* Stats Row */}
          <View className={`flex-row justify-between items-center py-4 border-y ${isDarkMode ? 'border-slate-800' : 'border-slate-100'} mb-8`}>
            <View className="items-center flex-1">
              <Text className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                {MOCK_PROFILE.stats.connections}
              </Text>
              <Text className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Connections</Text>
            </View>
            <View className={`h-8 w-[1px] ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`} />
            <View className="items-center flex-1">
              <Text className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                {MOCK_PROFILE.stats.events_joined}
              </Text>
              <Text className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Events joined</Text>
            </View>
            <View className={`h-8 w-[1px] ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`} />
            <View className="items-center flex-1">
              <Text className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                {MOCK_PROFILE.stats.teams}
              </Text>
              <Text className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Teams</Text>
            </View>
          </View>

          {/* Skills Section */}
          <View className="mb-6">
            <View className="flex-row justify-between items-center mb-3">
              <Text className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Skills</Text>
              <TouchableOpacity>
                <Ionicons name="pencil" size={18} color={isDarkMode ? '#64748B' : '#94A3B8'} />
              </TouchableOpacity>
            </View>
            <View className="flex-row flex-wrap gap-2">
              {MOCK_PROFILE.skills.map((skill, index) => (
                <View key={index} className={`px-4 py-1.5 rounded-full ${isDarkMode ? 'bg-green-900/30' : 'bg-green-100'}`}>
                  <Text className={`text-[13px] font-medium ${isDarkMode ? 'text-green-400' : 'text-green-700'}`}>{skill.name}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Interests Section */}
          <View className="mb-6">
            <View className="flex-row justify-between items-center mb-3">
              <Text className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Interests</Text>
              <TouchableOpacity>
                <Ionicons name="pencil" size={18} color={isDarkMode ? '#64748B' : '#94A3B8'} />
              </TouchableOpacity>
            </View>
            <View className="flex-row flex-wrap gap-2">
              {MOCK_PROFILE.interests.map((interest, index) => (
                <View key={index} className={`px-4 py-1.5 rounded-full ${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-100'}`}>
                  <Text className={`text-[13px] font-medium ${isDarkMode ? 'text-blue-400' : 'text-blue-700'}`}>{interest.name}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Goal Section */}
          <View className="mb-8">
            <View className="flex-row justify-between items-center mb-3">
              <Text className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Current Goal</Text>
              <TouchableOpacity>
                <Ionicons name="pencil" size={18} color={isDarkMode ? '#64748B' : '#94A3B8'} />
              </TouchableOpacity>
            </View>
            <View className={`p-4 rounded-xl ${isDarkMode ? 'bg-slate-800' : 'bg-slate-50'}`}>
              <Text className={`text-[15px] leading-6 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                {MOCK_PROFILE.goal}
              </Text>
            </View>
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
