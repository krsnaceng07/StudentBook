import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, Modal, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useUIStore } from '../../store/uiStore';
import api from '../../api/client';
import { supabase } from '../../config/supabase';

export default function EventDetailsPage() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isDarkMode } = useUIStore();
  
  const [bookmarked, setBookmarked] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [regCount, setRegCount] = useState(0);
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Dynamic Team Workspace States
  const [teamData, setTeamData] = useState<any>(null);
  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [formingTeam, setFormingTeam] = useState(false);

  // Student Registration Form States
  const [showRegFormModal, setShowRegFormModal] = useState(false);
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formDept, setFormDept] = useState('');
  const [formYear, setFormYear] = useState('');
  const [formRemarks, setFormRemarks] = useState('');
  const [submittingReg, setSubmittingReg] = useState(false);

  const fetchStudentProfileForForm = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      const { data: profile } = await supabase
        .from('extended_profiles')
        .select('full_name, department, university_year')
        .eq('id', session.user.id)
        .maybeSingle();
        
      if (profile) {
        setFormName(profile.full_name || '');
        setFormEmail(session.user.email || '');
        setFormDept(profile.department || '');
        setFormYear(profile.university_year || '');
      } else {
        setFormEmail(session.user.email || '');
      }
    } catch (err) {
      console.warn('Failed to pre-fill student registration form:', err);
    }
  };

  const fetchEventDetails = async () => {
    if (!id) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const response = await api.get(`/events/${id}`);
      if (response.data?.success && response.data?.data) {
        const ev = response.data.data;
        setEvent(ev);
        setBookmarked(!!ev.isBookmarked);
        setRegistered(!!ev.isRegistered);
        setRegCount(ev.registrationCount || 0);
      } else {
        setErrorMsg('Failed to load event details.');
      }
    } catch (error: any) {
      console.error('Error loading event details:', error);
      setErrorMsg('Failed to connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamData = async () => {
    try {
      const response = await api.get('/student/teams/my');
      if (response.data?.success) {
        setTeamData(response.data.data);
      }
    } catch (err) {
      console.warn('Failed to fetch student team membership:', err);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchEventDetails();
      fetchTeamData();
    }, [id])
  );

  // Supabase Postgres Realtime Subscription for live updates!
  useEffect(() => {
    if (!id) return;

    const channel = supabase
      .channel(`event-detail-realtime-${id}`)
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'events',
          filter: `id=eq.${id}`
        },
        (payload) => {
          console.log('[Realtime] Active event detail updated:', payload);
          // Directly fetch fresh data without loading spinners to maintain perfect UI state
          api.get(`/events/${id}`).then((res) => {
            if (res.data?.success && res.data?.data) {
              const ev = res.data.data;
              setEvent(ev);
              setBookmarked(!!ev.isBookmarked);
              setRegistered(!!ev.isRegistered);
              setRegCount(ev.registrationCount || 0);
            }
          }).catch(err => console.warn('Realtime event sync fetch failed:', err));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  const handleToggleBookmark = async () => {
    if (!id || !event) return;
    const nextBookmarked = !bookmarked;
    setBookmarked(nextBookmarked); // Optimistic UI update

    try {
      if (nextBookmarked) {
        await api.post(`/events/${id}/bookmark`);
      } else {
        await api.delete(`/events/${id}/bookmark`);
      }
    } catch (err) {
      console.warn('Failed to toggle bookmark status on server:', err);
      setBookmarked(!nextBookmarked); // Revert state on failure
      Alert.alert('Error', 'Could not save bookmark. Please try again.');
    }
  };

  const handleToggleRegister = async () => {
    if (!id || !event) return;
    
    if (registered) {
      // Prompt student before unregistering
      Alert.alert(
        'Cancel Registration',
        'Are you sure you want to cancel your registration for this event?',
        [
          { text: 'No', style: 'cancel' },
          {
            text: 'Yes, Cancel',
            style: 'destructive',
            onPress: async () => {
              setRegistered(false);
              setRegCount(prev => Math.max(0, prev - 1));
              try {
                await api.delete(`/events/${id}/register`);
              } catch (err: any) {
                console.warn('Failed to unregister on server:', err);
                setRegistered(true);
                setRegCount(prev => prev + 1);
                Alert.alert('Error', 'Could not cancel registration. Please try again.');
              }
            }
          }
        ]
      );
    } else {
      // Fetch details and open registration form modal
      await fetchStudentProfileForForm();
      setFormRemarks('');
      setShowRegFormModal(true);
    }
  };

  const handleConfirmRegistration = async () => {
    if (!formName.trim()) {
      Alert.alert('Error', 'Full Name is required.');
      return;
    }
    if (!formEmail.trim()) {
      Alert.alert('Error', 'Email is required.');
      return;
    }
    
    setSubmittingReg(true);
    try {
      const response = await api.post(`/events/${id}/register`, {
        registration_details: {
          full_name: formName.trim(),
          email: formEmail.trim(),
          department: formDept.trim(),
          year: formYear.trim(),
          remarks: formRemarks.trim()
        }
      });
      
      if (response.data?.success) {
        setRegistered(true);
        setRegCount(prev => prev + 1);
        setShowRegFormModal(false);
        Alert.alert('Success', 'Successfully registered for this event!');
      } else {
        Alert.alert('Error', 'Failed to register. Please try again.');
      }
    } catch (err: any) {
      console.warn('Failed to register on server:', err);
      Alert.alert('Error', err.response?.data?.error || 'Could not complete registration. Please try again.');
    } finally {
      setSubmittingReg(false);
    }
  };

  const handleExternalApply = () => {
    if (event?.external_link) {
      Linking.openURL(event.external_link).catch(err => {
        console.warn('Failed to open external URL:', err);
        Alert.alert('Error', 'Could not open external link. Please check the URL.');
      });
    } else {
      Alert.alert('Error', 'External registration link is not provided by college organizer.');
    }
  };

  const handleCreateTeam = async () => {
    if (!newTeamName.trim() || !event) return;
    setFormingTeam(true);
    try {
      const response = await api.post('/student/teams', {
        name: newTeamName.trim(),
        event_name: event.title,
        max_members: event.max_team || 4
      });
      if (response.data?.success) {
        setShowCreateTeamModal(false);
        setNewTeamName('');
        await fetchTeamData();
        router.push('/teams');
      }
    } catch (err: any) {
      console.warn('Failed to form collaboration team:', err);
      Alert.alert('Error', err.response?.data?.error || 'Failed to form collaboration team.');
    } finally {
      setFormingTeam(false);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'TBD';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const formatDeadline = (dateStr: string) => {
    if (!dateStr) return 'Not Specified';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <SafeAreaView className={`flex-1 items-center justify-center ${isDarkMode ? 'bg-[#0F172A]' : 'bg-[#F8FAFC]'}`}>
        <ActivityIndicator size="large" color="#2563EB" />
      </SafeAreaView>
    );
  }

  if (errorMsg || !event) {
    return (
      <SafeAreaView className={`flex-1 items-center justify-center px-6 ${isDarkMode ? 'bg-[#0F172A]' : 'bg-[#F8FAFC]'}`}>
        <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
        <Text className={`text-base font-bold mt-4 text-center ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{errorMsg || 'Event not found'}</Text>
        <TouchableOpacity 
          onPress={fetchEventDetails}
          className="mt-6 bg-[#2563EB] px-6 py-3 rounded-2xl"
        >
          <Text className="text-white font-bold">Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const teamSizeText = event.min_team || event.max_team
    ? `${event.min_team || 2}-${event.max_team || 4} members`
    : event.member_limit
      ? `${event.member_limit} members`
      : 'Individual Entry';

  const tags = event.tags && event.tags.length > 0
    ? event.tags
    : [event.event_type || 'Event', 'Tech'];

  return (
    <SafeAreaView 
      className={`flex-1 ${isDarkMode ? 'bg-[#0F172A]' : 'bg-[#F8FAFC]'}`}
      edges={['top']}
    >
      {/* Top Blue Header Banner */}
      <View className="bg-[#2563EB] px-6 pt-6 pb-12 rounded-b-[36px]">
        {/* Navigation row */}
        <View className="flex-row justify-between items-center mb-10">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="w-10 h-10 rounded-2xl items-center justify-center bg-white/20 border border-white/10"
          >
            <Ionicons name="arrow-back" size={20} color="white" />
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={handleToggleBookmark}
            className={`w-10 h-10 rounded-2xl items-center justify-center ${
              bookmarked ? 'bg-[#F59E0B]' : 'bg-white/20'
            } border border-white/10`}
          >
            <Ionicons name={bookmarked ? "bookmark" : "bookmark-outline"} size={18} color="white" />
          </TouchableOpacity>
        </View>

        <Text className="text-white text-3xl font-extrabold mb-1">{event.title}</Text>
        <Text className="text-blue-100 text-sm font-semibold">
          {event.organizer || 'Tribhuvan University'} · {regCount} Registered
        </Text>
      </View>

      <ScrollView 
        className="flex-1 px-6 -mt-6"
        showsVerticalScrollIndicator={false}
      >
        {/* 2x2 Grid Stats */}
        <View className="flex-row flex-wrap justify-between gap-3 mb-4">
          {/* Card 1: Date */}
          <View className={`w-[48%] rounded-3xl p-5 border ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100/80 shadow-sm'
          }`}>
            <Text className="text-xl mb-2">📅</Text>
            <Text className={`text-[10px] font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-405'} uppercase mb-0.5`}>Date</Text>
            <Text className={`text-xs font-bold leading-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{formatDate(event.event_date)}</Text>
          </View>

          {/* Card 2: Deadline */}
          <View className={`w-[48%] rounded-3xl p-5 border ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100/80 shadow-sm'
          }`}>
            <Text className="text-xl mb-2">⏰</Text>
            <Text className={`text-[10px] font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-405'} uppercase mb-0.5`}>Deadline</Text>
            <Text className={`text-xs font-bold leading-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{formatDeadline(event.reg_deadline)}</Text>
          </View>

          {/* Card 3: Venue */}
          <View className={`w-[48%] rounded-3xl p-5 border ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100/80 shadow-sm'
          }`}>
            <Text className="text-xl mb-2">📍</Text>
            <Text className={`text-[10px] font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-405'} uppercase mb-0.5`}>Venue</Text>
            <Text className={`text-xs font-bold leading-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{event.location || (event.is_online ? 'Online Event' : 'TBD')}</Text>
          </View>

          {/* Card 4: Team Size */}
          <View className={`w-[48%] rounded-3xl p-5 border ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100/80 shadow-sm'
          }`}>
            <Text className="text-xl mb-2">👥</Text>
            <Text className={`text-[10px] font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-405'} uppercase mb-0.5`}>Team Size</Text>
            <Text className={`text-xs font-bold leading-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{teamSizeText}</Text>
          </View>
        </View>

        {/* Prize Pool Highlight Card */}
        <View className={`rounded-3xl p-6 border flex-row items-center gap-4 mb-4 ${
          isDarkMode ? 'bg-[#78350F]/20 border-[#F59E0B]/30' : 'bg-[#FFFBEB] border-[#FEF3C7]'
        }`}>
          <Text className="text-2xl">🏆</Text>
          <View>
            <Text className={`text-[10px] font-bold uppercase tracking-wider ${
              isDarkMode ? 'text-amber-400' : 'text-amber-600'
            }`}>Prize Pool</Text>
            <Text className={`text-lg font-extrabold ${
              isDarkMode ? 'text-amber-300' : 'text-amber-800'
            }`}>{event.prize_pool || 'Certificate & Swag'}</Text>
          </View>
        </View>

        {/* About Card */}
        <View className={`rounded-3xl p-6 border mb-4 ${
          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'
        }`}>
          <Text className={`text-sm font-extrabold mb-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>About this Event</Text>
          <Text className={`text-xs leading-relaxed font-semibold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            {event.description || 'No description provided.'}
          </Text>
        </View>

        {/* Tags Card */}
        <View className={`rounded-3xl p-6 border mb-10 ${
          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'
        }`}>
          <Text className={`text-sm font-extrabold mb-3.5 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Tags</Text>
          <View className="flex-row flex-wrap gap-2">
            {tags.map((tag: string) => (
              <View 
                key={tag} 
                className={`px-4 py-2 rounded-2xl ${
                  isDarkMode ? 'bg-slate-800' : 'bg-slate-50 border border-slate-100'
                }`}
              >
                <Text className={`text-xs font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Bar */}
      <View style={{
        paddingHorizontal: 24,
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: isDarkMode ? '#1E293B' : '#E2E8F0',
        backgroundColor: isDarkMode ? '#0F172A' : '#FFFFFF',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12
      }}>
        {(() => {
          const isExternal = event.registration_type === 'external';

          if (isExternal) {
            return (
              <TouchableOpacity 
                onPress={handleExternalApply}
                activeOpacity={0.85}
                style={{
                  flex: 1,
                  backgroundColor: '#4F46E5', // Indigo-600 for external link redirects
                  paddingVertical: 14,
                  borderRadius: 16,
                  alignItems: 'center',
                  justifyContent: 'center',
                  shadowColor: '#4F46E5',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.2,
                  shadowRadius: 6,
                  elevation: 4
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Ionicons name="open-outline" size={20} color="white" />
                  <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 15 }}>Apply on External Site</Text>
                </View>
              </TouchableOpacity>
            );
          }

          // Internal direct registration handling
          if (!registered) {
            return (
              <TouchableOpacity 
                onPress={handleToggleRegister}
                activeOpacity={0.85}
                style={{
                  flex: 1,
                  backgroundColor: '#2563EB', // Blue-600
                  paddingVertical: 14,
                  borderRadius: 16,
                  alignItems: 'center',
                  justifyContent: 'center',
                  shadowColor: '#2563EB',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.2,
                  shadowRadius: 6,
                  elevation: 4
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Ionicons name="checkmark-done-circle" size={20} color="white" />
                  <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 15 }}>Register for Event</Text>
                </View>
              </TouchableOpacity>
            );
          }

          // Registered internally: split grid showing registered check on left and team building workspace on right!
          return (
            <View style={{ flex: 1, flexDirection: 'row', gap: 10 }}>
              {/* Left Button: Cancel / Registered */}
              <TouchableOpacity 
                onPress={handleToggleRegister}
                activeOpacity={0.85}
                style={{
                  flex: 0.45,
                  backgroundColor: '#10B981', // Green-500
                  paddingVertical: 14,
                  borderRadius: 16,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 1,
                  borderColor: isDarkMode ? '#065F46' : '#A7F3D0'
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Ionicons name="checkmark-circle" size={16} color="white" />
                  <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 13 }}>Registered</Text>
                </View>
              </TouchableOpacity>

              {/* Right Button: Team Workspace */}
              {teamData?.team ? (
                <TouchableOpacity 
                  onPress={() => router.push('/teams')}
                  activeOpacity={0.85}
                  style={{
                    flex: 0.55,
                    backgroundColor: '#1F2937', // Slate-800
                    paddingVertical: 14,
                    borderRadius: 16,
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Ionicons name="people" size={16} color="white" />
                    <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 13 }} numberOfLines={1}>Team Workspace</Text>
                  </View>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity 
                  onPress={() => setShowCreateTeamModal(true)}
                  activeOpacity={0.85}
                  style={{
                    flex: 0.55,
                    backgroundColor: '#2563EB', // Blue-600
                    paddingVertical: 14,
                    borderRadius: 16,
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Ionicons name="add-circle" size={16} color="white" />
                    <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 13 }} numberOfLines={1}>Form Team</Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>
          );
        })()}
      </View>

      {/* Registration Form Modal */}
      <Modal
        visible={showRegFormModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowRegFormModal(false)}
      >
        <View style={{
          flex: 1,
          justifyContent: 'flex-end',
          backgroundColor: 'rgba(15, 23, 42, 0.65)'
        }}>
          <View style={{
            height: '80%',
            borderTopLeftRadius: 36,
            borderTopRightRadius: 36,
            backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
            paddingTop: 24,
            paddingHorizontal: 24
          }}>
            {/* Header */}
            <View className="flex-row justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
              <View className="flex-1 mr-4">
                <Text className={`text-base font-extrabold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  Event Registration
                </Text>
                <Text className={`text-[10px] font-semibold mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} numberOfLines={1}>
                  Provide details to college organizer for {event.title}
                </Text>
              </View>
              
              <TouchableOpacity
                onPress={() => setShowRegFormModal(false)}
                className={`w-9 h-9 rounded-full items-center justify-center ${
                  isDarkMode ? 'bg-slate-800' : 'bg-slate-50'
                }`}
              >
                <Ionicons name="close" size={20} color={isDarkMode ? 'white' : '#64748B'} />
              </TouchableOpacity>
            </View>

            <ScrollView 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingVertical: 20, paddingBottom: 60 }}
            >
              {/* Full Name */}
              <View className="mb-4">
                <Text className={`text-[10px] font-extrabold uppercase mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Full Name *</Text>
                <TextInput
                  placeholder="e.g. Krsna Dev"
                  placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'}
                  value={formName}
                  onChangeText={setFormName}
                  className={`w-full px-4 py-3 rounded-2xl border ${
                    isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-[#F8FAFC] border-slate-100 text-slate-900'
                  } font-semibold text-xs`}
                />
              </View>

              {/* Email */}
              <View className="mb-4">
                <Text className={`text-[10px] font-extrabold uppercase mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Email Address *</Text>
                <TextInput
                  placeholder="e.g. student@tu.edu.np"
                  placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'}
                  value={formEmail}
                  onChangeText={setFormEmail}
                  keyboardType="email-address"
                  className={`w-full px-4 py-3 rounded-2xl border ${
                    isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-[#F8FAFC] border-slate-100 text-slate-900'
                  } font-semibold text-xs`}
                />
              </View>

              {/* Grid: Department & Year */}
              <View className="flex-row justify-between mb-4">
                <View className="w-[48%]">
                  <Text className={`text-[10px] font-extrabold uppercase mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Department</Text>
                  <TextInput
                    placeholder="e.g. CSIT / BCT"
                    placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'}
                    value={formDept}
                    onChangeText={setFormDept}
                    className={`w-full px-4 py-3 rounded-2xl border ${
                      isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-[#F8FAFC] border-slate-100 text-slate-900'
                    } font-semibold text-xs`}
                  />
                </View>

                <View className="w-[48%]">
                  <Text className={`text-[10px] font-extrabold uppercase mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Year</Text>
                  <TextInput
                    placeholder="e.g. 3rd Year"
                    placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'}
                    value={formYear}
                    onChangeText={setFormYear}
                    className={`w-full px-4 py-3 rounded-2xl border ${
                      isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-[#F8FAFC] border-slate-100 text-slate-900'
                    } font-semibold text-xs`}
                  />
                </View>
              </View>

              {/* Remarks/Motivation */}
              <View className="mb-6">
                <Text className={`text-[10px] font-extrabold uppercase mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Motivation / Remarks</Text>
                <TextInput
                  placeholder="Tell the organizer why you want to participate, any relevant skills, or special remarks..."
                  placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'}
                  value={formRemarks}
                  onChangeText={setFormRemarks}
                  multiline={true}
                  numberOfLines={4}
                  style={{ textAlignVertical: 'top', height: 100 }}
                  className={`w-full px-4 py-3 rounded-2xl border ${
                    isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-[#F8FAFC] border-slate-100 text-slate-900'
                  } font-semibold text-xs`}
                />
              </View>

              {/* Action Buttons */}
              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={() => setShowRegFormModal(false)}
                  className={`flex-1 py-3.5 rounded-2xl items-center justify-center ${
                    isDarkMode ? 'bg-slate-800' : 'bg-slate-100'
                  }`}
                >
                  <Text className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-slate-700'}`}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleConfirmRegistration}
                  disabled={submittingReg}
                  className="flex-1 py-3.5 rounded-2xl bg-blue-600 active:bg-blue-700 items-center justify-center flex-row gap-1.5"
                >
                  {submittingReg && <ActivityIndicator size="small" color="white" />}
                  <Text className="text-white text-xs font-bold">Confirm Register</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Create Team Premium Modal */}
      <Modal
        visible={showCreateTeamModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setShowCreateTeamModal(false);
          setNewTeamName('');
        }}
      >
        <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(15, 23, 42, 0.65)'
        }}>
          <View style={{
            width: '85%',
            borderRadius: 28,
            borderWidth: 1,
            borderColor: isDarkMode ? '#334155' : '#E2E8F0',
            backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
            padding: 28,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.25,
            shadowRadius: 15,
            elevation: 10
          }}>
            <Text style={{
              fontSize: 20,
              fontWeight: '900',
              marginBottom: 8,
              color: isDarkMode ? '#FFFFFF' : '#0F172A'
            }}>Form Team Workspace</Text>
            
            <Text style={{
              fontSize: 12,
              marginBottom: 20,
              lineHeight: 18,
              color: isDarkMode ? '#94A3B8' : '#64748B'
            }}>
              Create a dedicated workspace for {event.title}. Connect with teammates and tackle the project together!
            </Text>

            <TextInput
              placeholder="Enter team name (e.g. Code Wizards)"
              placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'}
              value={newTeamName}
              onChangeText={setNewTeamName}
              style={{
                width: '100%',
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: isDarkMode ? '#475569' : '#CBD5E1',
                backgroundColor: isDarkMode ? '#0F172A' : '#F8FAFC',
                color: isDarkMode ? '#FFFFFF' : '#0F172A',
                fontSize: 14,
                marginBottom: 24
              }}
            />

            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12 }}>
              <TouchableOpacity
                onPress={() => {
                  setShowCreateTeamModal(false);
                  setNewTeamName('');
                }}
                style={{
                  paddingHorizontal: 18,
                  paddingVertical: 10,
                  borderRadius: 12,
                  backgroundColor: isDarkMode ? '#334155' : '#E2E8F0'
                }}
              >
                <Text style={{
                  fontSize: 13,
                  fontWeight: 'bold',
                  color: isDarkMode ? '#FFFFFF' : '#475569'
                }}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleCreateTeam}
                disabled={formingTeam || !newTeamName.trim()}
                style={{
                  paddingHorizontal: 18,
                  paddingVertical: 10,
                  borderRadius: 12,
                  backgroundColor: '#2563EB',
                  opacity: (!newTeamName.trim() || formingTeam) ? 0.6 : 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                {formingTeam && <ActivityIndicator size="small" color="white" />}
                <Text style={{
                  fontSize: 13,
                  fontWeight: 'bold',
                  color: '#FFFFFF'
                }}>Create Workspace</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
