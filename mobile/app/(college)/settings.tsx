import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useUIStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import api from '../../api/client';

export default function CollegeSettings() {
  const { isDarkMode } = useUIStore();
  const { user } = useAuthStore();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  // Notifications State
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailDigest, setEmailDigest] = useState(false);
  const [darkModeActive, setDarkModeActive] = useState(isDarkMode);

  useFocusEffect(
    useCallback(() => {
      const fetchProfile = async () => {
        try {
          const response = await api.get('/profile/me');
          if (response.data?.success) {
            setProfile(response.data.data);
          }
        } catch (error) {
          console.error('Failed to fetch profile', error);
        } finally {
          setLoading(false);
        }
      };
      fetchProfile();
    }, [])
  );

  const extProfile = profile?.profile;
  const universityName = extProfile?.full_name || extProfile?.university || user?.full_name || 'Tribhuvan University';
  const email = user?.email || 'user@email.com';
  const initials = extProfile?.initials || 'TU';

  if (loading) {
    return (
      <View className={`flex-1 justify-center items-center ${isDarkMode ? 'bg-[#0F172A]' : 'bg-[#F8FAFC]'}`}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  return (
    <SafeAreaView 
      className={`flex-1 ${isDarkMode ? 'bg-[#0F172A]' : 'bg-[#F8FAFC]'}`}
      edges={['top']}
    >
      {/* Top Header */}
      <View className={`px-6 py-4 flex-row items-center border-b ${
        isDarkMode ? 'bg-[#0F172A] border-slate-800' : 'bg-white border-slate-100 shadow-sm'
      }`}>
        <TouchableOpacity 
          onPress={() => router.back()}
          className={`w-9 h-9 rounded-full items-center justify-center border ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'
          } mr-4`}
        >
          <Ionicons name="arrow-back" size={16} color={isDarkMode ? 'white' : 'black'} />
        </TouchableOpacity>
        <Text className={`text-lg font-extrabold ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>
          Settings
        </Text>
      </View>

      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card Summary Block */}
        <View className={`p-5 rounded-[28px] border mb-6 flex-row items-center gap-4 ${
          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'
        }`}>
          {/* Avatar with dynamic initials */}
          <View className="w-14 h-14 rounded-full border border-emerald-500 items-center justify-center bg-emerald-50/10">
            <Text className="text-emerald-600 text-lg font-extrabold">{initials}</Text>
          </View>

          <View className="flex-1">
            <Text className={`text-base font-extrabold mb-0.5 ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>
              {universityName}
            </Text>
            <Text className={`text-xs mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              {email}
            </Text>
            
            {/* College Role Badge */}
            <View className="bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full self-start">
              <Text className="text-emerald-600 text-[10px] font-bold">College</Text>
            </View>
          </View>
        </View>

        {/* ACCOUNT Preference list */}
        <Text className={`text-[10px] font-bold uppercase tracking-wider mb-2.5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
          Account
        </Text>

        <View className={`rounded-[24px] border overflow-hidden mb-6 ${
          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'
        }`}>
          {/* Edit Profile Row */}
          <TouchableOpacity 
            onPress={() => router.push('/(college)/edit-profile')}
            className={`flex-row items-center justify-between p-4.5 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}
          >
            <View className="flex-row items-center gap-3.5">
              <View className="w-9 h-9 rounded-2xl bg-purple-50 items-center justify-center">
                <Ionicons name="person" size={16} color="#7C3AED" />
              </View>
              <View>
                <Text className={`text-xs font-bold mb-0.5 ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>Edit Profile</Text>
                <Text className="text-[10px] font-semibold text-slate-400">Update your info and photo</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
          </TouchableOpacity>

          {/* Change Password Row */}
          <TouchableOpacity className={`flex-row items-center justify-between p-4.5 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
            <View className="flex-row items-center gap-3.5">
              <View className="w-9 h-9 rounded-2xl bg-amber-50 items-center justify-center">
                <Ionicons name="lock-closed" size={16} color="#D97706" />
              </View>
              <Text className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>Change Password</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
          </TouchableOpacity>

          {/* Change Email Row */}
          <TouchableOpacity className="flex-row items-center justify-between p-4.5">
            <View className="flex-row items-center gap-3.5">
              <View className="w-9 h-9 rounded-2xl bg-blue-50 items-center justify-center">
                <Ionicons name="mail" size={16} color="#2563EB" />
              </View>
              <Text className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>Change Email</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* NOTIFICATIONS Switch Lists */}
        <Text className={`text-[10px] font-bold uppercase tracking-wider mb-2.5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
          Notifications
        </Text>

        <View className={`rounded-[24px] border overflow-hidden mb-6 ${
          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'
        }`}>
          {/* Push Notifications Switch Row */}
          <View className={`flex-row items-center justify-between p-4.5 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
            <View className="flex-row items-center gap-3.5">
              <View className="w-9 h-9 rounded-2xl bg-yellow-50 items-center justify-center">
                <Ionicons name="notifications" size={16} color="#EAB308" />
              </View>
              <Text className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>Push Notifications</Text>
            </View>
            <TouchableOpacity 
              onPress={() => setPushEnabled(!pushEnabled)}
              className={`w-12 h-7 rounded-full p-1 ${pushEnabled ? 'bg-[#10B981] items-end' : 'bg-slate-300 items-start'}`}
            >
              <View className="w-5 h-5 rounded-full bg-white shadow-sm" />
            </TouchableOpacity>
          </View>

          {/* Email Digest Switch Row */}
          <View className="flex-row items-center justify-between p-4.5">
            <View className="flex-row items-center gap-3.5">
              <View className="w-9 h-9 rounded-2xl bg-purple-50 items-center justify-center">
                <Ionicons name="mail-open" size={16} color="#8B5CF6" />
              </View>
              <Text className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>Email Digest</Text>
            </View>
            <TouchableOpacity 
              onPress={() => setEmailDigest(!emailDigest)}
              className={`w-12 h-7 rounded-full p-1 ${emailDigest ? 'bg-[#10B981] items-end' : 'bg-slate-300 items-start'}`}
            >
              <View className="w-5 h-5 rounded-full bg-white shadow-sm" />
            </TouchableOpacity>
          </View>
        </View>

        {/* APPEARANCE Preferences */}
        <Text className={`text-[10px] font-bold uppercase tracking-wider mb-2.5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
          Appearance
        </Text>

        <View className={`rounded-[24px] border overflow-hidden mb-6 ${
          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'
        }`}>
          {/* Dark Mode switch */}
          <View className={`flex-row items-center justify-between p-4.5 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
            <View className="flex-row items-center gap-3.5">
              <View className="w-9 h-9 rounded-2xl bg-orange-50 items-center justify-center">
                <Ionicons name="moon" size={16} color="#EA580C" />
              </View>
              <Text className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>Dark Mode</Text>
            </View>
            <TouchableOpacity 
              onPress={() => {
                setDarkModeActive(!darkModeActive);
                useUIStore.getState().toggleDarkMode();
              }}
              className={`w-12 h-7 rounded-full p-1 ${darkModeActive ? 'bg-[#10B981] items-end' : 'bg-slate-300 items-start'}`}
            >
              <View className="w-5 h-5 rounded-full bg-white shadow-sm" />
            </TouchableOpacity>
          </View>

          {/* Language Selection Row */}
          <TouchableOpacity className="flex-row items-center justify-between p-4.5">
            <View className="flex-row items-center gap-3.5">
              <View className="w-9 h-9 rounded-2xl bg-sky-50 items-center justify-center">
                <Ionicons name="globe" size={16} color="#0284C7" />
              </View>
              <Text className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>Language</Text>
            </View>
            <View className="flex-row items-center gap-1.5">
              <Text className="text-[11px] font-semibold text-slate-400">English</Text>
              <Ionicons name="chevron-forward" size={14} color="#94A3B8" />
            </View>
          </TouchableOpacity>
        </View>

        {/* SUPPORT Preferences */}
        <Text className={`text-[10px] font-bold uppercase tracking-wider mb-2.5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
          Support
        </Text>

        <View className={`rounded-[24px] border overflow-hidden ${
          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'
        }`}>
          {/* Help row */}
          <TouchableOpacity className="flex-row items-center justify-between p-4.5">
            <View className="flex-row items-center gap-3.5">
              <View className="w-9 h-9 rounded-2xl bg-rose-50 items-center justify-center">
                <Ionicons name="help-circle" size={16} color="#E11D48" />
              </View>
              <Text className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>Help & FAQ</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
