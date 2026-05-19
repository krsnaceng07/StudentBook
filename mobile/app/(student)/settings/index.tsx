import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../../store/authStore';
import { useUIStore } from '../../../store/uiStore';

export default function SettingsIndex() {
  const router = useRouter();
  const { logout } = useAuthStore();
  const { isDarkMode } = useUIStore();

  const C = {
    bg: isDarkMode ? '#0F172A' : '#F8FAFC',
    card: isDarkMode ? '#1E293B' : '#FFFFFF',
    border: isDarkMode ? '#334155' : '#E2E8F0',
    text: isDarkMode ? '#F8FAFC' : '#0F172A',
    muted: isDarkMode ? '#94A3B8' : '#64748B',
  };

  const Row = ({ icon, title, sub, color, route }: { icon: any, title: string, sub?: string, color: string, route: any }) => (
    <TouchableOpacity 
      onPress={() => router.push(route)}
      className="flex-row items-center justify-between p-4 border-b"
      style={{ borderColor: C.border }}
    >
      <View className="flex-row items-center gap-3">
        <View className="w-10 h-10 rounded-2xl items-center justify-center" style={{ backgroundColor: `${color}15` }}>
          <Ionicons name={icon} size={20} color={color} />
        </View>
        <View>
          <Text className="text-sm font-bold" style={{ color: C.text }}>{title}</Text>
          {sub && <Text className="text-[11px] mt-0.5" style={{ color: C.muted }}>{sub}</Text>}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={18} color={C.muted} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={['top']}>
      {/* Top Header */}
      <View className="px-5 py-4 flex-row items-center border-b" style={{ borderColor: C.border, backgroundColor: C.card }}>
        <TouchableOpacity 
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full items-center justify-center mr-3"
          style={{ backgroundColor: C.bg }}
        >
          <Ionicons name="arrow-back" size={20} color={C.text} />
        </TouchableOpacity>
        <Text className="text-xl font-extrabold" style={{ color: C.text }}>Settings</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        
        <Text className="text-xs font-bold uppercase tracking-wider mb-3 ml-2" style={{ color: C.muted }}>Account</Text>
        <View className="rounded-[24px] overflow-hidden mb-6" style={{ backgroundColor: C.card, borderWidth: 1, borderColor: C.border }}>
          <Row icon="person" title="Edit Profile" sub="Update your details, skills & goals" color="#7C3AED" route="/(student)/edit-profile" />
          <Row icon="lock-closed" title="Change Password" color="#D97706" route="/(student)/settings/password" />
          <Row icon="mail" title="Change Email Address" color="#2563EB" route="/(student)/settings/email" />
        </View>

        <Text className="text-xs font-bold uppercase tracking-wider mb-3 ml-2" style={{ color: C.muted }}>Preferences</Text>
        <View className="rounded-[24px] overflow-hidden mb-6" style={{ backgroundColor: C.card, borderWidth: 1, borderColor: C.border }}>
          <Row icon="notifications" title="Notifications" sub="Push & Email alerts" color="#EAB308" route="/(student)/settings/notifications" />
          <Row icon="shield-checkmark" title="Privacy & Safety" sub="Visibility & blocked users" color="#10B981" route="/(student)/settings/privacy" />
          <Row icon="color-palette" title="Appearance" sub="Theme & layout" color="#EC4899" route="/(student)/settings/appearance" />
        </View>

        <Text className="text-xs font-bold uppercase tracking-wider mb-3 ml-2" style={{ color: C.muted }}>Support</Text>
        <View className="rounded-[24px] overflow-hidden mb-6" style={{ backgroundColor: C.card, borderWidth: 1, borderColor: C.border }}>
          <Row icon="help-circle" title="Help & FAQ" color="#64748B" route="/(student)/settings/help" />
          <Row icon="chatbubble-ellipses" title="Send Feedback" color="#F97316" route="/(student)/settings/feedback" />
        </View>

        <TouchableOpacity 
          onPress={async () => await logout()}
          className="p-5 rounded-[24px] border flex-row items-center justify-between"
          style={{ backgroundColor: isDarkMode ? '#450a0a' : '#fef2f2', borderColor: isDarkMode ? '#7f1d1d' : '#fee2e2' }}
        >
          <View className="flex-row items-center gap-3">
            <Ionicons name="log-out-outline" size={22} color="#EF4444" />
            <Text className="text-sm font-bold text-red-500">Sign Out of Account</Text>
          </View>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}
