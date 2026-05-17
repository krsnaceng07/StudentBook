import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { useUIStore } from '../../store/uiStore';
import api from '../../api/client';

interface EventData {
  id: string;
  title: string;
  event_date: string;
  event_type: string;
}

export default function ManageEvents() {
  const router = useRouter();
  const { isDarkMode } = useUIStore();
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchEvents = async () => {
    try {
      const response = await api.get('/api/v1/events/my-events');
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
              const response = await api.delete(`/api/v1/events/${id}`);
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
    if (t.includes('hackathon')) return { border: 'border-l-[#2563EB]', bg: isDarkMode ? 'bg-blue-950' : 'bg-blue-50', text: isDarkMode ? 'text-blue-400' : 'text-blue-600' };
    if (t.includes('seminar') || t.includes('workshop')) return { border: 'border-l-[#8B5CF6]', bg: isDarkMode ? 'bg-purple-950' : 'bg-purple-50', text: isDarkMode ? 'text-purple-400' : 'text-purple-600' };
    return { border: 'border-l-[#10B981]', bg: isDarkMode ? 'bg-emerald-950' : 'bg-emerald-50', text: isDarkMode ? 'text-emerald-400' : 'text-emerald-600' };
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
          onPress={() => router.push('/college/post-event')}
          className="bg-[#10B981] py-4 rounded-2xl items-center justify-center mb-6 shadow-sm active:bg-emerald-600"
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
              return (
                <View key={event.id} className={`rounded-3xl border p-5 border-l-4 ${colors.border} ${
                  isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'
                }`}>
                  <View className="flex-row justify-between items-start mb-1.5">
                    <Text className={`text-sm font-extrabold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
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
                  <View className="flex-row gap-2">
                    <TouchableOpacity 
                      className="px-5 py-2 rounded-xl border border-[#EF4444] bg-red-500/5"
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
    </SafeAreaView>
  );
}
