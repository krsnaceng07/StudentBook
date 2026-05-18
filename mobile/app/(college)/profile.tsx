import React, { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Linking, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { useUIStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import api from '../../api/client';

interface CollegeProfileData {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  extended_profiles?: {
    full_name: string;
    university: string;
    location: string;
    bio: string;
    initials: string;
    social_links?: any;
    established_year?: string;
    website?: string;
    contact_email?: string;
    college_type?: string;
  }[];
}

export default function CollegeProfile() {
  const { isDarkMode } = useUIStore();
  const { user } = useAuthStore();
  const router = useRouter();
  const [profile, setProfile] = useState<CollegeProfileData | null>(null);
  const [loading, setLoading] = useState(true);

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

  const extProfile = profile?.extended_profiles?.[0];
  const universityName = extProfile?.full_name || extProfile?.university || user?.full_name || 'University';
  const location = extProfile?.location || 'Not specified';
  const bio = extProfile?.bio || 'Institution overview not provided.';
  const website = extProfile?.website || extProfile?.social_links?.github || 'Not provided';
  const contactEmail = extProfile?.contact_email || profile?.email || 'Not provided';
  const initials = extProfile?.initials || 'UN';

  const handleWebsitePress = () => {
    if (website && website !== 'Not provided') {
      Linking.openURL(website.startsWith('http') ? website : `https://${website}`);
    }
  };

  const handleEmailPress = () => {
    if (contactEmail && contactEmail !== 'Not provided') {
      Linking.openURL(`mailto:${contactEmail}`);
    }
  };

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
      <View className="px-6 py-4 flex-row items-center justify-between">
        <Text className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Profile</Text>
        <TouchableOpacity 
          onPress={() => router.push('/(college)/settings')}
          className={`w-9 h-9 rounded-full items-center justify-center border ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'
          }`}
        >
          <Ionicons name="settings-outline" size={18} color={isDarkMode ? 'white' : 'black'} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
      >
        {/* Banner Section */}
        <View className="bg-[#10B981] px-6 pt-6 pb-10 rounded-b-[36px] relative mx-6 rounded-t-[36px] mb-6">
          {/* Edit Button */}
          <TouchableOpacity 
            onPress={() => router.push('/(college)/edit-profile')}
            className="absolute top-4 right-4 bg-white/20 border border-white/20 px-3.5 py-1.5 rounded-full flex-row items-center gap-1.5 active:bg-white/30"
          >
            <Text className="text-white text-xs font-bold">Edit</Text>
            <Ionicons name="pencil" size={10} color="white" />
          </TouchableOpacity>

          <View className="flex-row items-center gap-4 mt-6">
            {/* Logo Badge */}
            <View className="w-14 h-14 rounded-2xl bg-white/20 border border-white/25 items-center justify-center">
              <Text className="text-white text-lg font-black tracking-widest">{initials}</Text>
            </View>

            <View className="flex-1 pr-14">
              <Text className="text-white text-2xl font-black mb-1.5 leading-tight">{universityName}</Text>
              <Text className="text-emerald-100 text-xs font-semibold">{location}</Text>
            </View>
          </View>
        </View>

        {/* Content Segment Cards */}
        <View className="px-6 gap-4 mb-10">
          {/* About Card */}
          <View className={`rounded-3xl border p-5 ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'
          }`}>
            <Text className={`text-sm font-extrabold mb-2.5 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>About</Text>
            <Text className={`text-xs leading-relaxed font-semibold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              {bio}
            </Text>
          </View>

          {/* Website Card */}
          <TouchableOpacity 
            onPress={handleWebsitePress}
            activeOpacity={0.85}
            className={`rounded-3xl border p-5 flex-row items-center gap-4.5 ${
              isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'
            }`}
          >
            <View className={`w-10 h-10 rounded-2xl items-center justify-center ${
              isDarkMode ? 'bg-blue-950/50' : 'bg-blue-50'
            }`}>
              <Ionicons name="globe-outline" size={20} color={isDarkMode ? '#60A5FA' : '#2563EB'} />
            </View>
            <View className="flex-1">
              <Text className={`text-[9px] font-bold uppercase mb-0.5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Website</Text>
              <Text className="text-[#2563EB] text-xs font-bold" numberOfLines={1}>{website}</Text>
            </View>
          </TouchableOpacity>

          {/* Contact Card */}
          <TouchableOpacity 
            onPress={handleEmailPress}
            activeOpacity={0.85}
            className={`rounded-3xl border p-5 flex-row items-center gap-4.5 ${
              isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'
            }`}
          >
            <View className={`w-10 h-10 rounded-2xl items-center justify-center ${
              isDarkMode ? 'bg-purple-950/50' : 'bg-purple-50'
            }`}>
              <Ionicons name="mail-outline" size={18} color={isDarkMode ? '#A78BFA' : '#7C3AED'} />
            </View>
            <View className="flex-1">
              <Text className={`text-[9px] font-bold uppercase mb-0.5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Contact</Text>
              <Text className="text-[#7C3AED] text-xs font-bold">{contactEmail}</Text>
            </View>
          </TouchableOpacity>

          {/* Sign Out Card */}
          <TouchableOpacity 
            onPress={async () => {
              const { logout } = useAuthStore.getState();
              await logout();
            }}
            activeOpacity={0.85}
            className={`rounded-3xl border p-5 flex-row items-center justify-between ${
              isDarkMode ? 'bg-red-950/25 border-red-900/30' : 'bg-red-50 border-red-100 shadow-sm'
            }`}
          >
            <View className="flex-row items-center gap-4.5">
              <View className={`w-10 h-10 rounded-2xl items-center justify-center ${
                isDarkMode ? 'bg-red-950/50' : 'bg-red-100/50'
              }`}>
                <Ionicons name="log-out-outline" size={20} color="#EF4444" />
              </View>
              <View>
                <Text className={`text-[9px] font-bold uppercase mb-0.5 ${isDarkMode ? 'text-red-400/80' : 'text-red-500/80'}`}>Session</Text>
                <Text className="text-red-500 text-xs font-bold">Sign Out</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
