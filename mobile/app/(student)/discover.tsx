import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUIStore } from '../../store/uiStore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import client from '../../api/client';

interface SuggestedPeer {
  id: string;
  initials: string;
  name: string;
  university: string;
  department?: string;
  university_year?: string;
  year: string;
  skills: string[];
  bio: string;
  matching_reasons: string[];
  connectionStatus: 'none' | 'pending_sent' | 'pending_received' | 'accepted';
  connectionId: string | null;
  is_online?: boolean;
}

const MOCK_PEERS: SuggestedPeer[] = [
  {
    id: 'priya_thapa',
    initials: 'PT',
    name: 'Priya Thapa',
    university: 'Kathmandu University',
    year: 'IoT - 2nd Year',
    skills: ['IoT', 'C++', 'Arduino'],
    bio: 'Hardware + software bridge builder. Love IoT and embedded systems.',
    matching_reasons: ['Same University', '2 Common Skills'],
    connectionStatus: 'none',
    connectionId: null,
    is_online: true
  },
  {
    id: 'rohan_kc',
    initials: 'RK',
    name: 'Rohan KC',
    university: 'Pokhara University',
    year: 'Software Engineering - 4th Year',
    skills: ['Node.js', 'React', 'PostgreSQL'],
    bio: 'Passionate full-stack developer looking to team up for tech contests.',
    matching_reasons: ['Same Dept: Software Engineering', '3 Common Skills'],
    connectionStatus: 'pending_sent',
    connectionId: 'some-conn-id',
    is_online: true
  }
];

