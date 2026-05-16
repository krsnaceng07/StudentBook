import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

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
            className="bg-[#3B82F6] rounded-xl py-4 mt-4 items-center shadow-lg shadow-blue-500/30"
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-lg">Login</Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View className="flex-row items-center my-6">
            <View className="flex-1 h-[1px] bg-white/10" />
            <Text className="text-slate-500 mx-4 text-sm font-medium">OR CONTINUE WITH</Text>
            <View className="flex-1 h-[1px] bg-white/10" />
          </View>

          {/* Social Buttons */}
          <View className="flex-row gap-4">
            <TouchableOpacity 
              onPress={() => Alert.alert('Coming Soon', 'Google sign in via Supabase is coming soon.')}
              disabled={isLoading}
              className="flex-1 flex-row bg-white/5 border border-white/10 rounded-xl py-4 items-center justify-center"
            >
              <Ionicons name="logo-google" size={20} color="white" />
              <Text className="text-white font-semibold ml-2">Google</Text>
            </TouchableOpacity>

            {Platform.OS === 'ios' && (
              <TouchableOpacity 
                onPress={() => Alert.alert('Coming Soon', 'Apple sign in via Supabase is coming soon.')}
                disabled={isLoading}
                className="flex-1 flex-row bg-white/5 border border-white/10 rounded-xl py-4 items-center justify-center"
              >
                <Ionicons name="logo-apple" size={22} color="white" />
                <Text className="text-white font-semibold ml-2">Apple</Text>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity onPress={() => router.push('/signup')} className="mt-8">
            <Text className="text-slate-400 text-center text-base">
              Don't have an account? <Text className="text-[#3B82F6] font-bold">Sign up</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
