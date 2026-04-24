import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { register, isLoading, error } = useAuthStore();
  const router = useRouter();

  const handleSignup = async () => {
    if (!name) return Alert.alert('Wait a minute!', 'Please enter your full name so others can recognize you.');
    if (!username) return Alert.alert('Missing Username', 'Give yourself a unique nickname to get started!');
    if (!email) return Alert.alert('Email Required', "We'll need your email to keep your account safe.");
    if (!password) return Alert.alert('No Password?', 'Protect your account with a secure password!');
    
    const res = await register(name, username, email, password);
    if (res.success) {
      Alert.alert(
        'Success!', 
        'Your account has been created. Please login with your credentials.',
        [{ text: 'OK', onPress: () => router.replace('/login') }]
      );
    } else {
      Alert.alert('Registration Issue', res.error || 'Something went wrong while creating your account.');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0F172A]">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24 }}>
          <View className="items-center mb-10">
            {/* Placeholder Logo */}
            <View className="h-20 w-20 bg-[#3B82F6] rounded-2xl items-center justify-center mb-6">
              <Text className="text-white font-bold text-2xl">SS</Text>
            </View>
            <Text className="text-white text-3xl font-bold">Create Account</Text>
            <Text className="text-slate-400 mt-2 text-base">Join the StudentSociety platform</Text>
          </View>

          <View className="space-y-4">
            {error && <Text className="text-red-400 text-center mb-4">{error}</Text>}
            
            <View className="bg-white/5 rounded-xl border border-white/10 px-4 py-3 mb-4">
              <Text className="text-slate-400 text-xs uppercase mb-1 font-semibold">Full Name</Text>
              <TextInput
                className="text-white text-base"
                placeholder="John Doe"
                placeholderTextColor="#94A3B8"
                value={name}
                onChangeText={setName}
              />
            </View>

            <View className="bg-white/5 rounded-xl border border-white/10 px-4 py-3 mb-4">
              <Text className="text-slate-400 text-xs uppercase mb-1 font-semibold">Username</Text>
              <TextInput
                className="text-white text-base"
                placeholder="johndoe123"
                placeholderTextColor="#94A3B8"
                autoCapitalize="none"
                value={username}
                onChangeText={(val) => setUsername(val.replace(/[^a-z0-9_]/gi, '').toLowerCase())}
              />
            </View>

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

            <View className="bg-white/5 rounded-xl border border-white/10 px-4 py-3 mb-4">
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
              onPress={handleSignup} 
              disabled={isLoading}
              className="bg-[#3B82F6] rounded-xl py-4 mt-6 items-center"
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-bold text-lg">Sign Up</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.back()} className="mt-6 mb-10">
              <Text className="text-slate-400 text-center text-base">
                Already have an account? <Text className="text-[#3B82F6] font-bold">Login</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
