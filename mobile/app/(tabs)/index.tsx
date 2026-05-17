import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { Ionicons } from '@expo/vector-icons';

export default function HomeIndex() {
  const { isDarkMode } = useUIStore();
  const [loading, setLoading] = useState(false); // mock loading
  
  // Mock data matching the design exactly
  const teammates = [
    { id: 1, initials: 'SR', name: 'Sita Rai', role: 'UI/UX', location: 'Kathmandu', skill: 'Design', color: 'bg-purple-100 text-purple-600' },
    { id: 2, initials: 'AK', name: 'Aakash KC', role: 'Backend', location: 'Pokhara', skill: 'Flutter', color: 'bg-green-100 text-green-600' }
  ];

  const events = [
    {
      id: 1,
      banner: 'Hackathon 2025',
      title: 'Nepal Tech Hackathon',
      date: 'Dec 15',
      location: 'Kathmandu'
    }
  ];

  const activities = [
    { id: 1, initials: 'RB', name: 'Roshan Bhandari', action: 'accepted your connect request', time: '2 hours ago', color: 'bg-orange-100 text-orange-600' },
    { id: 2, initials: 'NK', name: 'Nisha Karki', action: 'posted a new event: AI Workshop', time: '5 hours ago', color: 'bg-teal-100 text-teal-600' }
  ];

  return (
    <SafeAreaView className={`flex-1 ${isDarkMode ? 'bg-[#0F172A]' : 'bg-[#F8FAFC]'}`}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        
        {/* Header */}
        <View className="flex-row justify-between items-center px-6 pt-4 pb-2">
          <Text className="text-blue-600 text-2xl font-bold tracking-tight">CollabMate</Text>
          <View className="flex-row gap-3">
            <View className="w-8 h-8 rounded-full bg-slate-200" />
            <View className="w-8 h-8 rounded-full bg-slate-200" />
          </View>
        </View>

        {/* Suggested teammates */}
        <View className="mt-6 px-6">
          <View className="flex-row justify-between items-end mb-4">
            <Text className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Suggested teammates</Text>
            <TouchableOpacity><Text className="text-blue-500 font-medium">See all</Text></TouchableOpacity>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="overflow-visible">
            <View className="flex-row gap-4">
              {teammates.map((t) => (
                <View key={t.id} className={`w-40 rounded-2xl p-4 items-center border border-slate-100 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white shadow-sm'}`}>
                  <View className={`w-14 h-14 rounded-full items-center justify-center mb-2 ${t.color.split(' ')[0]}`}>
                    <Text className={`text-lg font-semibold ${t.color.split(' ')[1]}`}>{t.initials}</Text>
                  </View>
                  <Text className={`font-semibold mb-0.5 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{t.name}</Text>
                  <Text className={`text-xs text-center mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{t.role} · {t.location}</Text>
                  <View className="bg-blue-50 px-3 py-1 rounded-full mb-4">
                    <Text className="text-blue-600 text-xs font-medium">{t.skill}</Text>
                  </View>
                  <TouchableOpacity className="w-full bg-blue-50 py-2 rounded-xl items-center">
                    <Text className="text-blue-500 font-semibold text-sm">Connect</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Upcoming events */}
        <View className="mt-8 px-6">
          <View className="flex-row justify-between items-end mb-4">
            <Text className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Upcoming events</Text>
            <TouchableOpacity><Text className="text-blue-500 font-medium">See all</Text></TouchableOpacity>
          </View>

          {events.map((e) => (
            <View key={e.id} className={`rounded-2xl overflow-hidden border border-slate-100 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white shadow-sm'}`}>
              <View className="h-32 bg-blue-50 items-center justify-center">
                <Text className="text-blue-600 font-medium">{e.banner}</Text>
              </View>
              <View className="p-4">
                <Text className={`text-lg font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{e.title}</Text>
                <Text className={`text-sm mb-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{e.date} · {e.location}</Text>
                <View className="flex-row gap-3">
                  <TouchableOpacity className="flex-1 bg-blue-600 py-3 rounded-xl items-center">
                    <Text className="text-white font-semibold">Register</Text>
                  </TouchableOpacity>
                  <TouchableOpacity className={`px-4 py-3 rounded-xl items-center border border-slate-200 ${isDarkMode ? 'border-slate-600' : ''}`}>
                    <Text className={`font-semibold ${isDarkMode ? 'text-white' : 'text-slate-700'}`}>Find team</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Recent activity */}
        <View className="mt-8 px-6">
          <Text className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Recent activity</Text>
          
          <View className={`rounded-2xl border border-slate-100 overflow-hidden ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white shadow-sm'}`}>
            {activities.map((act, index) => (
              <View key={act.id} className={`flex-row p-4 items-center ${index > 0 ? 'border-t border-slate-100' : ''}`}>
                <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${act.color.split(' ')[0]}`}>
                  <Text className={`font-semibold ${act.color.split(' ')[1]}`}>{act.initials}</Text>
                </View>
                <View className="flex-1">
                  <Text className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    <Text className={`font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{act.name}</Text> {act.action}
                  </Text>
                  <Text className="text-xs text-slate-400 mt-1">{act.time}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
