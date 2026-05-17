import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useUIStore } from '../../store/uiStore';

const MOCK_CONVERSATIONS = [
  {
    id: '1',
    initials: 'PR',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-600',
    name: 'Priya Rana',
    preview: 'Are you free for the hackathon ...',
    time: '2m ago',
    unread: true,
  },
  {
    id: '2',
    initials: 'AK',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-600',
    name: 'Aakash KC',
    preview: 'I can handle the backend part, ...',
    time: '1h ago',
    unread: true,
  },
  {
    id: '3',
    initials: 'RB',
    bgColor: 'bg-red-100',
    textColor: 'text-red-600',
    name: 'Roshan Bhandari',
    preview: "Let's connect on the ML works...",
    time: '3h ago',
    unread: false,
  },
  {
    id: '4',
    initials: 'SM',
    bgColor: 'bg-teal-100',
    textColor: 'text-teal-600',
    name: 'Sunita Magar',
    preview: 'I finished the wireframes, chec...',
    time: 'Yesterday',
    unread: false,
  },
  {
    id: '5',
    initials: 'BT',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-600',
    name: 'Bikash Thapa',
    preview: 'Sent you the APK for testing.',
    time: 'Mon',
    unread: false,
  },
];

export default function Messages() {
  const { isDarkMode } = useUIStore();
  const [search, setSearch] = useState('');

  const filtered = MOCK_CONVERSATIONS.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView className={`flex-1 ${isDarkMode ? 'bg-[#0F172A]' : 'bg-[#F8FAFC]'}`}>
      {/* Header */}
      <View className="px-6 pt-4 pb-3 flex-row items-center justify-between">
        <Text className={`text-2xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          Messages
        </Text>
        <TouchableOpacity className={`w-10 h-10 rounded-full items-center justify-center ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
          <Ionicons name="create-outline" size={20} color={isDarkMode ? '#94A3B8' : '#475569'} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View className={`mx-6 mb-4 flex-row items-center rounded-xl px-4 py-2 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
        <Ionicons name="search" size={18} color={isDarkMode ? '#94A3B8' : '#64748B'} />
        <TextInput
          placeholder="Search messages..."
          placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'}
          value={search}
          onChangeText={setSearch}
          className={`flex-1 ml-2 font-medium ${isDarkMode ? 'text-white' : 'text-slate-800'}`}
        />
      </View>

      {/* Conversation List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => (
          <View className={`h-px mx-6 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`} />
        )}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.7}
            className={`flex-row items-center px-6 py-4`}
          >
            {/* Avatar */}
            <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${item.bgColor}`}>
              <Text className={`font-bold text-base ${item.textColor}`}>{item.initials}</Text>
            </View>

            {/* Content */}
            <View className="flex-1">
              <Text className={`font-bold text-base ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                {item.name}
              </Text>
              <Text
                className={`text-sm mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}
                numberOfLines={1}
              >
                {item.preview}
              </Text>
            </View>

            {/* Right side */}
            <View className="items-end ml-2 gap-2">
              <Text className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                {item.time}
              </Text>
              {item.unread && (
                <View className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              )}
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}
