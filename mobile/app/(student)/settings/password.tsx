import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { supabase } from '../../../config/supabase';
import { useUIStore } from '../../../store/uiStore';

export default function ChangePassword() {
  const router = useRouter();
  const { isDarkMode } = useUIStore();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [show1, setShow1] = useState(false);
  const [show2, setShow2] = useState(false);

  const C = {
    bg: isDarkMode ? '#0F172A' : '#F8FAFC',
    card: isDarkMode ? '#1E293B' : '#FFFFFF',
    border: isDarkMode ? '#334155' : '#E2E8F0',
    text: isDarkMode ? '#F8FAFC' : '#0F172A',
    muted: isDarkMode ? '#94A3B8' : '#64748B',
  };

  const handleUpdate = async () => {
    if (!newPassword || newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      Alert.alert('Success', 'Password updated successfully');
      router.back();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={['top']}>
      <View className="px-5 py-4 flex-row items-center border-b" style={{ borderColor: C.border, backgroundColor: C.card }}>
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full items-center justify-center mr-3" style={{ backgroundColor: C.bg }}>
          <Ionicons name="arrow-back" size={20} color={C.text} />
        </TouchableOpacity>
        <Text className="text-xl font-extrabold" style={{ color: C.text }}>Change Password</Text>
      </View>

      <View className="p-5 flex-1">
        <View className="mb-5">
          <Text className="text-xs font-bold mb-2" style={{ color: C.text }}>New Password</Text>
          <View className="relative">
            <TextInput
              secureTextEntry={!show1}
              value={newPassword}
              onChangeText={setNewPassword}
              style={{ backgroundColor: C.card, borderColor: C.border, color: C.text }}
              className="border rounded-2xl px-4 py-3.5 pr-12 font-semibold"
              placeholder="Min 6 characters"
              placeholderTextColor={C.muted}
            />
            <TouchableOpacity onPress={() => setShow1(!show1)} className="absolute right-4 top-3.5">
              <Ionicons name={show1 ? "eye-off" : "eye"} size={20} color={C.muted} />
            </TouchableOpacity>
          </View>
        </View>

        <View className="mb-8">
          <Text className="text-xs font-bold mb-2" style={{ color: C.text }}>Confirm Password</Text>
          <View className="relative">
            <TextInput
              secureTextEntry={!show2}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              style={{ backgroundColor: C.card, borderColor: C.border, color: C.text }}
              className="border rounded-2xl px-4 py-3.5 pr-12 font-semibold"
              placeholder="Repeat new password"
              placeholderTextColor={C.muted}
            />
            <TouchableOpacity onPress={() => setShow2(!show2)} className="absolute right-4 top-3.5">
              <Ionicons name={show2 ? "eye-off" : "eye"} size={20} color={C.muted} />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity 
          onPress={handleUpdate}
          disabled={saving}
          className="py-4 rounded-2xl items-center justify-center bg-blue-600"
        >
          {saving ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-sm">Update Password</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
