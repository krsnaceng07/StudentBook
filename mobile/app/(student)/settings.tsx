import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, TextInput, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { useUIStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../config/supabase';
import api from '../../api/client';

export default function StudentSettings() {
  const { isDarkMode } = useUIStore();
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  // Settings State variables
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailDigest, setEmailDigest] = useState(false);
  const [profileVisibility, setProfileVisibility] = useState<'public' | 'connections' | 'private'>('public');

  // Modal forms state
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [emailModalVisible, setEmailModalVisible] = useState(false);
  const [newEmail, setNewEmail] = useState('');

  // 1. Fetch current profile settings on focus
  useFocusEffect(
    useCallback(() => {
      const fetchProfile = async () => {
        try {
          const response = await api.get('/profile/me');
          if (response.data?.success && response.data.data?.profile) {
            const p = response.data.data.profile;
            setProfile(p);
            setPushEnabled(p.settings_push !== false); // default to true
            setEmailDigest(p.settings_email === true);  // default to false
            setProfileVisibility(p.settings_visibility || 'public');
          }
        } catch (error) {
          console.warn('Failed to fetch profile settings:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchProfile();
    }, [])
  );

  // 2. Instant Database Sync for Settings Toggles
  const handleToggleSetting = async (key: string, value: any) => {
    try {
      // Optimistic Update
      if (key === 'settings_push') setPushEnabled(value);
      if (key === 'settings_email') setEmailDigest(value);
      if (key === 'settings_visibility') setProfileVisibility(value);

      await api.put('/profile/update', {
        [key]: value
      });
    } catch (error) {
      console.error('Failed to sync setting to backend:', error);
      Alert.alert('Sync Error', 'Could not save setting change. Please try again.');
      // Revert state
      if (key === 'settings_push') setPushEnabled(!value);
      if (key === 'settings_email') setEmailDigest(!value);
    }
  };

  // 3. Password Update via Supabase Client Auth
  const handleUpdatePassword = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert('Validation Error', 'Please enter and confirm your new password.');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Weak Password', 'New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Mismatch', 'New passwords do not match.');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      Alert.alert('Success 🎉', 'Your account password has been updated.');
      setPasswordModalVisible(false);
      setNewPassword('');
      setConfirmPassword('');
      setCurrentPassword('');
    } catch (error: any) {
      Alert.alert('Update Failed', error.message || 'Unable to update password. Try logging in again.');
    } finally {
      setSaving(false);
    }
  };

  // 4. Email Update via Supabase Client Auth
  const handleUpdateEmail = async () => {
    if (!newEmail || !newEmail.includes('@')) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        email: newEmail
      });

      if (error) throw error;

      Alert.alert(
        'Verification Sent ✉️',
        `A confirmation link has been sent to both your current email and your new email (${newEmail}). Please click them to complete the change.`
      );
      setEmailModalVisible(false);
      setNewEmail('');
    } catch (error: any) {
      Alert.alert('Update Failed', error.message || 'Unable to start email change request.');
    } finally {
      setSaving(false);
    }
  };

  const studentName = profile?.full_name || user?.full_name || 'Tribhuvan University Student';
  const email = user?.email || 'student@email.com';
  const initials = profile?.initials || 'ST';

  if (loading) {
    return (
      <View className={`flex-1 justify-center items-center ${isDarkMode ? 'bg-[#0F172A]' : 'bg-[#F8FAFC]'}`}>
        <ActivityIndicator size="large" color="#2563EB" />
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
          Settings & Privacy
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
          <View 
            className="w-14 h-14 rounded-full border border-blue-500 items-center justify-center"
            style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
          >
            <Text className="text-blue-600 text-lg font-extrabold">{initials}</Text>
          </View>

          <View className="flex-1">
            <Text className={`text-base font-extrabold mb-0.5 ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>
              {studentName}
            </Text>
            <Text className={`text-xs mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              {email}
            </Text>
            
            {/* Student Role Badge */}
            <View className="bg-blue-50 border border-blue-100 px-3 py-1 rounded-full self-start">
              <Text className="text-blue-600 text-[10px] font-bold">Student</Text>
            </View>
          </View>
        </View>

        {/* ACCOUNT Preference list */}
        <Text className={`text-[10px] font-bold uppercase tracking-wider mb-2.5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
          Account Settings
        </Text>

        <View className={`rounded-[24px] border overflow-hidden mb-6 ${
          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'
        }`}>
          {/* Edit Profile Link */}
          <TouchableOpacity 
            onPress={() => router.push('/(student)/edit-profile')}
            className={`flex-row items-center justify-between p-4.5 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}
          >
            <View className="flex-row items-center gap-3.5">
              <View className="w-9 h-9 rounded-2xl bg-purple-50 items-center justify-center">
                <Ionicons name="person" size={16} color="#7C3AED" />
              </View>
              <View>
                <Text className={`text-xs font-bold mb-0.5 ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>Edit Profile</Text>
                <Text className="text-[10px] font-semibold text-slate-400">Update your details, skills & goals</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
          </TouchableOpacity>

          {/* Change Password Link */}
          <TouchableOpacity 
            onPress={() => setPasswordModalVisible(true)}
            className={`flex-row items-center justify-between p-4.5 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}
          >
            <View className="flex-row items-center gap-3.5">
              <View className="w-9 h-9 rounded-2xl bg-amber-50 items-center justify-center">
                <Ionicons name="lock-closed" size={16} color="#D97706" />
              </View>
              <Text className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>Change Password</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
          </TouchableOpacity>

          {/* Change Email Link */}
          <TouchableOpacity 
            onPress={() => setEmailModalVisible(true)}
            className="flex-row items-center justify-between p-4.5"
          >
            <View className="flex-row items-center gap-3.5">
              <View className="w-9 h-9 rounded-2xl bg-blue-50 items-center justify-center">
                <Ionicons name="mail" size={16} color="#2563EB" />
              </View>
              <Text className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>Change Email Address</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* NOTIFICATIONS Switches */}
        <Text className={`text-[10px] font-bold uppercase tracking-wider mb-2.5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
          Notifications & Alerts
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
              onPress={() => handleToggleSetting('settings_push', !pushEnabled)}
              className={`w-12 h-7 rounded-full p-1 ${pushEnabled ? 'bg-blue-600 items-end' : 'bg-slate-300 items-start'}`}
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
              <Text className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>Email Digest Updates</Text>
            </View>
            <TouchableOpacity 
              onPress={() => handleToggleSetting('settings_email', !emailDigest)}
              className={`w-12 h-7 rounded-full p-1 ${emailDigest ? 'bg-blue-600 items-end' : 'bg-slate-300 items-start'}`}
            >
              <View className="w-5 h-5 rounded-full bg-white shadow-sm" />
            </TouchableOpacity>
          </View>
        </View>

        {/* PRIVACY Selector */}
        <Text className={`text-[10px] font-bold uppercase tracking-wider mb-2.5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
          Privacy Settings
        </Text>

        <View className={`rounded-[24px] border overflow-hidden mb-6 p-2 ${
          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'
        }`}>
          {/* Privacy Grid Selectors */}
          <View className="gap-2 p-2">
            <Text className={`text-[11px] font-bold mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
              Who can find your profile in Discover?
            </Text>
            
            {([
              { key: 'public', label: 'Everyone (Public)', desc: 'Anyone can find and connect with you.' },
              { key: 'connections', label: 'Connections Only', desc: 'Only your active connections can view your details.' },
              { key: 'private', label: 'Nobody (Private)', desc: 'Hidden from Discover search listing.' }
            ] as const).map((opt) => {
              const isSelected = profileVisibility === opt.key;
              return (
                <TouchableOpacity
                  key={opt.key}
                  onPress={() => handleToggleSetting('settings_visibility', opt.key)}
                  className={`p-3 rounded-2xl border flex-row items-center justify-between ${
                    isSelected 
                      ? 'border-blue-500' 
                      : isDarkMode ? 'border-slate-800 bg-slate-950/40' : 'border-slate-100 bg-slate-50'
                  }`}
                  style={isSelected ? { backgroundColor: 'rgba(59, 130, 246, 0.05)' } : undefined}
                >
                  <View className="flex-1 pr-4">
                    <Text className={`text-xs font-bold mb-0.5 ${isSelected ? 'text-blue-600' : isDarkMode ? 'text-white' : 'text-slate-950'}`}>
                      {opt.label}
                    </Text>
                    <Text className="text-[10px] font-semibold text-slate-400 leading-normal">
                      {opt.desc}
                    </Text>
                  </View>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={16} color="#2563EB" />
                  )}
                </TouchableOpacity>
              );
            })}
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
          <View className="flex-row items-center justify-between p-4.5">
            <View className="flex-row items-center gap-3.5">
              <View className="w-9 h-9 rounded-2xl bg-orange-50 items-center justify-center">
                <Ionicons name="moon" size={16} color="#EA580C" />
              </View>
              <Text className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>App Dark Mode</Text>
            </View>
            <TouchableOpacity 
              onPress={() => useUIStore.getState().toggleDarkMode()}
              className={`w-12 h-7 rounded-full p-1 ${isDarkMode ? 'bg-blue-600 items-end' : 'bg-slate-300 items-start'}`}
            >
              <View className="w-5 h-5 rounded-full bg-white shadow-sm" />
            </TouchableOpacity>
          </View>
        </View>

        {/* SUPPORT & HELP */}
        <Text className={`text-[10px] font-bold uppercase tracking-wider mb-2.5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
          Support & Legal
        </Text>

        <View className={`rounded-[24px] border overflow-hidden mb-6 ${
          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'
        }`}>
          {/* Help row */}
          <TouchableOpacity className={`flex-row items-center justify-between p-4.5 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
            <View className="flex-row items-center gap-3.5">
              <View className="w-9 h-9 rounded-2xl bg-rose-50 items-center justify-center">
                <Ionicons name="help-circle" size={16} color="#E11D48" />
              </View>
              <Text className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>Help Center & FAQs</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
          </TouchableOpacity>

          {/* Privacy Policy */}
          <TouchableOpacity className="flex-row items-center justify-between p-4.5">
            <View className="flex-row items-center gap-3.5">
              <View className="w-9 h-9 rounded-2xl bg-slate-50 items-center justify-center">
                <Ionicons name="shield-checkmark" size={16} color="#475569" />
              </View>
              <Text className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>Privacy Policy & Terms</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity 
          onPress={async () => {
            await logout();
          }}
          className={`p-5 rounded-[24px] border mt-2 flex-row items-center justify-between ${
            isDarkMode ? 'bg-red-950/25 border-red-900/30' : 'bg-red-50 border-red-100'
          }`}
        >
          <View className="flex-row items-center gap-3">
            <Ionicons name="log-out-outline" size={20} color="#EF4444" />
            <Text className="text-xs font-bold text-red-500">Sign Out of Account</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#EF4444" />
        </TouchableOpacity>

      </ScrollView>

      {/* CHANGE PASSWORD MODAL */}
      <Modal
        visible={passwordModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPasswordModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/60 px-6">
          <View className={`w-full p-6 rounded-[28px] border ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <View className="flex-row items-center justify-between mb-4">
              <Text className={`text-base font-extrabold ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>
                Change Password
              </Text>
              <TouchableOpacity onPress={() => setPasswordModalVisible(false)}>
                <Ionicons name="close" size={20} color={isDarkMode ? 'white' : 'black'} />
              </TouchableOpacity>
            </View>

            <View className="gap-4.5">
              <View>
                <Text className={`text-[10px] font-bold mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>New Password</Text>
                <TextInput
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="Min 6 characters"
                  placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'}
                  secureTextEntry
                  className={`rounded-2xl border px-4 py-3 text-xs font-semibold ${
                    isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </View>

              <View>
                <Text className={`text-[10px] font-bold mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Confirm Password</Text>
                <TextInput
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Repeat new password"
                  placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'}
                  secureTextEntry
                  className={`rounded-2xl border px-4 py-3 text-xs font-semibold ${
                    isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </View>

              <TouchableOpacity
                onPress={handleUpdatePassword}
                disabled={saving}
                className="bg-blue-600 py-3.5 rounded-2xl items-center justify-center mt-2"
              >
                {saving ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text className="text-white text-xs font-bold">Update Password</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* CHANGE EMAIL MODAL */}
      <Modal
        visible={emailModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setEmailModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/60 px-6">
          <View className={`w-full p-6 rounded-[28px] border ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <View className="flex-row items-center justify-between mb-4">
              <Text className={`text-base font-extrabold ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>
                Change Email Address
              </Text>
              <TouchableOpacity onPress={() => setEmailModalVisible(false)}>
                <Ionicons name="close" size={20} color={isDarkMode ? 'white' : 'black'} />
              </TouchableOpacity>
            </View>

            <View className="gap-4.5">
              <View>
                <Text className={`text-[10px] font-bold mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>New Email Address</Text>
                <TextInput
                  value={newEmail}
                  onChangeText={setNewEmail}
                  placeholder="aarav@university.edu"
                  placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  className={`rounded-2xl border px-4 py-3 text-xs font-semibold ${
                    isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </View>

              <TouchableOpacity
                onPress={handleUpdateEmail}
                disabled={saving}
                className="bg-blue-600 py-3.5 rounded-2xl items-center justify-center mt-2"
              >
                {saving ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text className="text-white text-xs font-bold">Request Email Change</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
