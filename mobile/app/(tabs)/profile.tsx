import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { useProfileStore } from '../../store/profileStore';
import { useConnectionStore } from '../../store/connectionStore';
import { SafeAreaView } from 'react-native-safe-area-context';
import useUIStore from '../../store/uiStore';

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const { profile, fetchProfile, isLoading: profileLoading } = useProfileStore();
  const { incomingRequests, connections, fetchPendingRequests, fetchConnections } = useConnectionStore();
  const router = useRouter();
  const { isDarkMode } = useUIStore();

  useEffect(() => {
    fetchProfile();
    fetchPendingRequests();
    fetchConnections();
  }, []);

  const onRefresh = () => {
    fetchProfile();
    fetchPendingRequests();
    fetchConnections();
  };

  if (!profile) return null;

  return (
    <SafeAreaView className={`flex-1 ${isDarkMode ? 'bg-[#0F172A]' : 'bg-white'}`} edges={['bottom']}>
      <ScrollView 
        className={`flex-1 ${isDarkMode ? 'bg-[#0F172A]' : 'bg-white'}`}
        refreshControl={
          <RefreshControl refreshing={profileLoading} onRefresh={onRefresh} tintColor={isDarkMode ? '#3B82F6' : '#000000'} />
        }
      >
        {/* Header / Cover */}
        <View className={`h-40 ${isDarkMode ? 'bg-white/10' : 'bg-slate-100'} opacity-30`} />
        
        <View className="px-6 -mt-16">
          <View className="flex-row items-end justify-between mb-4">
            <View className={`${isDarkMode ? 'bg-white/10' : 'bg-slate-200'} h-28 w-28 rounded-3xl border-4 ${isDarkMode ? 'border-[#0F172A]' : 'border-white'} items-center justify-center overflow-hidden`}>
              {profile?.avatar ? (
                <Image source={{ uri: profile.avatar }} className="w-full h-full" />
              ) : (
                <Text className={`${isDarkMode ? 'text-white' : 'text-black'} text-4xl font-bold`}>{user?.name?.charAt(0)}</Text>
              )}
            </View>
            <View className="flex-row gap-2">
              <TouchableOpacity 
                onPress={() => router.push('/profile/edit')}
                className={`${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-200'} px-4 py-2.5 rounded-xl border`}
              >
                <Text className={`${isDarkMode ? 'text-white' : 'text-black'} font-bold`}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => router.push('/settings')}
                className={`${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-200'} px-3 py-2.5 rounded-xl border`}
              >
                <Ionicons name="settings-outline" size={20} color={isDarkMode ? "white" : "black"} />
              </TouchableOpacity>
            </View>
          </View>

          <View className="mb-8">
            <Text className={`${isDarkMode ? 'text-white' : 'text-black'} text-3xl font-bold`}>{profile.userId?.name}</Text>
            {profile.userId?.username && (
              <Text className={`${isDarkMode ? 'text-white/80' : 'text-[#3B82F6]'} font-medium text-lg mt-0.5`}>@{profile.userId.username}</Text>
            )}
            
            <Text className={`${isDarkMode ? 'text-slate-300' : 'text-slate-700'} text-lg font-bold mt-2`} numberOfLines={2}>
              {profile.headline || 'Student'}
            </Text>

            <View className="flex-row flex-wrap gap-2 mt-4">
              <View className={`${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'} flex-row items-center px-3 py-1.5 rounded-xl border`}>
                <Ionicons name="school-outline" size={14} color={isDarkMode ? '#FFFFFF' : '#000000'} />
                <Text className={`${isDarkMode ? 'text-slate-400' : 'text-slate-500'} ml-2 text-xs font-bold`}>{profile.field || 'General'}</Text>
              </View>
              <View className={`${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'} flex-row items-center px-3 py-1.5 rounded-xl border`}>
                <Ionicons name="stats-chart-outline" size={14} color={isDarkMode ? "#8B5CF6" : "#000000"} />
                <Text className={`${isDarkMode ? 'text-slate-400' : 'text-slate-500'} ml-2 text-xs font-bold`}>{profile.experienceLevel || 'Beginner'}</Text>
              </View>
              <View className="flex-row items-center bg-[#10B981]/10 px-3 py-1.5 rounded-xl border border-[#10B981]/20">
                <View className="h-2 w-2 rounded-full bg-[#10B981] mr-2" />
                <Text className="text-[#10B981] text-xs font-bold">{profile.availability || 'Open for Projects'}</Text>
              </View>
            </View>

            {/* Email Display (Active when setting is ON) */}
            {user?.settings?.showEmail && (
              <View className="flex-row items-center mt-4">
                <Ionicons name="mail-outline" size={16} color="#94A3B8" />
                <Text className="text-slate-400 ml-2 text-sm font-medium">{user.email}</Text>
              </View>
            )}
            
            {profile?.bio && (
              <Text className={`${isDarkMode ? 'text-slate-300' : 'text-slate-600'} mt-6 leading-6 text-base italic`}>"{profile.bio}"</Text>
            )}
          </View>

          {/* Stats Section */}
          <View className="flex-row gap-4 mb-8">
            <TouchableOpacity 
              onPress={() => router.push('/network/requests')}
              className={`${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-slate-100 shadow-sm'} flex-1 rounded-2xl p-4 border`}
            >
              <View className="flex-row justify-between items-start mb-2">
                <View className={`${isDarkMode ? 'bg-white/10' : 'bg-slate-100'} p-2 rounded-lg`}>
                  <Ionicons name="people" size={20} color={isDarkMode ? '#FFFFFF' : '#000000'} />
                </View>
                {incomingRequests.length > 0 && (
                  <View className="bg-red-500 px-2 py-0.5 rounded-full">
                    <Text className="text-white text-[10px] font-bold">{incomingRequests.length}</Text>
                  </View>
                )}
              </View>
              <Text className={`${isDarkMode ? 'text-white' : 'text-black'} font-bold text-xl`}>{incomingRequests.length}</Text>
              <Text className="text-slate-500 text-xs mt-1">Pending Requests</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => router.push('/network/connections')} 
              className={`${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-slate-100 shadow-sm'} flex-1 rounded-2xl p-4 border`}
            >
              <View className={`${isDarkMode ? 'bg-white/10' : 'bg-slate-100'} p-2 rounded-lg self-start mb-2`}>
                <Ionicons name="checkmark-circle" size={20} color={isDarkMode ? '#FFFFFF' : '#000000'} />
              </View>
              <Text className={`${isDarkMode ? 'text-white' : 'text-black'} font-bold text-xl`}>{connections.length}</Text>
              <Text className="text-slate-500 text-xs mt-1">Total Connections</Text>
            </TouchableOpacity>
          </View>

          {/* Detailed Info Sections */}
          <View className="space-y-6 mb-10">
            {/* Skills */}
            <View className={`${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-slate-100 shadow-sm'} rounded-2xl border p-5`}>
              <View className="flex-row items-center mb-3">
                <Ionicons name="flash-outline" size={18} color={isDarkMode ? '#FFFFFF' : '#3B82F6'} />
                <Text className={`${isDarkMode ? 'text-white' : 'text-black'} font-bold text-lg ml-2`}>Skills</Text>
              </View>
              <View className="flex-row flex-wrap gap-2">
                {profile?.skills?.length ? profile.skills.map((item: string, idx: number) => (
                  <View key={`skill-${item}-${idx}`} className={`${isDarkMode ? 'bg-white/10 border-white/10' : 'bg-slate-50 border-slate-200'} px-3 py-1.5 rounded-full border`}>
                    <Text className={`${isDarkMode ? 'text-white' : 'text-black'} font-medium`}>{item}</Text>
                  </View>
                )) : <Text className="text-slate-500 italic">No skills added yet.</Text>}
              </View>
            </View>

            {/* Interests */}
            <View className={`${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-slate-100 shadow-sm'} rounded-2xl border p-5`}>
              <View className="flex-row items-center mb-3">
                <Ionicons name="heart-outline" size={18} color={isDarkMode ? '#FFFFFF' : '#8B5CF6'} />
                <Text className={`${isDarkMode ? 'text-white' : 'text-black'} font-bold text-lg ml-2`}>Interests</Text>
              </View>
              <View className="flex-row flex-wrap gap-2">
                {profile?.interests?.length ? profile.interests.map((item: string, idx: number) => (
                  <View key={`interest-${item}-${idx}`} className={`${isDarkMode ? 'bg-white/10 border-white/10' : 'bg-slate-50 border-slate-200'} px-3 py-1.5 rounded-full border`}>
                    <Text className={`${isDarkMode ? 'text-white' : 'text-black'} font-medium`}>{item}</Text>
                  </View>
                )) : <Text className="text-slate-500 italic">No interests added yet.</Text>}
              </View>
            </View>

            {/* Goals */}
            <View className={`${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-slate-100 shadow-sm'} rounded-2xl border p-5`}>
              <View className="flex-row items-center mb-3">
                <Ionicons name="rocket-outline" size={18} color="#10B981" />
                <Text className={`${isDarkMode ? 'text-white' : 'text-black'} font-bold text-lg ml-2`}>Goals</Text>
              </View>
              <View className="flex-row flex-wrap gap-2">
                {profile?.goals?.length ? profile.goals.map((item: string, idx: number) => (
                  <View key={`goal-${item}-${idx}`} className="bg-[#10B981]/10 px-3 py-1.5 rounded-full border border-[#10B981]/20">
                    <Text className="text-[#10B981] font-medium">{item}</Text>
                  </View>
                )) : <Text className="text-slate-500 italic">No goals added yet.</Text>}
              </View>
            </View>
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
