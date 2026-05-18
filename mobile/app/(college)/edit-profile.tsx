import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useUIStore } from '../../store/uiStore';
import client from '../../api/client';

type CollegeType = 'University' | 'Engineering' | 'Management' | 'Polytechnic' | 'Other';

export default function EditCollegeProfile() {
  const { isDarkMode } = useUIStore();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // College Profile Fields
  const [collegeName, setCollegeName] = useState('');
  const [collegeType, setCollegeType] = useState<CollegeType>('Other');
  const [location, setLocation] = useState('');
  const [establishedYear, setEstablishedYear] = useState('');
  const [website, setWebsite] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [about, setAbout] = useState('');

  // Fetch initial profile
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await client.get('/profile/me');
        if (response.data && response.data.success && response.data.data.profile) {
          const p = response.data.data.profile;
          setCollegeName(p.full_name || '');
          setCollegeType(p.college_type || 'Other');
          setLocation(p.location || '');
          setEstablishedYear(p.established_year || '');
          setWebsite(p.website || '');
          setContactEmail(p.contact_email || '');
          setAbout(p.bio || '');
        }
      } catch (error) {
        console.warn('Failed to load college profile details for editing:', error);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  // Save changes
  const handleSave = async () => {
    if (!collegeName.trim()) {
      Alert.alert('Required Info', 'Please enter your College Name.');
      return;
    }

    setSaving(true);
    try {
      const response = await client.put('/profile/update', {
        full_name: collegeName.trim(),
        college_type: collegeType,
        location: location.trim(),
        established_year: establishedYear.trim(),
        website: website.trim(),
        contact_email: contactEmail.trim(),
        bio: about.trim(),
      });

      if (response.data?.success) {
        Alert.alert('Success 🎉', 'Your profile details have been saved!', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      } else {
        throw new Error(response.data?.error || 'Save failed');
      }
    } catch (error: any) {
      console.error('Failed to save profile:', error);
      Alert.alert('Save Failed', error.message || 'Unable to update profile. Please try again.');
    } finally {
      setSaving(false);
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
      <View className={`px-6 py-4 flex-row items-center justify-between border-b ${
        isDarkMode ? 'bg-[#0F172A] border-slate-800' : 'bg-white border-slate-100 shadow-sm'
      }`}>
        <View className="flex-row items-center gap-4">
          <TouchableOpacity 
            onPress={() => router.back()}
            className={`w-9 h-9 rounded-full items-center justify-center border ${
              isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'
            }`}
          >
            <Ionicons name="arrow-back" size={16} color={isDarkMode ? 'white' : 'black'} />
          </TouchableOpacity>
          <Text className={`text-lg font-extrabold ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>
            Edit College Profile
          </Text>
        </View>

        <TouchableOpacity 
          onPress={handleSave}
          disabled={saving}
          className="bg-emerald-700 rounded-full px-5 py-2 active:bg-emerald-800 flex-row items-center justify-center"
        >
          {saving ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text className="text-white text-xs font-bold">Save</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Tab Contents View */}
      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-5">
          {/* College Name */}
          <View>
            <Text className={`text-xs font-bold mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>College Name</Text>
            <TextInput
              value={collegeName}
              onChangeText={setCollegeName}
              placeholder="Tribhuvan University"
              placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'}
              className={`rounded-2xl border px-4 py-3.5 text-xs font-medium ${
                isDarkMode 
                  ? 'bg-slate-900 border-slate-800 text-white' 
                  : 'bg-white border-slate-200 text-slate-900 shadow-sm'
              }`}
            />
          </View>

          {/* Type Selector Grid Pills */}
          <View>
            <Text className={`text-xs font-bold mb-2.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Type</Text>
            <View className="flex-row flex-wrap gap-2.5">
              {(['University', 'Engineering', 'Management', 'Polytechnic', 'Other'] as const).map((t) => {
                const isSelected = collegeType === t;
                return (
                  <TouchableOpacity
                    key={t}
                    onPress={() => setCollegeType(t)}
                    className={`px-5 py-3 rounded-2xl border ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-500/5'
                        : isDarkMode 
                          ? 'bg-slate-900 border-slate-800' 
                          : 'bg-white border-slate-200 shadow-sm'
                    }`}
                  >
                    <Text className={`text-xs font-bold ${
                      isSelected 
                        ? 'text-emerald-600' 
                        : isDarkMode ? 'text-slate-300' : 'text-slate-700'
                    }`}>
                      {t}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Location */}
          <View>
            <Text className={`text-xs font-bold mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Location</Text>
            <TextInput
              value={location}
              onChangeText={setLocation}
              placeholder="Kirtipur, Kathmandu"
              placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'}
              className={`rounded-2xl border px-4 py-3.5 text-xs font-medium ${
                isDarkMode 
                  ? 'bg-slate-900 border-slate-800 text-white' 
                  : 'bg-white border-slate-200 text-slate-900 shadow-sm'
              }`}
            />
          </View>

          {/* Year Established */}
          <View>
            <Text className={`text-xs font-bold mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Year Established</Text>
            <TextInput
              value={establishedYear}
              onChangeText={setEstablishedYear}
              placeholder="1959"
              placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'}
              keyboardType="numeric"
              className={`rounded-2xl border px-4 py-3.5 text-xs font-medium ${
                isDarkMode 
                  ? 'bg-slate-900 border-slate-800 text-white' 
                  : 'bg-white border-slate-200 text-slate-900 shadow-sm'
              }`}
            />
          </View>

          {/* Website */}
          <View>
            <Text className={`text-xs font-bold mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Website</Text>
            <TextInput
              value={website}
              onChangeText={setWebsite}
              placeholder="tu.edu.np"
              placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'}
              autoCapitalize="none"
              className={`rounded-2xl border px-4 py-3.5 text-xs font-medium ${
                isDarkMode 
                  ? 'bg-slate-900 border-slate-800 text-white' 
                  : 'bg-white border-slate-200 text-slate-900 shadow-sm'
              }`}
            />
          </View>

          {/* Contact Email */}
          <View>
            <Text className={`text-xs font-bold mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Contact Email</Text>
            <TextInput
              value={contactEmail}
              onChangeText={setContactEmail}
              placeholder="info@tu.edu.np"
              placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'}
              keyboardType="email-address"
              autoCapitalize="none"
              className={`rounded-2xl border px-4 py-3.5 text-xs font-medium ${
                isDarkMode 
                  ? 'bg-slate-900 border-slate-800 text-white' 
                  : 'bg-white border-slate-200 text-slate-900 shadow-sm'
              }`}
            />
          </View>

          {/* About Institution Area */}
          <View>
            <Text className={`text-xs font-bold mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>About your institution</Text>
            <TextInput
              value={about}
              onChangeText={setAbout}
              placeholder="Nepal's oldest and largest university..."
              placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              className={`rounded-2xl border px-4 py-3.5 text-xs font-medium min-h-[100px] leading-relaxed ${
                isDarkMode 
                  ? 'bg-slate-900 border-slate-800 text-white' 
                  : 'bg-white border-slate-200 text-slate-900 shadow-sm'
              }`}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
