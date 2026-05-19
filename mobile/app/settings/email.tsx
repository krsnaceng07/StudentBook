import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { supabase } from '../../config/supabase';
import { useUIStore } from '../../store/uiStore';

export default function ChangeEmail() {
  const router = useRouter();
  const { isDarkMode } = useUIStore();
  const [newEmail, setNewEmail] = useState('');
  const [saving, setSaving] = useState(false);

  const C = {
    bg: isDarkMode ? '#0F172A' : '#F8FAFC',
    card: isDarkMode ? '#1E293B' : '#FFFFFF',
    border: isDarkMode ? '#334155' : '#E2E8F0',
    text: isDarkMode ? '#F8FAFC' : '#0F172A',
    muted: isDarkMode ? '#94A3B8' : '#64748B',
  };

  const handleUpdate = async () => {
    if (!newEmail.includes('@')) {
      Alert.alert('Error', 'Enter a valid email');
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ email: newEmail });
      if (error) throw error;
      Alert.alert('Success', 'Verification link sent to your new email.');
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
        <Text className="text-xl font-extrabold" style={{ color: C.text }}>Change Email</Text>
      </View>

      <View className="p-5 flex-1">
        <View className="mb-8">
          <Text className="text-xs font-bold mb-2" style={{ color: C.text }}>New Email Address</Text>
          <TextInput
            value={newEmail}
            onChangeText={setNewEmail}
            style={{ backgroundColor: C.card, borderColor: C.border, color: C.text }}
            className="border rounded-2xl px-4 py-3.5 font-semibold"
            placeholder="new@university.edu"
            placeholderTextColor={C.muted}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <Text className="text-xs mt-3 leading-5" style={{ color: C.muted }}>
            A confirmation link will be sent to this email address. You will need to verify it before the change takes effect.
          </Text>
        </View>

        <TouchableOpacity 
          onPress={handleUpdate}
          disabled={saving}
          className="py-4 rounded-2xl items-center justify-center bg-blue-600"
        >
          {saving ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-sm">Update Email</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
