import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Linking, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useUIStore } from '../../store/uiStore';
import client from '../../api/client';

interface ProfileDetails {
  initials: string;
  name: string;
  university: string;
  year: string;
  department: string;
  status: string;
  availability: string;
  bio: string;
  skills: string[];
  interests: string[];
  github: string;
  headerColor: string;
  avatarBg: string;
  avatarText: string;
}

const DETAILS_MAP: Record<string, ProfileDetails> = {
  priya_thapa: {
    initials: 'PT',
    name: 'Priya Thapa',
    university: 'Kathmandu University',
    year: '2nd Year',
    department: 'Electronics',
    status: 'Open to Join',
    availability: 'Available',
    bio: 'Hardware + software bridge builder. Love IoT and embedded systems.',
    skills: ['IoT', 'C++', 'Arduino', 'UI/UX'],
    interests: ['Hardware', 'Social Impact'],
    github: 'github.com/priya',
    headerColor: 'bg-purple-600',
    avatarBg: 'bg-purple-500',
    avatarText: 'text-purple-100'
  },
  rohan_kc: {
    initials: 'RK',
    name: 'Rohan KC',
    university: 'Pokhara University',
    year: '4th Year',
    department: 'Computer Science',
    status: 'Looking for Team',
    availability: 'Available',
    bio: 'Passionate full-stack developer looking to team up for tech contests.',
    skills: ['Node.js', 'React', 'PostgreSQL', 'TypeScript'],
    interests: ['Web Development', 'Open Source'],
    github: 'github.com/rohan',
    headerColor: 'bg-emerald-650',
    avatarBg: 'bg-emerald-500',
    avatarText: 'text-emerald-100'
  },
  sita_gurung: {
    initials: 'SG',
    name: 'Sita Gurung',
    university: 'Tribhuvan University',
    year: '3rd Year',
    department: 'Design',
    status: 'Open to Join',
    availability: 'Available',
    bio: 'Product designer interested in creating seamless user flows and interface animations.',
    skills: ['Figma', 'UI/UX', 'React', 'CSS'],
    interests: ['Design Systems', 'AI Tools'],
    github: 'github.com/sita',
    headerColor: 'bg-pink-600',
    avatarBg: 'bg-pink-500',
    avatarText: 'text-pink-100'
  },
  dinesh_rai: {
    initials: 'DR',
    name: 'Dinesh Rai',
    university: 'Kathmandu University',
    year: '3rd Year',
    department: 'Software Engineering',
    status: 'Looking for Team',
    availability: 'Available',
    bio: 'Cloud and web developer open for interesting collaboration opportunities.',
    skills: ['React', 'Python', 'AWS', 'Docker'],
    interests: ['Cloud Computing', 'AI Models'],
    github: 'github.com/dinesh',
    headerColor: 'bg-blue-600',
    avatarBg: 'bg-blue-500',
    avatarText: 'text-blue-100'
  }
};

