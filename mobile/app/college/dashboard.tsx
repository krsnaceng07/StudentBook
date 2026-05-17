import React from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUIStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';

export default function CollegeDashboard() {
  const { isDarkMode } = useUIStore();
  const { user } = useAuthStore();

  const universityName = user?.full_name || 'Tribhuvan University';

  return (
    <SafeAreaView 
      className={`flex-1 ${isDarkMode ? 'bg-[#0F172A]' : 'bg-[#F8FAFC]'}`}
      edges={['top']}
    >
      {/* Top green header banner */}
      <View className="bg-[#10B981] px-6 pt-8 pb-10 rounded-b-[36px]">
        <Text className="text-white text-xl font-bold tracking-tight mb-6">Dashboard</Text>

        <View className="flex-row items-center gap-4">
          {/* Logo badge */}
          <View className="w-14 h-14 rounded-2xl bg-white/20 border border-white/25 items-center justify-center">
            <Text className="text-white text-lg font-black tracking-widest">TU</Text>
          </View>

          <View>
            <Text className="text-white text-2xl font-black mb-0.5">{universityName}</Text>
            <Text className="text-emerald-100 text-xs font-semibold uppercase tracking-wider">College Dashboard</Text>
          </View>
        </View>
      </View>

      <ScrollView 
        className="flex-1 px-6 -mt-6"
        showsVerticalScrollIndicator={false}
      >
        {/* 2x2 grid stats */}
        <View className="flex-row flex-wrap justify-between gap-3 mb-6">
          {/* Card 1: Total Events */}
          <View className={`w-[48%] rounded-3xl p-5 border ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100/80 shadow-sm'
          }`}>
            <Text className="text-xl mb-2">📅</Text>
            <Text className={`text-[22px] font-black mb-0.5 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>2</Text>
            <Text className={`text-[10px] font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Total Events</Text>
          </View>

          {/* Card 2: Active Events */}
          <View className={`w-[48%] rounded-3xl p-5 border ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100/80 shadow-sm'
          }`}>
            <Text className="text-xl mb-2">🟢</Text>
            <Text className={`text-[22px] font-black mb-0.5 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>2</Text>
            <Text className={`text-[10px] font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Active Events</Text>
          </View>

          {/* Card 3: Total Reach */}
          <View className={`w-[48%] rounded-3xl p-5 border ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100/80 shadow-sm'
          }`}>
            <Text className="text-xl mb-2">👥</Text>
            <Text className={`text-[22px] font-black mb-0.5 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>240+</Text>
            <Text className={`text-[10px] font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Total Reach</Text>
          </View>

          {/* Card 4: Registrations */}
          <View className={`w-[48%] rounded-3xl p-5 border ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100/80 shadow-sm'
          }`}>
            <Text className="text-xl mb-2">✅</Text>
            <Text className={`text-[22px] font-black mb-0.5 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>87</Text>
            <Text className={`text-[10px] font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Registrations</Text>
          </View>
        </View>

        {/* Recent Activity */}
        <Text className={`text-sm font-extrabold mb-3.5 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          Recent Activity
        </Text>

        <View className="gap-3 mb-10">
          {/* Activity Item 1 */}
          <View className={`rounded-3xl border p-5 flex-row items-center border-l-4 border-l-[#2563EB] ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'
          }`}>
            <View className="flex-1">
              <Text className={`text-sm font-extrabold mb-1.5 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                HackTU 2026
              </Text>
              <View className="flex-row items-center gap-2">
                <Text className={`text-[10px] font-semibold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  6/15/2026
                </Text>
                <Text className="text-slate-300 text-xs">•</Text>
                <View className={`px-2.5 py-0.5 rounded-full ${
                  isDarkMode ? 'bg-blue-950' : 'bg-blue-50'
                }`}>
                  <Text className={`text-[9px] font-bold ${
                    isDarkMode ? 'text-blue-400' : 'text-blue-600'
                  }`}>Hackathon</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Activity Item 2 */}
          <View className={`rounded-3xl border p-5 flex-row items-center border-l-4 border-l-[#8B5CF6] ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'
          }`}>
            <View className="flex-1">
              <Text className={`text-sm font-extrabold mb-1.5 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                AI Innovation Summit
              </Text>
              <View className="flex-row items-center gap-2">
                <Text className={`text-[10px] font-semibold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  7/10/2026
                </Text>
                <Text className="text-slate-300 text-xs">•</Text>
                <View className={`px-2.5 py-0.5 rounded-full ${
                  isDarkMode ? 'bg-purple-950' : 'bg-purple-50'
                }`}>
                  <Text className={`text-[9px] font-bold ${
                    isDarkMode ? 'text-purple-400' : 'text-purple-600'
                  }`}>Seminar</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