export default function Discover() {
  const { isDarkMode } = useUIStore();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [teammates, setTeammates] = useState<SuggestedPeer[]>(MOCK_PEERS);

  const fetchTeammates = async () => {
    setLoading(true);
    try {
      const response = await client.get(`/student/discover?search=${searchQuery}`);
      if (response.data && response.data.success) {
        setTeammates(response.data.data);
      } else {
        setTeammates(MOCK_PEERS);
      }
    } catch (err) {
      console.warn('Error discover query, using fallback mocks:', err);
      setTeammates(MOCK_PEERS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchTeammates();
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const handleConnect = async (peerId: string) => {
    // Optimistic UI update: instantly set connectionStatus to 'pending_sent'
    setTeammates(prev => prev.map(p => p.id === peerId ? { ...p, connectionStatus: 'pending_sent' } : p));
    
    try {
      const response = await client.post('/connections/request', { receiverId: peerId });
      if (!response.data?.success) {
        throw new Error(response.data?.error || 'Failed to send request');
      }
    } catch (err) {
      console.warn('Failed to send connection request:', err);
      // Revert status on failure
      setTeammates(prev => prev.map(p => p.id === peerId ? { ...p, connectionStatus: 'none' } : p));
    }
  };

  const handleAcceptRequest = async (peerId: string, connectionId: string) => {
    // Optimistic UI update: instantly set connectionStatus to 'accepted'
    setTeammates(prev => prev.map(p => p.id === peerId ? { ...p, connectionStatus: 'accepted' } : p));
    
    try {
      const response = await client.put('/connections/respond', { requestId: connectionId, status: 'accepted' });
      if (!response.data?.success) {
        throw new Error(response.data?.error || 'Failed to respond');
      }
    } catch (err) {
      console.warn('Failed to accept request:', err);
      // Revert status on failure
      setTeammates(prev => prev.map(p => p.id === peerId ? { ...p, connectionStatus: 'pending_received' } : p));
    }
  };

  return (
    <SafeAreaView 
      className={`flex-1 ${isDarkMode ? 'bg-[#0F172A]' : 'bg-[#F8FAFC]'}`}
      edges={['top']}
    >
      <View className={`px-6 pt-4 pb-4 ${isDarkMode ? 'bg-[#0F172A]' : 'bg-white border-b border-slate-100 shadow-sm'}`}>
        {/* Header */}
        <Text className={`text-2xl font-bold tracking-tight mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          Discover
        </Text>

        {/* Search Bar */}
        <View className={`flex-row items-center rounded-2xl px-4 py-3 mb-1 border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
          <Ionicons name="search" size={20} color={isDarkMode ? '#94A3B8' : '#64748B'} />
          <TextInput
            placeholder="Search classmate by name, skill, dept..."
            placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'}
            value={searchQuery}
            onChangeText={setSearchQuery}
            className={`flex-1 ml-3 font-medium text-sm ${isDarkMode ? 'text-white' : 'text-slate-800'}`}
          />
        </View>
      </View>

      {/* Suggested Peers list */}
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24, paddingTop: 16 }}
      >
        <Text className={`text-base font-bold mb-4 ${isDarkMode ? 'text-slate-300' : 'text-slate-800'}`}>
          Suggested Peers
        </Text>

        {loading ? (
          <View className="py-20 justify-center items-center">
            <ActivityIndicator size="large" color="#2563EB" />
          </View>
        ) : (
          <View className="gap-4">
            {teammates.length === 0 ? (
              <View className="py-20 items-center justify-center">
                <Ionicons name="people-outline" size={48} color="#94A3B8" />
                <Text className={`text-base font-semibold mt-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  No suggested classmates found
                </Text>
              </View>
            ) : (
              teammates.map((t) => (
                <TouchableOpacity
                  key={t.id}
                  onPress={() => router.push(`/profile/${t.id}`)}
                  activeOpacity={0.9}
                  className={`rounded-3xl p-5 border ${
                    isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 shadow-sm'
                  }`}
                >
                  <View className="flex-row items-center mb-3">
                    {/* Circle initials avatar */}
                    <View className={`w-14 h-14 rounded-full items-center justify-center mr-4 border ${
                      isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-blue-50 border-blue-100'
                    }`}>
                      <Text className={`text-[17px] font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>{t.initials}</Text>
                    </View>

                    {/* Meta info */}
                    <View className="flex-1">
                      <View className="flex-row items-center mb-0.5">
                        <Text className={`text-[15px] font-bold mr-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                          {t.name}
                        </Text>
                        {t.is_online && (
                          <View className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                        )}
                      </View>
                      
                      <Text className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} numberOfLines={1}>
                        {t.university}
                      </Text>
                      {t.year ? (
                        <Text className={`text-[11px] mt-0.5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} numberOfLines={1}>
                          {t.year}
                        </Text>
                      ) : null}
                    </View>
                  </View>

                  {/* Matching Reasons Badges Row */}
                  <View className="flex-row flex-wrap gap-1.5 mb-3">
                    {t.matching_reasons.map((reason, idx) => {
                      const isDept = reason.toLowerCase().includes('dept') || reason.toLowerCase().includes('department');
                      const isSkill = reason.toLowerCase().includes('skill');
                      
                      let bgClass = isDarkMode ? 'bg-slate-700/40 border-slate-600' : 'bg-slate-50 border-slate-200';
                      let textClass = isDarkMode ? 'text-slate-300' : 'text-slate-600';

                      if (isDept) {
                        bgClass = isDarkMode ? 'bg-emerald-950/20 border-emerald-900/50' : 'bg-emerald-50 border-emerald-100';
                        textClass = isDarkMode ? 'text-emerald-400' : 'text-emerald-600';
                      } else if (isSkill) {
                        bgClass = isDarkMode ? 'bg-blue-950/20 border-blue-900/50' : 'bg-blue-50 border-blue-100';
                        textClass = isDarkMode ? 'text-blue-400' : 'text-blue-600';
                      }

                      return (
                        <View key={idx} className={`px-2.5 py-1 rounded-full border ${bgClass}`}>
                          <Text className={`text-[9px] font-bold ${textClass}`}>{reason}</Text>
                        </View>
                      );
                    })}
                  </View>

                  {/* Bio statement */}
                  {t.bio ? (
                    <Text className={`text-xs mb-4 leading-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`} numberOfLines={2}>
                      {t.bio}
                    </Text>
                  ) : null}

                  {/* Bottom Row: Skills pills on Left, Connect button on Right */}
                  <View className={`flex-row justify-between items-center pt-3 border-t ${
                    isDarkMode ? 'border-slate-700/50' : 'border-slate-100'
                  }`}>
                    {/* Skills Left */}
                    <View className="flex-row flex-wrap gap-1.5 flex-1 mr-3">
                      {t.skills.slice(0, 2).map((skill) => (
                        <View 
                          key={skill} 
                          className={`px-2 py-1 rounded-lg border ${
                            isDarkMode ? 'bg-slate-900/50 border-slate-700' : 'bg-slate-50 border-slate-200'
                          }`}
                        >
                          <Text className={`text-[10px] font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                            {skill}
                          </Text>
                        </View>
                      ))}
                      {t.skills.length > 2 && (
                        <View className="px-2 py-1 rounded-lg">
                          <Text className="text-[10px] text-slate-400 font-bold">
                            +{t.skills.length - 2}
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Connection Button Right */}
                    <View>
                      {(() => {
                        const status = t.connectionStatus;
                        
                        if (status === 'none') {
                          return (
                            <TouchableOpacity
                              onPress={(e) => {
                                e.stopPropagation();
                                handleConnect(t.id);
                              }}
                              activeOpacity={0.8}
                              className="px-4 py-1.5 rounded-xl bg-blue-600 items-center justify-center flex-row gap-1"
                            >
                              <Ionicons name="person-add" size={13} color="#FFF" />
                              <Text className="text-white font-bold text-[11px]">Connect</Text>
                            </TouchableOpacity>
                          );
                        }
                        
                        if (status === 'pending_sent') {
                          return (
                            <View className={`px-4 py-1.5 rounded-xl border ${
                              isDarkMode ? 'bg-slate-700/30 border-slate-700' : 'bg-slate-50 border-slate-100'
                            } items-center justify-center flex-row gap-1`}>
                              <Ionicons name="time" size={13} color={isDarkMode ? '#94A3B8' : '#64748B'} />
                              <Text className={`font-semibold text-[11px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Pending</Text>
                            </View>
                          );
                        }

                        if (status === 'pending_received') {
                          return (
                            <TouchableOpacity
                              onPress={(e) => {
                                e.stopPropagation();
                                if (t.connectionId) handleAcceptRequest(t.id, t.connectionId);
                              }}
                              activeOpacity={0.8}
                              className="px-4 py-1.5 rounded-xl bg-emerald-600 items-center justify-center flex-row gap-1"
                            >
                              <Ionicons name="checkmark-circle" size={13} color="#FFF" />
                              <Text className="text-white font-bold text-[11px]">Accept</Text>
                            </TouchableOpacity>
                          );
                        }

                        if (status === 'accepted') {
                          return (
                            <TouchableOpacity
                              onPress={(e) => {
                                e.stopPropagation();
                                router.push('/messages');
                              }}
                              activeOpacity={0.8}
                              className={`px-3 py-1.5 rounded-xl border ${
                                isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                              } items-center justify-center flex-row gap-1`}
                            >
                              <Ionicons name="chatbubble-ellipses" size={13} color="#2563EB" />
                              <Text className="text-blue-600 font-bold text-[11px]">Message</Text>
                            </TouchableOpacity>
                          );
                        }

                        return null;
                      })()}
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
