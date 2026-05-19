import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { useUIStore } from '../../../store/uiStore';
import api from '../../../api/client';

export default function PrivacySettings() {
  const router = useRouter();
  const { isDarkMode } = useUIStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [prefs, setPrefs] = useState({
    privacy_show_online: true,
    privacy_show_availability: true,
    privacy_show_github: true,
    privacy_allow_requests: true,
    privacy_show_in_search: true,
    privacy_show_college: true,
  });

  const C = {
    bg: isDarkMode ? '#0F172A' : '#F8FAFC',
    card: isDarkMode ? '#1E293B' : '#FFFFFF',
    border: isDarkMode ? '#334155' : '#E2E8F0',
    text: isDarkMode ? '#F8FAFC' : '#0F172A',
    muted: isDarkMode ? '#94A3B8' : '#64748B',
    success: '#10B981'
  };

  useFocusEffect(
    useCallback(() => {
      const fetchProfile = async () => {
        try {
          const res = await api.get('/profile/me');
          if (res.data?.success && res.data.data?.profile) {
            const p = res.data.data.profile;
            setPrefs({
              privacy_show_online: p.privacy_show_online ?? true,
              privacy_show_availability: p.privacy_show_availability ?? true,
              privacy_show_github: p.privacy_show_github ?? true,
              privacy_allow_requests: p.privacy_allow_requests ?? true,
              privacy_show_in_search: p.privacy_show_in_search ?? true,
              privacy_show_college: p.privacy_show_college ?? true,
            });
          }
        } catch (error) {
          console.warn('Failed to fetch profile settings', error);
        } finally {
          setLoading(false);
        }
      };
      fetchProfile();
    }, [])
  );

  const toggle = async (k: keyof typeof prefs) => {
    const newVal = !prefs[k];
    setPrefs(p => ({ ...p, [k]: newVal }));
    setSaving(true);
    try {
      await api.put('/profile/update', { [k]: newVal });
    } catch (e) {
      console.error(e);
      setPrefs(p => ({ ...p, [k]: !newVal })); // Revert
    } finally {
      setTimeout(() => setSaving(false), 500); // UX delay
    }
  };

  const Row = ({ label, sub, k }: { label: string, sub?: string, k: keyof typeof prefs }) => (
    <View className="flex-row items-center justify-between p-4 border-b" style={{ borderColor: C.border }}>
      <View className="flex-1 pr-4">
        <Text className="text-sm font-semibold" style={{ color: C.text }}>{label}</Text>
        {sub && <Text className="text-[11px] mt-1" style={{ color: C.muted }}>{sub}</Text>}
      </View>
      <TouchableOpacity 
        onPress={() => toggle(k)}
        className={`w-12 h-7 rounded-full p-1 ${prefs[k] ? 'items-end' : 'items-start'}`}
        style={{ backgroundColor: prefs[k] ? C.success : C.border }}
      >
        <View className="w-5 h-5 rounded-full bg-white shadow-sm" />
      </TouchableOpacity>
    </View>
  );

  if (loading) return <View style={{ flex: 1, backgroundColor: C.bg, justifyContent: 'center' }}><ActivityIndicator color="#2563EB" /></View>;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={['top']}>
      <View className="px-5 py-4 flex-row items-center border-b" style={{ borderColor: C.border, backgroundColor: C.card }}>
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full items-center justify-center mr-3" style={{ backgroundColor: C.bg }}>
          <Ionicons name="arrow-back" size={20} color={C.text} />
        </TouchableOpacity>
        <View className="flex-1 flex-row items-center justify-between">
          <Text className="text-xl font-extrabold" style={{ color: C.text }}>Privacy & Safety</Text>
          {saving && <ActivityIndicator size="small" color="#2563EB" />}
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        
        <Text className="text-xs font-bold uppercase tracking-wider mb-3 ml-2" style={{ color: C.muted }}>Profile Visibility</Text>
        <View className="rounded-[24px] overflow-hidden mb-6" style={{ backgroundColor: C.card, borderWidth: 1, borderColor: C.border }}>
          <Row label="Show Online Status" sub="Others can see when you're active" k="privacy_show_online" />
          <Row label="Show Availability Badge" sub="Green dot on your profile card" k="privacy_show_availability" />
          <Row label="Show in Search Results" sub="Appear when others search for students" k="privacy_show_in_search" />
          <Row label="Show College Name" sub="Display your college on your card" k="privacy_show_college" />
        </View>

        <Text className="text-xs font-bold uppercase tracking-wider mb-3 ml-2" style={{ color: C.muted }}>Collaboration</Text>
        <View className="rounded-[24px] overflow-hidden mb-6" style={{ backgroundColor: C.card, borderWidth: 1, borderColor: C.border }}>
          <Row label="Allow Collaboration Requests" sub="Others can send you requests" k="privacy_allow_requests" />
          <Row label="Show GitHub Profile" sub="Display your GitHub link publicly" k="privacy_show_github" />
        </View>

        <Text className="text-xs font-bold uppercase tracking-wider mb-3 ml-2" style={{ color: C.muted }}>Blocked Users</Text>
        <View className="rounded-[24px] overflow-hidden p-6 items-center justify-center mb-6" style={{ backgroundColor: C.card, borderWidth: 1, borderColor: C.border }}>
          <Text className="text-3xl mb-2">🚫</Text>
          <Text className="text-xs" style={{ color: C.muted }}>No blocked users</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
