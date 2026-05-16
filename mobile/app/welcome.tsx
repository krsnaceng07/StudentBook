import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useUIStore } from '../store/uiStore';
import { LinearGradient } from 'expo-linear-gradient';

export default function WelcomeScreen() {
  const router = useRouter();
  const { isDarkMode } = useUIStore();

  const handleRoleSelection = (role: 'student' | 'college') => {
    // We can pass the role as a param or use it to direct to different signup flows
    if (role === 'student') {
      router.push('/(auth)/student/login');
    } else {
      router.push('/(auth)/college/login');
    }
  };

  return (
    <View className={`flex-1 ${isDarkMode ? 'bg-[#0F172A]' : 'bg-white'}`}>
      <LinearGradient
        colors={isDarkMode ? ['#1E293B', '#0F172A'] : ['#F8FAFC', '#FFFFFF']}
        className="flex-1 px-8 pt-20 pb-12 justify-between"
      >
        <View className="items-center">
          <View className="w-24 h-24 bg-blue-500 rounded-3xl items-center justify-center shadow-xl shadow-blue-500/20 mb-8">
            <Text className="text-white text-4xl font-bold italic">CS</Text>
          </View>
          <Text className={`text-4xl font-bold text-center mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            CollabSpace
          </Text>
          <Text className={`text-lg text-center px-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Connecting the next generation of builders and educators.
          </Text>
        </View>

        <View className="space-y-6">
          <Text className={`text-sm font-semibold uppercase tracking-widest text-center mb-4 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
            Choose your world
          </Text>
          
          <TouchableOpacity 
            onPress={() => handleRoleSelection('student')}
            className="bg-blue-600 h-16 rounded-2xl items-center justify-center shadow-lg shadow-blue-600/30 mb-4"
          >
            <Text className="text-white text-lg font-bold">🎓 I am a Student</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => handleRoleSelection('college')}
            className={`h-16 rounded-2xl items-center justify-center border-2 ${isDarkMode ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-slate-50'}`}
          >
            <Text className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              🏫 I am a College
            </Text>
          </TouchableOpacity>
        </View>

        <View className="items-center">
          <Text className={`text-sm ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
            By continuing, you agree to our Terms of Service.
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
}
