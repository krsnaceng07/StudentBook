import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, RefreshControl, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useUIStore } from '../../store/uiStore';
import api from '../../api/client';

interface EventData {
  id: string;
  title: string;
  event_date: string;
  event_type: string;
  registration_type?: string;
  registrationCount?: number;
}

export default function ManageEvents() {
  const router = useRouter();
  const { isDarkMode } = useUIStore();
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Roster Modal States
  const [showRosterModal, setShowRosterModal] = useState(false);
  const [selectedEventTitle, setSelectedEventTitle] = useState('');
  const [registrants, setRegistrants] = useState<any[]>([]);
  const [rosterLoading, setRosterLoading] = useState(false);

  const fetchEvents = async () => {
    try {
      const response = await api.get('/college/events/my-events');
      if (response.data?.success) {
        setEvents(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchEvents();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchEvents();
  };

  const fetchRegistrants = async (eventId: string, title: string) => {
    setSelectedEventTitle(title);
    setRegistrants([]);
    setRosterLoading(true);
    try {
      const response = await api.get(`/college/events/${eventId}/registrants`);
      if (response.data?.success) {
        setRegistrants(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch event registrants:', error);
      Alert.alert('Error', 'Failed to retrieve registrant roster.');
    } finally {
      setRosterLoading(false);
    }
  };

  const handleDeleteEvent = (id: string) => {
    Alert.alert(
      'Delete Event',
      'Are you sure you want to delete this event?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await api.delete(`/college/events/${id}`);
              if (response.data?.success) {
                setEvents(events.filter(e => e.id !== id));
              }
            } catch (error) {
              console.error('Failed to delete event:', error);
              Alert.alert('Error', 'Failed to delete event');
            }
          }
        }
      ]
    );
  };

  const getTypeColor = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('hackathon')) return { border: 'border-l-[#2563EB]', bg: isDarkMode ? 'bg-blue-950/40' : 'bg-blue-50', text: isDarkMode ? 'text-blue-400' : 'text-blue-600' };
    if (t.includes('seminar') || t.includes('workshop')) return { border: 'border-l-[#8B5CF6]', bg: isDarkMode ? 'bg-purple-950/40' : 'bg-purple-50', text: isDarkMode ? 'text-purple-400' : 'text-purple-600' };
    return { border: 'border-l-[#10B981]', bg: isDarkMode ? 'bg-emerald-950/40' : 'bg-emerald-50', text: isDarkMode ? 'text-emerald-400' : 'text-emerald-600' };
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
      <View className="px-6 py-4">
        <Text className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>My Events</Text>
      </View>

      <ScrollView 
        className="flex-1 px-6"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10B981" />}
      >
        {/* + Post New Event Button */}
        <TouchableOpacity 
          onPress={() => router.push('/post-event')}
          className="bg-[#10B981] py-4 rounded-2xl items-center justify-center mb-6 active:bg-emerald-600"
        >
          <Text className="text-white text-sm font-bold tracking-wide">+ Post New Event</Text>
        </TouchableOpacity>

        {/* Event List */}
        <View className="gap-4 mb-10">
          {events.length === 0 ? (
            <Text className={`text-center py-4 text-xs font-semibold ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
              You haven't posted any events yet.
            </Text>
          ) : (
            events.map(event => {
              const colors = getTypeColor(event.event_type || '');
              const isExternal = event.registration_type === 'external';

              return (
                <View key={event.id} className={`rounded-3xl border p-5 border-l-4 ${colors.border} ${
                  isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
                }`}>
                  <View className="flex-row justify-between items-start mb-1.5">
                    <Text className={`text-sm font-extrabold flex-1 mr-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`} numberOfLines={1}>
                      {event.title}
                    </Text>
                    <View className={`px-2.5 py-0.5 rounded-full ${colors.bg}`}>
                      <Text className={`text-[9px] font-bold ${colors.text}`}>
                        {event.event_type || 'Event'}
                      </Text>
                    </View>
                  </View>

                  <Text className={`text-[10px] font-semibold mb-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    {new Date(event.event_date).toLocaleDateString()}
                  </Text>

                  {/* Action Buttons Row */}
                  <View className="flex-row justify-between items-center gap-2">
                    {/* Left side actions */}
                    <View className="flex-row gap-2 flex-1">
                      {isExternal ? (
                        <View className={`px-3 py-1.5 rounded-xl border ${
                          isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
                        } items-center justify-center flex-row gap-1`}>
                          <Ionicons name="open-outline" size={12} color={isDarkMode ? '#94A3B8' : '#64748B'} />
                          <Text className={`text-[10px] font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>External URL</Text>
                        </View>
                      ) : (
                        <TouchableOpacity 
                          className="px-4 py-2 rounded-xl bg-blue-600 active:bg-blue-700 items-center justify-center flex-row gap-1"
                          onPress={() => {
                            setShowRosterModal(true);
                            fetchRegistrants(event.id, event.title);
                          }}
                        >
                          <Ionicons name="people-outline" size={13} color="white" />
                          <Text className="text-white text-xs font-bold">
                            Registrants ({event.registrationCount || 0})
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>

                    {/* Right side delete */}
                    <TouchableOpacity 
                      className="px-4 py-2 rounded-xl border border-[#EF4444]"
                      style={{ backgroundColor: 'rgba(239, 68, 68, 0.05)' }}
                      onPress={() => handleDeleteEvent(event.id)}
                    >
                      <Text className="text-[#EF4444] text-xs font-bold">Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Roster Viewer Bottom Sheet / Modal */}
      <Modal
        visible={showRosterModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowRosterModal(false)}
      >
        <View style={{
          flex: 1,
          justifyContent: 'flex-end',
          backgroundColor: 'rgba(15, 23, 42, 0.65)'
        }}>
          <View style={{
            height: '75%',
            borderTopLeftRadius: 36,
            borderTopRightRadius: 36,
            backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
            paddingTop: 24,
            paddingHorizontal: 24
          }}>
            {/* Roster Header */}
            <View className="flex-row justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
              <View className="flex-1 mr-4">
                <Text className={`text-base font-extrabold ${isDarkMode ? 'text-white' : 'text-slate-900'}`} numberOfLines={1}>
                  Event Applicants
                </Text>
                <Text className={`text-[10px] font-semibold mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} numberOfLines={1}>
                  {selectedEventTitle}
                </Text>
              </View>
              
              <TouchableOpacity
                onPress={() => setShowRosterModal(false)}
                className={`w-9 h-9 rounded-full items-center justify-center ${
                  isDarkMode ? 'bg-slate-850' : 'bg-slate-50'
                }`}
              >
                <Ionicons name="close" size={20} color={isDarkMode ? 'white' : '#64748B'} />
              </TouchableOpacity>
            </View>

            {/* Roster Content */}
            {rosterLoading ? (
              <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#2563EB" />
                <Text className={`text-xs mt-3 font-semibold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Loading applicant list...</Text>
              </View>
            ) : (
              <ScrollView 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingVertical: 20, paddingBottom: 40 }}
              >
                {registrants.length === 0 ? (
                  <View className="py-20 items-center justify-center">
                    <Ionicons name="people" size={48} color="#94A3B8" />
                    <Text className={`text-sm font-semibold mt-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      No student registrants found
                    </Text>
                  </View>
                ) : (
                  <View className="gap-4">
                    {registrants.map((r, index) => {
                      const student = r.student;
                      return (
                        <TouchableOpacity
                          key={student.id || index}
                          onPress={() => {
                            setShowRosterModal(false);
                            router.push(`/profile/${student.id}`);
                          }}
                          activeOpacity={0.9}
                          className={`p-4.5 rounded-3xl border flex-row items-center gap-4 ${
                            isDarkMode ? 'bg-slate-900 border-slate-850' : 'bg-white border-slate-100 shadow-sm'
                          }`}
                        >
                          {/* Circular Avatar */}
                          <View className={`w-11 h-11 rounded-full items-center justify-center border ${
                            isDarkMode ? 'bg-slate-800 border-slate-750' : 'bg-blue-50 border-blue-100'
                          }`}>
                            <Text className={`text-xs font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>{student.initials}</Text>
                          </View>

                          {/* Student Details Info */}
                          <View className="flex-1">
                            <Text className={`text-xs font-extrabold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{student.name}</Text>
                            <Text className={`text-[10px] mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} numberOfLines={1}>{student.university}</Text>
                            {student.year ? (
                              <Text className={`text-[9px] mt-0.5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} numberOfLines={1}>{student.year}</Text>
                            ) : null}
                            
                            {/* Skills Pills */}
                            {student.skills && student.skills.length > 0 && (
                              <View className="flex-row flex-wrap gap-1 mt-2">
                                {student.skills.slice(0, 3).map((skill: string) => (
                                  <View 
                                    key={skill} 
                                    className={`px-1.5 py-0.5 rounded-md ${
                                      isDarkMode ? 'bg-slate-800' : 'bg-slate-50 border border-slate-100'
                                    }`}
                                  >
                                    <Text className={`text-[8px] font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>{skill}</Text>
                                  </View>
                                ))}
                              </View>
                            )}
                          </View>

                          {/* View Chevron */}
                          <Ionicons name="chevron-forward" size={16} color={isDarkMode ? '#64748B' : '#94A3B8'} />
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
