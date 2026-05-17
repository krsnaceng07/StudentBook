import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useUIStore } from '../../store/uiStore';

export default function ManageEvents() {
  const router = useRouter();
  const { isDarkMode } = useUIStore();

  return (
    <SafeAreaView 
      className={`flex-1 ${isDarkMode ? 'bg-[#0F172A]' : 'bg-[#F8FAFC]'}`}
      edges={['top']}
    >
      {/* Top Header */}
      <View className="px-6 py-4">
        <Text className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>My Events</Text>
      </View>

      <ScrollView 
        className="flex-1 px-6"
        showsVerticalScrollIndicator={false}
      >
        {/* + Post New Event Button */}
        <TouchableOpacity 
          onPress={() => router.push('/college/post-event')}
          className="bg-[#10B981] py-4 rounded-2xl items-center justify-center mb-6 shadow-sm active:bg-emerald-600"
        >
          <Text className="text-white text-sm font-bold tracking-wide">+ Post New Event</Text>
        </TouchableOpacity>

        {/* Event List */}
        <View className="gap-4 mb-10">
          {/* Event 1 */}
          <View className={`rounded-3xl border p-5 border-l-4 border-l-[#2563EB] ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'
          }`}>
            <View className="flex-row justify-between items-start mb-1.5">
              <Text className={`text-sm font-extrabold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                HackTU 2026
              </Text>
              <View className={`px-2.5 py-0.5 rounded-full ${
                isDarkMode ? 'bg-blue-950' : 'bg-blue-50'
              }`}>
                <Text className={`text-[9px] font-bold ${
                  isDarkMode ? 'text-blue-400' : 'text-blue-600'
                }`}>Hackathon</Text>
              </View>
            </View>

            <Text className={`text-[10px] font-semibold mb-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              6/15/2026
            </Text>

            {/* Action Buttons Row */}
            <View className="flex-row gap-2">
              <TouchableOpacity className="px-5 py-2 rounded-xl border border-[#10B981]">
                <Text className="text-[#10B981] text-xs font-bold">Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity className="px-5 py-2 rounded-xl border border-[#EF4444] bg-red-500/5">
                <Text className="text-[#EF4444] text-xs font-bold">Delete</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Event 2 */}
          <View className={`rounded-3xl border p-5 border-l-4 border-l-[#8B5CF6] ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'
          }`}>
            <View className="flex-row justify-between items-start mb-1.5">
              <Text className={`text-sm font-extrabold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                AI Innovation Summit
              </Text>
              <View className={`px-2.5 py-0.5 rounded-full ${
                isDarkMode ? 'bg-purple-950' : 'bg-purple-50'
              }`}>
                <Text className={`text-[9px] font-bold ${
                  isDarkMode ? 'text-purple-400' : 'text-purple-600'
                }`}>Seminar</Text>
              </View>
            </View>

            <Text className={`text-[10px] font-semibold mb-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              7/10/2026
            </Text>

            {/* Action Buttons Row */}
            <View className="flex-row gap-2">
              <TouchableOpacity className="px-5 py-2 rounded-xl border border-[#10B981]">
                <Text className="text-[#10B981] text-xs font-bold">Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity className="px-5 py-2 rounded-xl border border-[#EF4444] bg-red-500/5">
                <Text className="text-[#EF4444] text-xs font-bold">Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
