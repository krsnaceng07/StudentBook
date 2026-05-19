import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { useUIStore } from '../../../store/uiStore';
import api from '../../../api/client';

export default function AppearanceSettings() {
  const router = useRouter();
  const { isDarkMode, toggleDarkMode } = useUIStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [prefs, setPrefs] = useState({
    appearance_theme: 'system',
    appearance_accent: '#2563EB',
    appearance_font_size: 'medium',
  });

  const ACCENTS = ["#2563EB","#7C3AED","#059669","#DB2777","#D97706","#0891B2","#DC2626","#0F172A"];

  const C = {
    bg: isDarkMode ? '#0F172A' : '#F8FAFC',
    card: isDarkMode ? '#1E293B' : '#FFFFFF',
    border: isDarkMode ? '#334155' : '#E2E8F0',
    text: isDarkMode ? '#F8FAFC' : '#0F172A',
    muted: isDarkMode ? '#94A3B8' : '#64748B',
  };

  useFocusEffect(
    useCallback(() => {
      const fetchProfile = async () => {
        try {
          const res = await api.get('/profile/me');
          if (res.data?.success && res.data.data?.profile) {
            const p = res.data.data.profile;
            setPrefs({
              appearance_theme: p.appearance_theme ?? 'system',
              appearance_accent: p.appearance_accent ?? '#2563EB',
              appearance_font_size: p.appearance_font_size ?? 'medium',
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

  const save = async (key: keyof typeof prefs, val: string) => {
    setPrefs(p => ({ ...p, [key]: val }));
    setSaving(true);
    try {
      await api.put('/profile/update', { [key]: val });
    } catch (e) {
      console.error(e);
    } finally {
      setTimeout(() => setSaving(false), 500); // UX delay
    }
  };

  if (loading) return <View style={{ flex: 1, backgroundColor: C.bg, justifyContent: 'center' }}><ActivityIndicator color="#2563EB" /></View>;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={['top']}>
      <View className="px-5 py-4 flex-row items-center border-b" style={{ borderColor: C.border, backgroundColor: C.card }}>
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full items-center justify-center mr-3" style={{ backgroundColor: C.bg }}>
          <Ionicons name="arrow-back" size={20} color={C.text} />
        </TouchableOpacity>
        <View className="flex-1 flex-row items-center justify-between">
          <Text className="text-xl font-extrabold" style={{ color: C.text }}>Appearance</Text>
          {saving && <ActivityIndicator size="small" color="#2563EB" />}
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        
        <Text className="text-xs font-bold uppercase tracking-wider mb-3 ml-2" style={{ color: C.muted }}>App Mode</Text>
        <View className={`rounded-[24px] border overflow-hidden mb-6 ${
          isDarkMode ? 'bg-slate-900 border-slate-850' : 'bg-white border-slate-100 shadow-sm'
        }`}>
          <View className="flex-row items-center justify-between p-5">
            <View className="flex-row items-center gap-3.5">
              <View className="w-9 h-9 rounded-2xl bg-orange-50 items-center justify-center">
                <Ionicons name="moon" size={16} color="#EA580C" />
              </View>
              <Text className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>Dark Mode</Text>
            </View>
            <TouchableOpacity 
              onPress={() => toggleDarkMode()}
              className={`w-12 h-7 rounded-full p-1 ${isDarkMode ? 'bg-blue-600 items-end' : 'bg-slate-300 items-start'}`}
            >
              <View className="w-5 h-5 rounded-full bg-white shadow-sm" />
            </TouchableOpacity>
          </View>
        </View>

        <Text className="text-xs font-bold uppercase tracking-wider mb-3 ml-2" style={{ color: C.muted }}>Accent Color</Text>
        <View className="rounded-[24px] p-5 mb-6" style={{ backgroundColor: C.card, borderWidth: 1, borderColor: C.border }}>
          <View className="flex-row flex-wrap justify-center gap-3">
            {ACCENTS.map(col => (
              <TouchableOpacity
                key={col}
                onPress={() => save('appearance_accent', col)}
                className="w-11 h-11 rounded-xl items-center justify-center"
                style={{ backgroundColor: col, borderWidth: 3, borderColor: prefs.appearance_accent === col ? (isDarkMode?'#fff':'#000') : 'transparent' }}
              >
                {prefs.appearance_accent === col && <Ionicons name="checkmark" size={18} color="#fff" />}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Text className="text-xs font-bold uppercase tracking-wider mb-3 ml-2" style={{ color: C.muted }}>Preview</Text>
        <View className="rounded-[24px] p-5 mb-6" style={{ backgroundColor: C.card, borderWidth: 2, borderColor: `${prefs.appearance_accent}44` }}>
          <View className="flex-row items-center gap-4 mb-4">
            <View className="w-12 h-12 rounded-full items-center justify-center border-2" style={{ backgroundColor: `${prefs.appearance_accent}15`, borderColor: `${prefs.appearance_accent}44` }}>
              <Text className="text-sm font-black" style={{ color: prefs.appearance_accent }}>AS</Text>
            </View>
            <View>
              <Text className="text-base font-bold" style={{ color: C.text }}>Aarav Sharma</Text>
              <Text className="text-xs" style={{ color: C.muted }}>Computer Science · 3rd Year</Text>
            </View>
          </View>
          <View className="self-start rounded-xl px-3 py-1.5" style={{ backgroundColor: `${prefs.appearance_accent}15` }}>
            <Text className="text-xs font-bold" style={{ color: prefs.appearance_accent }}>🚀 Looking for Team</Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
