import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useUIStore } from '../../store/uiStore';
import api from '../../api/client';

const EVENT_TYPES = ['Hackathon', 'Workshop', 'Competition', 'Seminar', 'Other'];

export default function PostEvent() {
  const router = useRouter();
  const { isDarkMode } = useUIStore();

  const [title, setTitle] = useState('');
  const [eventType, setEventType] = useState('Hackathon');
  const [date, setDate] = useState('');
  const [venue, setVenue] = useState('');
  const [prize, setPrize] = useState('');
  const [regDeadline, setRegDeadline] = useState('');
  const [isOnline, setIsOnline] = useState(false);
  const [minTeam, setMinTeam] = useState('2');
  const [maxTeam, setMaxTeam] = useState('4');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePublish = async () => {
    if (!title || !date || !venue) {
      Alert.alert('Error', 'Please fill out Title, Date, and Venue!');
      return;
    }

    let formattedDate;
    try {
      formattedDate = date ? new Date(date).toISOString() : new Date().toISOString();
    } catch {
      formattedDate = new Date().toISOString();
    }

    let formattedDeadline = null;
    if (regDeadline) {
      try {
        formattedDeadline = new Date(regDeadline).toISOString();
      } catch {
        formattedDeadline = null;
      }
    }

    setLoading(true);
    try {
      const response = await api.post('/college/events', {
        title,
        description,
        event_date: formattedDate,
        location: venue,
        event_type: eventType,
        tags: [eventType.toLowerCase(), 'tech', 'student'],
        member_limit: maxTeam ? parseInt(maxTeam) : 4,
        reg_deadline: formattedDeadline,
        is_online: isOnline,
        min_team: minTeam ? parseInt(minTeam) : 2,
        max_team: maxTeam ? parseInt(maxTeam) : 4,
        prize_pool: prize
      });

      if (response.data?.success) {
        Alert.alert('Success', 'Event posted successfully!');
        router.back();
      } else {
        Alert.alert('Error', 'Failed to post event.');
      }
    } catch (error: any) {
      console.error('Failed to post event:', error);
      Alert.alert('Error', error.response?.data?.error || 'Failed to post event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView 
      className={`flex-1 ${isDarkMode ? 'bg-[#0F172A]' : 'bg-[#F8FAFC]'}`}
      edges={['top']}
    >
      {/* Top Header */}
      <View className="px-6 py-4 flex-row items-center gap-4">
        <TouchableOpacity 
          onPress={() => router.back()}
          className={`w-10 h-10 rounded-2xl items-center justify-center border ${
            isDarkMode ? 'bg-slate-805 border-slate-700' : 'bg-slate-50 border-slate-100'
          }`}
        >
          <Ionicons name="arrow-back" size={20} color={isDarkMode ? 'white' : '#1E293B'} />
        </TouchableOpacity>
        <Text className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Post New Event</Text>
      </View>

      <ScrollView 
        className="flex-1 px-6"
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-5 pb-10">
          {/* Event Title */}
          <View>
            <Text className={`text-xs font-bold uppercase mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Event Title</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. HackTU 2026"
              placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'}
              className={`p-4.5 rounded-2xl border text-sm font-semibold ${
                isDarkMode 
                  ? 'bg-slate-900 border-slate-800 text-white focus:border-[#10B981]' 
                  : 'bg-white border-slate-100 text-slate-800 focus:border-[#10B981]'
              }`}
            />
          </View>

          {/* Event Type Pills */}
          <View>
            <Text className={`text-xs font-bold uppercase mb-2.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Event Type</Text>
            <View className="flex-row gap-2">
              {EVENT_TYPES.map((type) => {
                const isSelected = eventType === type;
                return (
                  <TouchableOpacity
                    key={type}
                    onPress={() => setEventType(type)}
                    className={`px-5 py-2.5 rounded-2xl border-2 ${
                      isSelected 
                        ? 'bg-[#10B981] border-[#10B981]' 
                        : isDarkMode 
                          ? 'bg-slate-900 border-slate-800' 
                          : 'bg-white border-slate-100'
                    }`}
                  >
                    <Text className={`text-xs font-bold ${
                      isSelected ? 'text-white' : isDarkMode ? 'text-slate-300' : 'text-slate-600'
                    }`}>{type}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Date */}
          <View>
            <Text className={`text-xs font-bold uppercase mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Event Date</Text>
            <TextInput
              value={date}
              onChangeText={setDate}
              placeholder="e.g. June 15, 2026"
              placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'}
              className={`p-4.5 rounded-2xl border text-sm font-semibold ${
                isDarkMode 
                  ? 'bg-slate-900 border-slate-800 text-white focus:border-[#10B981]' 
                  : 'bg-white border-slate-100 text-slate-800 focus:border-[#10B981]'
              }`}
            />
          </View>

          {/* Venue */}
          <View>
            <Text className={`text-xs font-bold uppercase mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Venue</Text>
            <TextInput
              value={venue}
              onChangeText={setVenue}
              placeholder="e.g. Pulchowk Engineering Campus"
              placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'}
              className={`p-4.5 rounded-2xl border text-sm font-semibold ${
                isDarkMode 
                  ? 'bg-slate-900 border-slate-800 text-white focus:border-[#10B981]' 
                  : 'bg-white border-slate-100 text-slate-800 focus:border-[#10B981]'
              }`}
            />
          </View>

          {/* Prize Pool */}
          <View>
            <Text className={`text-xs font-bold uppercase mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Prize Pool</Text>
            <TextInput
              value={prize}
              onChangeText={setPrize}
              placeholder="e.g. NPR 1,00,000"
              placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'}
              className={`p-4.5 rounded-2xl border text-sm font-semibold ${
                isDarkMode 
                  ? 'bg-slate-900 border-slate-800 text-white focus:border-[#10B981]' 
                  : 'bg-white border-slate-100 text-slate-800 focus:border-[#10B981]'
              }`}
            />
          </View>

          {/* Registration Deadline */}
          <View>
            <Text className={`text-xs font-bold uppercase mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Registration Deadline</Text>
            <TextInput
              value={regDeadline}
              onChangeText={setRegDeadline}
              placeholder="e.g. June 01, 2026"
              placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'}
              className={`p-4.5 rounded-2xl border text-sm font-semibold ${
                isDarkMode 
                  ? 'bg-slate-900 border-slate-800 text-white focus:border-[#10B981]' 
                  : 'bg-white border-slate-100 text-slate-800 focus:border-[#10B981]'
              }`}
            />
          </View>

          {/* Online Event Switch */}
          <View className={`flex-row items-center justify-between p-4.5 rounded-2xl border ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
          }`}>
            <View>
              <Text className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Online Event</Text>
              <Text className={`text-[10px] font-semibold mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-400'}`}>This event will be hosted virtually</Text>
            </View>
            <Switch
              value={isOnline}
              onValueChange={setIsOnline}
              trackColor={{ false: '#94A3B8', true: '#10B981' }}
              thumbColor={isOnline ? '#FFFFFF' : '#F1F5F9'}
            />
          </View>

          {/* Team Size Limits */}
          <View className="flex-row justify-between gap-3">
            <View className="flex-1">
              <Text className={`text-xs font-bold uppercase mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Min Team Size</Text>
              <TextInput
                value={minTeam}
                onChangeText={setMinTeam}
                keyboardType="numeric"
                placeholder="2"
                placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'}
                className={`p-4.5 rounded-2xl border text-sm font-semibold ${
                  isDarkMode 
                    ? 'bg-slate-900 border-slate-800 text-white focus:border-[#10B981]' 
                    : 'bg-white border-slate-100 text-slate-800 focus:border-[#10B981]'
                }`}
              />
            </View>
            <View className="flex-1">
              <Text className={`text-xs font-bold uppercase mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Max Team Size</Text>
              <TextInput
                value={maxTeam}
                onChangeText={setMaxTeam}
                keyboardType="numeric"
                placeholder="4"
                placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'}
                className={`p-4.5 rounded-2xl border text-sm font-semibold ${
                  isDarkMode 
                    ? 'bg-slate-900 border-slate-800 text-white focus:border-[#10B981]' 
                    : 'bg-white border-slate-100 text-slate-800 focus:border-[#10B981]'
                }`}
              />
            </View>
          </View>

          {/* Description */}
          <View>
            <Text className={`text-xs font-bold uppercase mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Description</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Provide a detailed description of your event..."
              placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              className={`p-4.5 rounded-2xl border text-sm font-semibold ${
                isDarkMode 
                  ? 'bg-slate-900 border-slate-800 text-white focus:border-[#10B981]' 
                  : 'bg-white border-slate-100 text-slate-800 focus:border-[#10B981]'
              } h-32`}
            />
          </View>

          {/* Publish Event Button */}
          <TouchableOpacity 
            onPress={handlePublish}
            disabled={loading}
            className="bg-[#10B981] py-4.5 rounded-2xl items-center justify-center mt-3 shadow-md active:bg-emerald-600 flex-row gap-2"
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <Text className="text-white text-base font-bold tracking-wide">Publish Event</Text>
                <Ionicons name="cloud-upload-outline" size={16} color="white" />
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
