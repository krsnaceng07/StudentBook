import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { useUIStore } from '../../store/uiStore';
import api from '../../api/client';

export default function NotificationSettings() {
  const router = useRouter();
  const { isDarkMode } = useUIStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [prefs, setPrefs] = useState({
    notif_collab_requests: true,
    notif_request_accepted: true,
    notif_new_messages: true,
    notif_event_reminders: true,
    notif_new_events: false,
    notif_weekly_digest: false,
    notif_email_collab: false,
    notif_email_messages: false,
    notif_email_events: true,
    notif_email_digest: true,
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
              notif_collab_requests: p.notif_collab_requests ?? true,
              notif_request_accepted: p.notif_request_accepted ?? true,
              notif_new_messages: p.notif_new_messages ?? true,
              notif_event_reminders: p.notif_event_reminders ?? true,
              notif_new_events: p.notif_new_events ?? false,
              notif_weekly_digest: p.notif_weekly_digest ?? false,
              notif_email_collab: p.notif_email_collab ?? false,
              notif_email_messages: p.notif_email_messages ?? false,
              notif_email_events: p.notif_email_events ?? true,
              notif_email_digest: p.notif_email_digest ?? true,
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
      setTimeout(() => setSaving(false), 500); // small delay for UX
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
          <Text className="text-xl font-extrabold" style={{ color: C.text }}>Notifications</Text>
          {saving && <ActivityIndicator size="small" color="#2563EB" />}
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        
        <Text className="text-xs font-bold uppercase tracking-wider mb-2 ml-2" style={{ color: C.muted }}>Push Notifications</Text>
        <Text className="text-[11px] mb-4 ml-2" style={{ color: C.muted }}>Delivered to your device directly</Text>
        <View className="rounded-[24px] overflow-hidden mb-6" style={{ backgroundColor: C.card, borderWidth: 1, borderColor: C.border }}>
          <Row label="Collaboration Requests" sub="When someone sends you a request" k="notif_collab_requests" />
          <Row label="Request Accepted" sub="When your request is accepted" k="notif_request_accepted" />
          <Row label="New Messages" sub="When you receive a chat message" k="notif_new_messages" />
          <Row label="Event Reminders" sub="Reminders before event deadlines" k="notif_event_reminders" />
          <Row label="New Events" sub="When new events match your interests" k="notif_new_events" />
          <Row label="Weekly Digest" sub="Summary of activity every Monday" k="notif_weekly_digest" />
        </View>

        <Text className="text-xs font-bold uppercase tracking-wider mb-2 ml-2" style={{ color: C.muted }}>Email Notifications</Text>
        <Text className="text-[11px] mb-4 ml-2" style={{ color: C.muted }}>Sent to your registered email</Text>
        <View className="rounded-[24px] overflow-hidden mb-6" style={{ backgroundColor: C.card, borderWidth: 1, borderColor: C.border }}>
          <Row label="Collaboration Requests" k="notif_email_collab" />
          <Row label="Messages Summary" k="notif_email_messages" />
          <Row label="Event Reminders" k="notif_email_events" />
          <Row label="Weekly Digest" k="notif_email_digest" />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
