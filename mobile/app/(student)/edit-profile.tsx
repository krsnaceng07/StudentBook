import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useUIStore } from '../../store/uiStore';
import client from '../../api/client';

type TabType = 'Basic' | 'Skills' | 'Interests' | 'Settings';

export default function EditProfile() {
  const { isDarkMode } = useUIStore();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<TabType>('Basic');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Profile Fields State
  const [fullName, setFullName] = useState('');
  const [college, setCollege] = useState('');
  const [department, setDepartment] = useState('');
  const [year, setYear] = useState<'1st' | '2nd' | '3rd' | '4th' | 'Graduate'>('1st');
  const [bio, setBio] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');

  // Skills & Interests Lists
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [newInterest, setNewInterest] = useState('');

  // Settings
  const [notifyMatches, setNotifyMatches] = useState(true);
  const [profileVisible, setProfileVisible] = useState(true);

  // Fetch initial profile
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await client.get('/profile/me');
        if (response.data && response.data.success && response.data.data.profile) {
          const p = response.data.data.profile;
          setFullName(p.full_name || '');
          setCollege(p.university || '');
          setDepartment(p.department || '');
          setYear(p.university_year || '1st');
          setBio(p.bio || '');
          setGithubUrl(p.social_links?.github || '');
          setPortfolioUrl(p.social_links?.portfolio || '');
          setSkills(p.skills || []);
          setInterests(p.interests || []);
        }
      } catch (error) {
        console.warn('Failed to load profile details for editing:', error);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  // Save changes
  const handleSave = async () => {
    if (!fullName.trim()) {
      Alert.alert('Required Info', 'Please enter your Full Name.');
      return;
    }

    setSaving(true);
    try {
      const response = await client.put('/student/profile/update', {
        full_name: fullName.trim(),
        university: college.trim(),
        department: department.trim(),
        university_year: year,
        bio: bio.trim(),
        skills,
        interests,
        social_links: {
          github: githubUrl.trim(),
          portfolio: portfolioUrl.trim(),
        }
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

  // Skill Helpers
  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  // Interest Helpers
  const addInterest = () => {
    if (newInterest.trim() && !interests.includes(newInterest.trim())) {
      setInterests([...interests, newInterest.trim()]);
      setNewInterest('');
    }
  };

  const removeInterest = (index: number) => {
    setInterests(interests.filter((_, i) => i !== index));
  };

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
      <View className={`px-6 py-4 flex-row items-center justify-between border-b ${
        isDarkMode ? 'bg-[#0F172A] border-slate-800' : 'bg-white border-slate-100'
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
            Edit Profile
          </Text>
        </View>

        <TouchableOpacity 
          onPress={handleSave}
          disabled={saving}
          className="bg-blue-600 rounded-full px-5 py-2 active:bg-blue-700 flex-row items-center gap-2"
        >
          {saving ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text className="text-white text-xs font-bold">Save</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Tabs Selector Navigation Row */}
      <View className={`flex-row border-b ${
        isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-100'
      }`}>
        {(['Basic', 'Skills', 'Interests', 'Settings'] as TabType[]).map((tab) => {
          const isActive = activeTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              className="flex-1 py-3.5 items-center relative"
            >
              <Text className={`text-xs font-bold ${
                isActive 
                  ? 'text-blue-600' 
                  : isDarkMode ? 'text-slate-400' : 'text-slate-500'
              }`}>
                {tab}
              </Text>
              {isActive && (
                <View className="absolute bottom-0 left-4 right-4 h-[2px] bg-blue-600 rounded-full" />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Tab Contents View */}
      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'Basic' && (
          <View className="gap-5">
            {/* Full Name */}
            <View>
              <Text className={`text-xs font-bold mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Full Name</Text>
              <TextInput
                value={fullName}
                onChangeText={setFullName}
                placeholder="Aarav Sharma"
                placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'}
                className={`rounded-2xl border px-4 py-3.5 text-xs font-medium ${
                  isDarkMode 
                    ? 'bg-slate-900 border-slate-800 text-white' 
                    : 'bg-white border-slate-200 text-slate-900 shadow-sm'
                }`}
              />
            </View>

            {/* College */}
            <View>
              <Text className={`text-xs font-bold mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>College</Text>
              <TextInput
                value={college}
                onChangeText={setCollege}
                placeholder="Tribhuvan University"
                placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'}
                className={`rounded-2xl border px-4 py-3.5 text-xs font-medium ${
                  isDarkMode 
                    ? 'bg-slate-900 border-slate-800 text-white' 
                    : 'bg-white border-slate-200 text-slate-900 shadow-sm'
                }`}
              />
            </View>

            {/* Department */}
            <View>
              <Text className={`text-xs font-bold mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Department</Text>
              <TextInput
                value={department}
                onChangeText={setDepartment}
                placeholder="Computer Science"
                placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'}
                className={`rounded-2xl border px-4 py-3.5 text-xs font-medium ${
                  isDarkMode 
                    ? 'bg-slate-900 border-slate-800 text-white' 
                    : 'bg-white border-slate-200 text-slate-900 shadow-sm'
                }`}
              />
            </View>

            {/* Year Multi-Selector Button Group */}
            <View>
              <Text className={`text-xs font-bold mb-2.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Year</Text>
              <View className="flex-row gap-2">
                {(['1st', '2nd', '3rd', '4th', 'Graduate'] as const).map((y) => {
                  const isSelected = year === y;
                  return (
                    <TouchableOpacity
                      key={y}
                      onPress={() => setYear(y)}
                      className={`flex-1 py-3 rounded-2xl border items-center ${
                        isSelected
                          ? 'bg-blue-50 border-blue-500'
                          : isDarkMode 
                            ? 'bg-slate-900 border-slate-800' 
                            : 'bg-white border-slate-200 shadow-sm'
                      }`}
                    >
                      <Text className={`text-xs font-bold ${
                        isSelected 
                          ? 'text-blue-600' 
                          : isDarkMode ? 'text-slate-400' : 'text-slate-500'
                      }`}>
                        {y}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Short Bio Area */}
            <View>
              <Text className={`text-xs font-bold mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Short Bio</Text>
              <TextInput
                value={bio}
                onChangeText={setBio}
                placeholder="Passionate about AI and open source..."
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

            {/* GitHub URL */}
            <View>
              <Text className={`text-xs font-bold mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>GitHub URL</Text>
              <TextInput
                value={githubUrl}
                onChangeText={setGithubUrl}
                placeholder="github.com/aarav"
                placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'}
                autoCapitalize="none"
                className={`rounded-2xl border px-4 py-3.5 text-xs font-medium ${
                  isDarkMode 
                    ? 'bg-slate-900 border-slate-800 text-white' 
                    : 'bg-white border-slate-200 text-slate-900 shadow-sm'
                }`}
              />
            </View>

            {/* Portfolio URL */}
            <View>
              <Text className={`text-xs font-bold mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Portfolio URL</Text>
              <TextInput
                value={portfolioUrl}
                onChangeText={setPortfolioUrl}
                placeholder="yourportfolio.com"
                placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'}
                autoCapitalize="none"
                className={`rounded-2xl border px-4 py-3.5 text-xs font-medium ${
                  isDarkMode 
                    ? 'bg-slate-900 border-slate-800 text-white' 
                    : 'bg-white border-slate-200 text-slate-900 shadow-sm'
                }`}
              />
            </View>
          </View>
        )}

        {activeTab === 'Skills' && (
          <View className="gap-5">
            <Text className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Highlight your Tech Stack & Skills
            </Text>
            
            <View className="flex-row gap-2">
              <TextInput
                value={newSkill}
                onChangeText={setNewSkill}
                placeholder="React Native, Node.js..."
                placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'}
                className={`flex-1 rounded-2xl border px-4 py-3.5 text-xs font-medium ${
                  isDarkMode 
                    ? 'bg-slate-900 border-slate-800 text-white' 
                    : 'bg-white border-slate-200 text-slate-900 shadow-sm'
                }`}
              />
              <TouchableOpacity
                onPress={addSkill}
                className="bg-blue-600 px-5 rounded-2xl items-center justify-center active:bg-blue-700"
              >
                <Ionicons name="add" size={20} color="white" />
              </TouchableOpacity>
            </View>

            {/* Skills Badges Grid */}
            <View className="flex-row flex-wrap gap-2.5 mt-2">
              {skills.map((skill, index) => (
                <View 
                  key={`${skill}-${index}`}
                  className={`flex-row items-center gap-1.5 px-4 py-2 rounded-full border ${
                    isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <Text className={`text-xs font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    {skill}
                  </Text>
                  <TouchableOpacity onPress={() => removeSkill(index)}>
                    <Ionicons name="close-circle" size={14} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}

        {activeTab === 'Interests' && (
          <View className="gap-5">
            <Text className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              What domains interest you?
            </Text>
            
            <View className="flex-row gap-2">
              <TextInput
                value={newInterest}
                onChangeText={setNewInterest}
                placeholder="AI, Web3, FinTech..."
                placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'}
                className={`flex-1 rounded-2xl border px-4 py-3.5 text-xs font-medium ${
                  isDarkMode 
                    ? 'bg-slate-900 border-slate-800 text-white' 
                    : 'bg-white border-slate-200 text-slate-900 shadow-sm'
                }`}
              />
              <TouchableOpacity
                onPress={addInterest}
                className="bg-blue-600 px-5 rounded-2xl items-center justify-center active:bg-blue-700"
              >
                <Ionicons name="add" size={20} color="white" />
              </TouchableOpacity>
            </View>

            {/* Interests Badges Grid */}
            <View className="flex-row flex-wrap gap-2.5 mt-2">
              {interests.map((interest, index) => (
                <View 
                  key={`${interest}-${index}`}
                  className={`flex-row items-center gap-1.5 px-4 py-2 rounded-full border ${
                    isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <Text className={`text-xs font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    {interest}
                  </Text>
                  <TouchableOpacity onPress={() => removeInterest(index)}>
                    <Ionicons name="close-circle" size={14} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}

        {activeTab === 'Settings' && (
          <View className="gap-5">
            <Text className={`text-sm font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Account Preferences
            </Text>

            {/* Notification settings item */}
            <View className={`flex-row items-center justify-between p-4 rounded-3xl border ${
              isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-100 shadow-sm'
            }`}>
              <View className="flex-1 pr-4">
                <Text className={`text-xs font-bold mb-0.5 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  Team Match Notifications
                </Text>
                <Text className={`text-[10px] font-semibold ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                  Get notified when colleges view your profile or request teams
                </Text>
              </View>
              <TouchableOpacity 
                onPress={() => setNotifyMatches(!notifyMatches)}
                className={`w-12 h-7 rounded-full p-1 transition-colors ${
                  notifyMatches ? 'bg-emerald-500 items-end' : 'bg-slate-300 items-start'
                }`}
              >
                <View className="w-5 h-5 rounded-full bg-white shadow-sm" />
              </TouchableOpacity>
            </View>

            {/* Visibility Settings Item */}
            <View className={`flex-row items-center justify-between p-4 rounded-3xl border ${
              isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-100 shadow-sm'
            }`}>
              <View className="flex-1 pr-4">
                <Text className={`text-xs font-bold mb-0.5 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  Public Discover Visibility
                </Text>
                <Text className={`text-[10px] font-semibold ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                  Show my profile card inside student find-teammate discover boards
                </Text>
              </View>
              <TouchableOpacity 
                onPress={() => setProfileVisible(!profileVisible)}
                className={`w-12 h-7 rounded-full p-1 transition-colors ${
                  profileVisible ? 'bg-emerald-500 items-end' : 'bg-slate-300 items-start'
                }`}
              >
                <View className="w-5 h-5 rounded-full bg-white shadow-sm" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