export default function ProfileDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { isDarkMode } = useUIStore();
  const [requestSent, setRequestSent] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ProfileDetails | null>(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true);
      try {
        if (typeof id === 'string' && DETAILS_MAP[id]) {
          // It's a static mock ID
          setData(DETAILS_MAP[id]);
        } else if (typeof id === 'string' && id.length > 10) {
          // Try to fetch dynamically from API (Supabase UUID or long ID)
          const response = await client.get(`/profile/${id}`);
          if (response.data && response.data.success && response.data.data.profile) {
            const p = response.data.data.profile;
            setData({
              initials: p.initials || '??',
              name: p.full_name || 'Anonymous User',
              university: p.university || 'University Student',
              year: p.role_title || 'Student',
              department: 'Software Engineering',
              status: 'Looking for Team',
              availability: 'Available',
              bio: p.bio || 'Welcome to my profile.',
              skills: p.skills || [],
              interests: ['AI', 'FinTech'],
              github: 'github.com',
              headerColor: 'bg-blue-600',
              avatarBg: 'bg-blue-500',
              avatarText: 'text-blue-100'
            });
          } else {
            setData(DETAILS_MAP.priya_thapa);
          }
        } else {
          setData(DETAILS_MAP.priya_thapa);
        }
      } catch (err) {
        console.warn('Error fetching custom profile detail, falling back to mock:', err);
        setData(DETAILS_MAP.priya_thapa);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [id]);

  const handleGithubPress = () => {
    if (!data) return;
    Linking.openURL(`https://${data.github}`);
  };

  const handleSendRequest = () => {
    if (!data || requestSent) return;
    
    setRequestSent(true);
    Alert.alert(
      "Request Sent",
      `Your collaboration request has been successfully sent to ${data.name}!`,
      [{ text: "Awesome" }]
    );
  };

  if (loading || !data) {
    return (
      <SafeAreaView className={`flex-1 justify-center items-center ${isDarkMode ? 'bg-[#0F172A]' : 'bg-white'}`}>
        <ActivityIndicator size="large" color="#2563EB" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView 
      className={`flex-1 ${isDarkMode ? 'bg-[#0F172A]' : 'bg-[#F8FAFC]'}`}
      edges={['top']}
    >
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110 }}
      >
        {/* Dynamic Colorful Header */}
        <View className="px-6 pt-5">
          <View className={`${data.headerColor} rounded-[32px] p-6 relative`}>
            
            {/* Back Button */}
            <TouchableOpacity 
              onPress={() => router.back()}
              className="w-10 h-10 rounded-2xl bg-white/20 items-center justify-center mb-6"
            >
              <Ionicons name="arrow-back" size={20} color="white" />
            </TouchableOpacity>

            {/* Avatar block */}
            <View className="flex-row items-center">
              <View className={`w-16 h-16 rounded-full ${data.avatarBg} border-2 border-white items-center justify-center mr-4 shadow-sm`}>
                <Text className={`text-xl font-bold text-white`}>{data.initials}</Text>
              </View>

              <View className="flex-1 pr-4">
                <Text className="text-white text-lg font-bold mb-0.5">{data.name}</Text>
                <Text className="text-white/80 text-xs font-semibold">{data.department} - {data.year}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Info Cards List */}
        <View className="px-6 mt-5 gap-4">
          
          {/* Card 1: Status & Availability */}
          <View className={`p-5 rounded-3xl border border-slate-100 ${
            isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white shadow-sm'
          }`}>
            <View className="flex-row items-center justify-between">
              <View className={`px-3 py-1 rounded-full ${
                isDarkMode ? 'bg-slate-900' : 'bg-emerald-50'
              }`}>
                <Text className={`text-[10px] font-semibold ${
                  isDarkMode ? 'text-emerald-400' : 'text-emerald-600'
                }`}>
                  {data.status}
                </Text>
              </View>

              <View className="flex-row items-center gap-1.5">
                <View className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <Text className={`text-[10px] font-semibold ${
                  isDarkMode ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  {data.availability}
                </Text>
              </View>
            </View>
          </View>

          {/* Card 2: About / Bio */}
          <View className={`p-5 rounded-3xl border border-slate-100 ${
            isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white shadow-sm'
          }`}>
            <Text className={`text-sm font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              About
            </Text>
            <Text className={`text-xs leading-5 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
              {data.bio}
            </Text>
          </View>

          {/* Card 3: Skills */}
          <View className={`p-5 rounded-3xl border border-slate-100 ${
            isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white shadow-sm'
          }`}>
            <Text className={`text-sm font-bold mb-3.5 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Skills
            </Text>

            <View className="flex-row flex-wrap gap-2">
              {data.skills.map((skill) => (
                <View 
                  key={skill} 
                  className={`px-4 py-2 rounded-2xl border ${
                    isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-100'
                  }`}
                >
                  <Text className={`text-xs font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                    {skill}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Card 4: Interests */}
          <View className={`p-5 rounded-3xl border border-slate-100 ${
            isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white shadow-sm'
          }`}>
            <Text className={`text-sm font-bold mb-3.5 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Interests
            </Text>

            <View className="flex-row flex-wrap gap-2">
              {data.interests.map((interest) => (
                <View 
                  key={interest} 
                  className={`px-4 py-2 rounded-2xl border ${
                    isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-100'
                  }`}
                >
                  <Text className={`text-xs font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                    {interest}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Card 5: Social Link */}
          <TouchableOpacity 
            onPress={handleGithubPress}
            className={`p-5 rounded-3xl border border-slate-100 flex-row items-center gap-3 ${
              isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white shadow-sm'
            }`}
          >
            <Ionicons name="logo-github" size={18} color={isDarkMode ? '#F8FAFC' : '#1E293B'} />
            <Text className={`text-xs font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              {data.github}
            </Text>
          </TouchableOpacity>

        </View>
      </ScrollView>

      {/* Floating Bottom Button */}
      <View className={`absolute bottom-0 left-0 right-0 p-6 ${
        isDarkMode ? 'bg-[#0F172A]' : 'bg-[#F8FAFC]'
      }`}>
        <TouchableOpacity 
          onPress={handleSendRequest}
          disabled={requestSent}
          className={`w-full py-4 rounded-2xl items-center justify-center ${
            requestSent ? 'bg-slate-400' : 'bg-blue-600 shadow-lg'
          }`}
        >
          <Text className="text-white font-bold text-sm">
            {requestSent ? 'Collaboration Request Sent' : 'Send Collaboration Request'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
