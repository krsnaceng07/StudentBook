import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error } = useAuthStore();
  const router = useRouter();

  const handleLogin = async () => {
    if (!email) return Alert.alert('Check your email!', 'Please enter your email to log in.');
    if (!password) return Alert.alert('Password missing', 'You strictly need a password to access your account.');
    
    const res = await login(email, password);
    if (!res.success) {
      Alert.alert('Login Failed', res.error || 'Please check your credentials and try again.');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0F172A]">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        className="flex-1 justify-center px-6"
      >
        <View className="items-center mb-10">
          {/* Placeholder Logo */}
          <View className="h-20 w-20 bg-[#3B82F6] rounded-2xl items-center justify-center mb-6">
            <Text className="text-white font-bold text-2xl">SS</Text>
          </View>
          <Text className="text-white text-3xl font-bold">Welcome Back</Text>
          <Text className="text-slate-400 mt-2 text-base">Sign in to continue to StudentSociety</Text>
        </View>

        <View className="space-y-4">
          {error && <Text className="text-red-400 text-center mb-4">{error}</Text>}
          
          <View className="bg-white/5 rounded-xl border border-white/10 px-4 py-3 mb-4">
            <Text className="text-slate-400 text-xs uppercase mb-1 font-semibold">Email</Text>
            <TextInput
              className="text-white text-base"
              placeholder="john@example.com"
              placeholderTextColor="#94A3B8"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View className="bg-white/5 rounded-xl border border-white/10 px-4 py-3 mb-2">
            <Text className="text-slate-400 text-xs uppercase mb-1 font-semibold">Password</Text>
            <TextInput
              className="text-white text-base"
              placeholder="••••••••"
              placeholderTextColor="#94A3B8"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <TouchableOpacity 
            onPress={() => router.push('/forgot-password')} 
            className="self-end mb-4"
          >
            <Text className="text-[#3B82F6] text-sm font-medium">Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={handleLogin} 
            disabled={isLoading}
            className="bg-[#3B82F6] rounded-xl py-4 mt-4 items-center"
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-lg">Login</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/signup')} className="mt-6">
            <Text className="text-slate-400 text-center text-base">
              Don't have an account? <Text className="text-[#3B82F6] font-bold">Sign up</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
