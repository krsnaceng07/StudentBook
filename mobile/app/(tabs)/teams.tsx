import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useUIStore } from '../../store/uiStore';

const MOCK_TEAM = {
  name: 'Team Innovators',
  event_name: 'Nepal Tech Hackathon 2025',
  max_members: 4,
  members: [
    {
      id: '1',
      initials: 'KS',
      name: 'Krishna Sharma',
      role_title: 'Android Dev',
      role: 'Leader',
      color: 'bg-blue-100',
      text: 'text-blue-600',
    },
    {
      id: '2',
      initials: 'PR',
      name: 'Priya Rana',
      role_title: 'UI/UX Designer',
      role: 'Member',
      color: 'bg-purple-100',
      text: 'text-purple-600',
    },
    {
      id: '3',
      initials: 'AK',
      name: 'Aakash KC',
      role_title: 'Backend Dev',
      role: 'Member',
      color: 'bg-amber-100',
      text: 'text-amber-600',
    },
  ],
  needed: 'ML specialist',
};

export default function Teams() {
  const { isDarkMode } = useUIStore();
  const membersCount = MOCK_TEAM.members.length;
  const openSlots = MOCK_TEAM.max_members - membersCount;

  return (
    <SafeAreaView className={`flex-1 ${isDarkMode ? 'bg-[#0F172A]' : 'bg-[#F8FAFC]'}`}>
      <View className={`px-6 pt-4 pb-3 flex-row items-center justify-between border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
        <Text className={`text-2xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          My team
        </Text>
        <TouchableOpacity className="bg-blue-600 px-4 py-2 rounded-full">
          <Text className="text-white font-semibold">+ Invite</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1">
        {/* Team Header Info */}
        <View className={`px-6 py-5 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
          <Text className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            {MOCK_TEAM.name}
          </Text>
          <Text className={`text-sm mt-0.5 mb-3 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            For: {MOCK_TEAM.event_name}
          </Text>
          <View className="flex-row gap-2">
            <View className={`px-3 py-1 rounded-full ${isDarkMode ? 'bg-blue-900/50' : 'bg-blue-100'}`}>
              <Text className={`text-xs font-semibold ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                {membersCount}/{MOCK_TEAM.max_members} members
              </Text>
            </View>
            <View className={`px-3 py-1 rounded-full ${isDarkMode ? 'bg-orange-900/50' : 'bg-orange-100'}`}>
              <Text className={`text-xs font-semibold ${isDarkMode ? 'text-orange-300' : 'text-orange-700'}`}>
                {openSlots} slot open
              </Text>
            </View>
          </View>
        </View>

        {/* Members List */}
        <View className="pt-5 pb-8">
          <Text className={`px-6 text-[15px] font-medium mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Members
          </Text>
          
          {MOCK_TEAM.members.map((member, index) => (
            <View 
              key={member.id} 
              className={`flex-row items-center px-6 py-4 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}
            >
              <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${member.color}`}>
                <Text className={`font-bold text-base ${member.text}`}>{member.initials}</Text>
              </View>
              <View className="flex-1">
                <Text className={`font-bold text-[15px] ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  {member.name}
                </Text>
                <Text className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  {member.role_title}
                </Text>
              </View>
              <View className={`px-3 py-1 rounded-full border ${member.role === 'Leader' ? (isDarkMode ? 'border-purple-500/30 bg-purple-500/10' : 'border-purple-200 bg-purple-50') : (isDarkMode ? 'border-green-500/30 bg-green-500/10' : 'border-green-200 bg-green-50')}`}>
                <Text className={`text-[11px] font-bold tracking-wide ${member.role === 'Leader' ? (isDarkMode ? 'text-purple-300' : 'text-purple-600') : (isDarkMode ? 'text-green-300' : 'text-green-600')}`}>
                  {member.role.toUpperCase()}
                </Text>
              </View>
            </View>
          ))}

          {/* Open Slot */}
          {openSlots > 0 && (
            <View className={`flex-row items-center px-6 py-4 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
              <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 border border-dashed ${isDarkMode ? 'border-slate-600' : 'border-slate-300'}`}>
                <Ionicons name="add" size={24} color={isDarkMode ? '#64748B' : '#94A3B8'} />
              </View>
              <View className="flex-1">
                <Text className={`font-medium text-[15px] ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Open slot
                </Text>
                <Text className={`text-sm italic ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                  Need: {MOCK_TEAM.needed}
                </Text>
              </View>
              <TouchableOpacity>
                <Text className="text-blue-500 font-semibold px-2 py-1">Find</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
