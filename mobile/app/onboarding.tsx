import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useUIStore } from '../store/uiStore';

const GOALS = [
  {
    id: 'team',
    emoji: '🚀',
    title: 'Looking for a Team',
    description: 'I have an idea and need teammates',
  },
  {
    id: 'join',
    emoji: '🤝',
    title: 'Open to Join',
    description: 'I want to join an existing team',
  },
  {
    id: 'explore',
    emoji: '👀',
    title: 'Just Exploring',
    description: 'Browsing and learning',
  },
];

export default function Onboarding() {
  const router = useRouter();
  const { isDarkMode } = useUIStore();
  const [selectedGoal, setSelectedGoal] = useState('team');

  const handleContinue = () => {
    // Navigate to student main dashboard
    router.replace('/(student)' as any);
  };

  return (
    <SafeAreaView 
      className={`flex-1 ${isDarkMode ? 'bg-[#0F172A]' : 'bg-white'}`} 
      edges={['top', 'bottom']}
    >
      {/* Blue Top Progress Banner */}
      <View className="bg-[#2563EB] pt-8 pb-10 px-6 rounded-b-[32px]">
        {/* Horizontal Progress bar segments (1 of 4 filled) */}
        <View className="flex-row gap-2 mb-6">
          <View className="flex-1 h-1.5 rounded-full bg-white" />
          <View className="flex-1 h-1.5 rounded-full bg-white/30" />
          <View className="flex-1 h-1.5 rounded-full bg-white/30" />
          <View className="flex-1 h-1.5 rounded-full bg-white/30" />
        </View>
        <Text className="text-blue-100 text-xs font-bold uppercase tracking-wider mb-2">Step 1 of 4</Text>
        <Text className="text-white text-3xl font-extrabold tracking-tight">Your Goal</Text>
      </View>

      <ScrollView 
        className="flex-1 px-6 pt-8"
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-4 pb-10">
          {GOALS.map((goal) => {
            const isSelected = selectedGoal === goal.id;
            return (
              <TouchableOpacity
                key={goal.id}
                onPress={() => setSelectedGoal(goal.id)}
                activeOpacity={0.8}
                className={`p-6 rounded-3xl border-2 flex-row items-center gap-4 ${
                  isSelected 
                    ? isDarkMode 
                      ? 'border-[#3B82F6] bg-[#1E293B]' 
                      : 'border-[#2563EB] bg-[#EFF6FF]' 
                    : isDarkMode 
                      ? 'border-slate-800 bg-slate-900/50' 
                      : 'border-slate-100 bg-white shadow-sm'
                }`}
              >
                {/* Emoji section */}
                <View className={`w-12 h-12 rounded-2xl items-center justify-center ${
                  isSelected 
                    ? isDarkMode 
                      ? 'bg-blue-950/50' 
                      : 'bg-white shadow-sm'
                    : isDarkMode 
                      ? 'bg-slate-800' 
                      : 'bg-slate-50'
                }`}>
                  <Text className="text-2xl">{goal.emoji}</Text>
                </View>

                {/* Info Text */}
                <View className="flex-1">
                  <Text className={`text-base font-bold mb-0.5 ${
                    isDarkMode ? 'text-white' : 'text-slate-900'
                  }`}>
                    {goal.title}
                  </Text>
                  <Text className={`text-xs font-medium ${
                    isDarkMode ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    {goal.description}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Floating Bottom Button */}
      <View className={`px-6 py-6 border-t ${
        isDarkMode ? 'bg-[#0F172A] border-slate-800' : 'bg-white border-slate-50'
      }`}>
        <TouchableOpacity
          onPress={handleContinue}
          className="bg-[#2563EB] py-4.5 rounded-2xl items-center justify-center shadow-md active:bg-[#1D4ED8]"
        >
          <Text className="text-white text-base font-bold tracking-wide">Continue →</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
