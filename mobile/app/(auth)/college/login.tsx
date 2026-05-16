import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../../store/authStore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUIStore } from '../../../store/uiStore';

export default function CollegeLoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error } = useAuthStore();
  const { isDarkMode } = useUIStore();
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) return Alert.alert('Missing Fields', 'Please enter your admin credentials.');
    
    const res = await login(email, password);
    if (res.success) {
      // Navigation is handled by RootLayout
    } else {
      Alert.alert('Login Failed', res.error || 'Check your credentials and try again.');
    }
  };

  return (
    <SafeAreaView className={`flex-1 ${isDarkMode ? 'bg-[#0F172A]' : 'bg-white'}`}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24 }}>
          <View className="items-center mb-10">
            <View className="h-20 w-20 bg-indigo-600 rounded-2xl items-center justify-center mb-6 shadow-lg shadow-indigo-600/20">
              <Text className="text-white font-bold text-3xl">🏫</Text>
            </View>
            <Text className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>College Login</Text>
            <Text className={`mt-2 text-base ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Manage your institution's portal</Text>
          </View>

          <View className="space-y-4">
            {error && <Text className="text-red-400 text-center mb-4">{error}</Text>}
            
            <View className={`rounded-xl border px-4 py-3 mb-4 ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
              <Text className={`text-xs uppercase mb-1 font-semibold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Admin Email</Text>
              <TextInput
                className={`text-base ${isDarkMode ? 'text-white' : 'text-slate-900'}`}
                placeholder="admin@institute.edu"
                placeholderTextColor={isDarkMode ? '#94A3B8' : '#64748B'}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View className={`rounded-xl border px-4 py-3 mb-4 ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
              <Text className={`text-xs uppercase mb-1 font-semibold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Password</Text>
              <TextInput
                className={`text-base ${isDarkMode ? 'text-white' : 'text-slate-900'}`}
                placeholder="••••••••"
                placeholderTextColor={isDarkMode ? '#94A3B8' : '#64748B'}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <TouchableOpacity onPress={handleLogin} disabled={isLoading} className="bg-indigo-600 rounded-xl py-4 mt-6 items-center shadow-lg shadow-indigo-600/30">
              {isLoading ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-lg">Login</Text>}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push('/(auth)/college/signup')} className="mt-6">
              <Text className={`text-center text-base ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                New institution? <Text className="text-indigo-500 font-bold">Register</Text>
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.replace('/welcome')} className="mt-8">
              <Text className={`text-center text-sm font-medium ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                ← Not a college? Change role
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
