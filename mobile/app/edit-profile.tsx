import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useUIStore } from '../store/uiStore';
import client from '../api/client';

type TabType = 'Basic' | 'Skills' | 'Interests' | 'Settings';

const PRESET_SKILLS = [
  'React Native', 'React', 'Node.js',
  'Python', 'Machine Learning', 'UI/UX',
  'Figma', 'Flutter', 'Java', 'C++',
  'PostgreSQL', 'MongoDB', 'Docker', 'IoT',
  'Arduino', 'Blockchain', 'TypeScript', 'Swift'
];

const PRESET_INTERESTS = [
  'AI', 'FinTech', 'Web3', 'Social Impact',
  'E-Commerce', 'EdTech', 'Gaming', 'IoT',
  'Design Systems', 'Research', 'Startup', 'Open Source'
];

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
  const [linkedinUrl, setLinkedinUrl] = useState('');

  // Skills & Interests Lists
  const [skills, setSkills] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);

  // Settings
  const [availability, setAvailability] = useState(true);
  const [goal, setGoal] = useState<'Looking for a Team' | 'Open to Join' | 'Just Exploring'>('Looking for a Team');

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
          setLinkedinUrl(p.social_links?.linkedin || '');
          setSkills(p.skills || []);
          setInterests(p.interests || []);
          setAvailability(p.availability !== false); // default to true
          setGoal(p.goal || 'Looking for a Team');
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
      const response = await client.put('/profile/update', {
        full_name: fullName.trim(),
        university: college.trim(),
        department: department.trim(),
        university_year: year,
        bio: bio.trim(),
        skills,
        interests,
        availability,
        goal,
        social_links: {
          github: githubUrl.trim(),
          portfolio: portfolioUrl.trim(),
          linkedin: linkedinUrl.trim(),
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

  // Skill Toggle
  const toggleSkill = (skill: string) => {
    if (skills.includes(skill)) {
      setSkills(skills.filter(s => s !== skill));
    } else {
      setSkills([...skills, skill]);
    }
  };

  // Interest Toggle
  const toggleInterest = (interest: string) => {
    if (interests.includes(interest)) {
      setInterests(interests.filter(i => i !== interest));
    } else {
      setInterests([...interests, interest]);
    }
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
          className="bg-blue-600 rounded-full px-5 py-2 active:bg-blue-700 flex-row items-center justify-center"
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

            {/* LinkedIn URL */}
            <View>
              <Text className={`text-xs font-bold mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>LinkedIn URL</Text>
              <TextInput
                value={linkedinUrl}
                onChangeText={setLinkedinUrl}
                placeholder="linkedin.com/in/yourprofile"
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
          <View>
            <Text className={`text-xs font-semibold mb-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Selected: {skills.length}
            </Text>
            
            {/* High-Fidelity Preset Skills Grid Selector */}
            <View className="flex-row flex-wrap gap-2.5">
              {PRESET_SKILLS.map((skill) => {
                const isSelected = skills.includes(skill);
                return (
                  <TouchableOpacity
                    key={skill}
                    onPress={() => toggleSkill(skill)}
                    className={`px-5 py-3.5 rounded-2xl border ${
                      isSelected
                        ? 'border-blue-600'
                        : isDarkMode
                          ? 'border-slate-800 bg-slate-900'
                          : 'border-slate-200 bg-white'
                    }`}
                    style={isSelected ? { backgroundColor: 'rgba(59, 130, 246, 0.05)' } : undefined}
                  >
                    <Text className={`text-xs font-bold ${
                      isSelected
                        ? 'text-blue-600'
                        : isDarkMode ? 'text-slate-300' : 'text-slate-700'
                    }`}>
                      {skill}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {activeTab === 'Interests' && (
          <View>
            <Text className={`text-xs font-semibold mb-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Selected: {interests.length}
            </Text>
            
            {/* High-Fidelity Preset Interests Grid Selector */}
            <View className="flex-row flex-wrap gap-2.5">
              {PRESET_INTERESTS.map((interest) => {
                const isSelected = interests.includes(interest);
                return (
                  <TouchableOpacity
                    key={interest}
                    onPress={() => toggleInterest(interest)}
                    className={`px-5 py-3.5 rounded-2xl border ${
                      isSelected
                        ? 'border-blue-600'
                        : isDarkMode
                          ? 'border-slate-800 bg-slate-900'
                          : 'border-slate-200 bg-white'
                    }`}
                    style={isSelected ? { backgroundColor: 'rgba(59, 130, 246, 0.05)' } : undefined}
                  >
                    <Text className={`text-xs font-bold ${
                      isSelected
                        ? 'text-blue-600'
                        : isDarkMode ? 'text-slate-300' : 'text-slate-700'
                    }`}>
                      {interest}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {activeTab === 'Settings' && (
          <View className="gap-6">
            {/* Availability Switch Toggle */}
            <View>
              <Text className={`text-sm font-extrabold mb-1 ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>
                Availability
              </Text>
              <Text className={`text-xs mb-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Let teammates know you're open to collaborate
              </Text>
              
              <TouchableOpacity 
                onPress={() => setAvailability(!availability)}
                className="flex-row items-center gap-3.5"
              >
                {/* Switch Background Container */}
                <View className={`w-12 h-7 rounded-full p-1 ${
                  availability ? 'bg-emerald-500 items-end' : 'bg-slate-300 items-start'
                }`}>
                  {/* Slider Knob */}
                  <View className="w-5 h-5 rounded-full bg-white shadow-sm" />
                </View>

                {/* Status text label next to switch toggle */}
                <Text className={`text-xs font-bold ${
                  availability 
                    ? 'text-emerald-500' 
                    : isDarkMode ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  Available to collaborate
                </Text>
              </TouchableOpacity>
            </View>

            {/* Goal Card Select Group */}
            <View className="mt-2">
              <Text className={`text-sm font-extrabold mb-4 ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>
                Your Goal
              </Text>

              <View className="gap-3">
                {([
                  { id: 'Looking for a Team', icon: '🚀', text: 'Looking for a Team' },
                  { id: 'Open to Join', icon: '🤝', text: 'Open to Join' },
                  { id: 'Just Exploring', icon: '👀', text: 'Just Exploring' }
                ] as const).map((g) => {
                  const isSelected = goal === g.id;
                  return (
                    <TouchableOpacity
                      key={g.id}
                      onPress={() => setGoal(g.id)}
                      className={`flex-row items-center justify-between p-5 rounded-[20px] border ${
                        isSelected
                          ? 'border-blue-600'
                          : isDarkMode
                            ? 'border-slate-800 bg-slate-900'
                            : 'border-slate-200 bg-white'
                      }`}
                      style={isSelected ? { backgroundColor: 'rgba(59, 130, 246, 0.05)' } : undefined}
                    >
                      <View className="flex-row items-center gap-3.5">
                        <Text className="text-base">{g.icon}</Text>
                        <Text className={`text-xs font-bold ${
                          isSelected
                            ? 'text-blue-600'
                            : isDarkMode ? 'text-white' : 'text-slate-950'
                        }`}>
                          {g.text}
                        </Text>
                      </View>
                      {isSelected && (
                        <Ionicons name="checkmark-circle" size={20} color="#2563EB" />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
