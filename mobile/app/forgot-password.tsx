import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store/authStore';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const { forgotPassword, isLoading } = useAuthStore();
  const router = useRouter();

  const handleRequest = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    const result = await forgotPassword(email);
    if (result.success) {
      Alert.alert(
        'Email Sent',
        result.message || 'Check your email for reset instructions.',
        [{ text: 'OK', onPress: () => router.push({ pathname: '/reset-password', params: { email } }) }]
      );
    } else {
      Alert.alert('Error', result.error || 'Failed to send reset link');
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

          <View className="mb-10">
            <Text className="text-white text-4xl font-bold mb-4">Forgot Password?</Text>
            <Text className="text-slate-400 text-lg leading-6">
              Don't worry! It happens. Please enter the email associated with your account.
            </Text>
          </View>

          <View className="space-y-6">
            <View>
              <Text className="text-slate-400 font-bold mb-3 ml-1 uppercase tracking-widest text-[10px]">Email Address</Text>
              <View className="flex-row items-center bg-white/5 rounded-2xl border border-white/10 px-4 py-4">
                <Ionicons name="mail-outline" size={20} color="#3B82F6" className="mr-3" />
                <TextInput
                  placeholder="Enter your email"
                  placeholderTextColor="#64748b"
                  className="flex-1 text-white text-base ml-2"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>

            <TouchableOpacity 
              onPress={handleRequest}
              disabled={isLoading}
              className="bg-[#3B82F6] p-5 rounded-2xl items-center shadow-lg shadow-[#3B82F6]/20 mt-4"
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-bold text-lg">Send Reset Link</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => router.push('/reset-password')}
              className="items-center py-4"
            >
              <Text className="text-slate-500 font-medium">Already have a token? <Text className="text-[#3B82F6]">Reset here</Text></Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
