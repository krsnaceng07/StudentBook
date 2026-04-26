import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store/authStore';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ResetPasswordScreen() {
  const { email: initialEmail } = useLocalSearchParams();
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const { resetPassword, isLoading } = useAuthStore();
  const router = useRouter();

  const handleReset = async () => {
    if (!token || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    const result = await resetPassword(token, password);
    if (result.success) {
      Alert.alert(
        'Success',
        'Password reset successful. You can now log in with your new password.',
        [{ text: 'Login Now', onPress: () => router.replace('/') }]
      );
    } else {
      Alert.alert('Error', result.error || 'Failed to reset password');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0F172A]">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-6 pt-10">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="h-12 w-12 bg-white/5 rounded-2xl items-center justify-center border border-white/10 mb-8"
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>

          <View className="mb-8">
            <Text className="text-white text-4xl font-bold mb-4">Verify OTP</Text>
            <Text className="text-slate-400 text-lg leading-6">
              Enter the 6-digit code sent to your email and set your new secure password.
            </Text>
          </View>

          <View className="space-y-6">
            {/* Token Input */}
            <View>
              <Text className="text-slate-400 font-bold mb-3 ml-1 uppercase tracking-widest text-[10px]">6-Digit OTP Code</Text>
              <View className="flex-row items-center bg-white/5 rounded-2xl border border-white/10 px-4 py-4">
                <Ionicons name="keypad-outline" size={20} color="#3B82F6" />
                <TextInput
                  placeholder="e.g. 123456"
                  placeholderTextColor="#64748b"
                  className="flex-1 text-white text-2xl font-bold ml-3 tracking-[10px]"
                  value={token}
                  onChangeText={(text) => setToken(text.replace(/[^0-9]/g, '').slice(0, 6))}
                  keyboardType="number-pad"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* New Password */}
            <View>
              <Text className="text-slate-400 font-bold mb-3 ml-1 uppercase tracking-widest text-[10px]">New Password</Text>
              <View className="flex-row items-center bg-white/5 rounded-2xl border border-white/10 px-4 py-4">
                <Ionicons name="lock-closed-outline" size={20} color="#10B981" />
                <TextInput
                  placeholder="At least 6 characters"
                  placeholderTextColor="#64748b"
                  className="flex-1 text-white text-base ml-2"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>
            </View>

            {/* Confirm Password */}
            <View>
              <Text className="text-slate-400 font-bold mb-3 ml-1 uppercase tracking-widest text-[10px]">Confirm Password</Text>
              <View className="flex-row items-center bg-white/5 rounded-2xl border border-white/10 px-4 py-4">
                <Ionicons name="checkmark-circle-outline" size={20} color="#10B981" />
                <TextInput
                  placeholder="Repeat new password"
                  placeholderTextColor="#64748b"
                  className="flex-1 text-white text-base ml-2"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                />
              </View>
            </View>

            <TouchableOpacity 
              onPress={handleReset}
              disabled={isLoading}
              className="bg-[#10B981] p-5 rounded-2xl items-center shadow-lg shadow-[#10B981]/20 mt-4"
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-bold text-lg">Update Password</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
