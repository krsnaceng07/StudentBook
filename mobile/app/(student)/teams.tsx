import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { useUIStore } from '../../store/uiStore';
import client from '../../api/client';

export default function Teams() {
  const router = useRouter();
  const { isDarkMode } = useUIStore();
  const [loading, setLoading] = useState(true);
  const [teamData, setTeamData] = useState<any>(null);

  const fetchTeamData = async () => {
    setLoading(true);
    try {
      const response = await client.get('/student/teams/my');
      if (response.data && response.data.success) {
        setTeamData(response.data.data);
      }
    } catch (err) {
      console.warn('Error fetching team info:', err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchTeamData();
    }, [])
  );

  return (
    <SafeAreaView className={`flex-1 ${isDarkMode ? 'bg-[#0F172A]' : 'bg-[#F8FAFC]'}`}>
      <View className={`px-6 pt-4 pb-3 flex-row items-center justify-between border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
        <Text className={`text-2xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          My team
        </Text>
        <TouchableOpacity 
          onPress={fetchTeamData}
          className={`w-10 h-10 rounded-full items-center justify-center ${isDarkMode ? 'bg-slate-800' : 'bg-white shadow-sm'}`}
        >
          <Ionicons name="refresh" size={20} color={isDarkMode ? '#94A3B8' : '#475569'} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : !teamData ? (
        // Empty State - No Team Joined
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 48, paddingBottom: 64 }}>
          <View style={{
            width: 96,
            height: 96,
            borderRadius: 48,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 24,
            backgroundColor: isDarkMode ? '#1E293B' : '#EFF6FF'
          }}>
            <Text style={{ fontSize: 48, textAlign: 'center' }}>🤝</Text>
          </View>
          <Text style={{
            fontSize: 17,
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: 8,
            color: isDarkMode ? '#FFFFFF' : '#1E293B'
          }}>
            No team formed yet
          </Text>
          <Text style={{
            fontSize: 12,
            textAlign: 'center',
            lineHeight: 20,
            paddingHorizontal: 24,
            marginBottom: 32,
            color: isDarkMode ? '#94A3B8' : '#64748B'
          }}>
            You are not part of any collaboration team yet. Connect with other students or build your own dream team!
          </Text>
          <TouchableOpacity 
            onPress={() => router.push('/discover')}
            style={{
              backgroundColor: '#2563EB',
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: 16,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 1
            }}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 }}>Find Teammates</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView className="flex-1">
          {/* Team Header Info */}
          <View className={`px-6 py-5 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
            <Text className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              {teamData.team?.name || 'Dream Team'}
            </Text>
            <Text className={`text-sm mt-0.5 mb-3 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              For: {teamData.team?.event_name || 'Hackathon / Event'}
            </Text>
            <View className="flex-row gap-2">
              <View className={`px-3 py-1 rounded-full ${isDarkMode ? 'bg-blue-950' : 'bg-blue-100'}`}>
                <Text className={`text-xs font-semibold ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                  {teamData.members?.length || 1}/{teamData.team?.max_members || 4} members
                </Text>
              </View>
              {teamData.open_slots > 0 && (
                <View className={`px-3 py-1 rounded-full ${isDarkMode ? 'bg-orange-950' : 'bg-orange-100'}`}>
                  <Text className={`text-xs font-semibold ${isDarkMode ? 'text-orange-300' : 'text-orange-700'}`}>
                    {teamData.open_slots} slot open
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Members List */}
          <View className="pt-5 pb-8">
            <Text className={`px-6 text-[15px] font-medium mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Members
            </Text>
            
            {teamData.members?.map((member: any) => {
              const profile = member.profile || { full_name: 'Anonymous Student', initials: '??' };
              const isLeader = member.role === 'Leader';
              return (
                <View 
                  key={member.user_id} 
                  className={`flex-row items-center px-6 py-4 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}
                >
                  <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 bg-blue-600`}>
                    <Text className={`font-bold text-base text-white`}>{profile.initials}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className={`font-bold text-[15px] ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      {profile.full_name}
                    </Text>
                    <Text className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      {member.skill_tag || 'Contributor'}
                    </Text>
                  </View>
                  <View className={`px-3 py-1 rounded-full border ${
                    isLeader 
                      ? (isDarkMode ? 'border-purple-800 bg-purple-950' : 'border-purple-200 bg-purple-50') 
                      : (isDarkMode ? 'border-green-800 bg-green-950' : 'border-green-200 bg-green-50')
                  }`}>
                    <Text className={`text-[11px] font-bold tracking-wide ${
                      isLeader 
                        ? (isDarkMode ? 'text-purple-300' : 'text-purple-600') 
                        : (isDarkMode ? 'text-green-300' : 'text-green-600')
                    }`}>
                      {member.role ? member.role.toUpperCase() : 'MEMBER'}
                    </Text>
                  </View>
                </View>
              );
            })}

            {/* Open Slot */}
            {teamData.open_slots > 0 && (
              <View className={`flex-row items-center px-6 py-4 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 border border-dashed ${isDarkMode ? 'border-slate-600' : 'border-slate-300'}`}>
                  <Ionicons name="add" size={24} color={isDarkMode ? '#64748B' : '#94A3B8'} />
                </View>
                <View className="flex-1">
                  <Text className={`font-medium text-[15px] ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    Open slot
                  </Text>
                  <Text className={`text-sm italic ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                    Need: {teamData.team?.needed || 'Any specialist'}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => router.push('/discover')}>
                  <Text className="text-blue-500 font-semibold px-2 py-1">Find</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
