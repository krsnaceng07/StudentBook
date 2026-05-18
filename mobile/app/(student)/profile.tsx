import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Linking, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useUIStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import client from '../../api/client';

const PROFILE_DATA_DEFAULT = {
  initials: 'AS',
  name: 'Aarav Sharma',
  university: 'Tribhuvan University',
  year: '3rd Year',
  status: 'Looking for Team',
  availability: 'Available',
  bio: 'Passionate about AI and open source. Looking to build impactful products.',
  skills: ['React Native', 'Python', 'Machine Learning'],
  interests: ['AI', 'FinTech'],
  github: 'github.com/aarav'
};

export default function Profile() {
  const { isDarkMode } = useUIStore();
  const { logout } = useAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(PROFILE_DATA_DEFAULT);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await client.get('/profile/me');
      if (response.data && response.data.success && response.data.data.profile) {
        const p = response.data.data.profile;
        setProfile({
          initials: p.initials || '??',
          name: p.full_name || 'Anonymous User',
          university: p.university || 'University Student',
          year: `${p.department || p.role_title || 'Student'}${p.university_year ? ` - ${p.university_year}` : ''}`,
          status: 'Looking for Team',
          availability: 'Available',
          bio: p.bio || 'Welcome to my profile.',
          skills: p.skills || [],
          interests: p.interests || ['AI', 'FinTech'],
          github: p.social_links?.github || 'github.com'
        });
      }
    } catch (err) {
      console.warn('Error fetching profile, using fallback mocks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleGithubPress = () => {
    if (profile.github && profile.github !== 'github.com') {
      Linking.openURL(profile.github.startsWith('http') ? profile.github : `https://${profile.github}`);
    } else {
      Linking.openURL('https://github.com');
    }
  };

  return (
    <SafeAreaView 
      className={`flex-1 ${isDarkMode ? 'bg-[#0F172A]' : 'bg-[#F8FAFC]'}`}
      edges={['top']}
    >
      {/* Top Header */}
      <View className={`px-6 pt-4 pb-4 ${isDarkMode ? 'bg-[#0F172A]' : 'bg-white border-b border-slate-100 shadow-sm'}`}>
        <Text className={`text-2xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          Profile
        </Text>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Blue Banner Header */}
        <View className="px-6 pt-5">
          <View className="bg-blue-600 rounded-[32px] p-6 relative flex-row items-center">
            {/* Edit Button */}
            <TouchableOpacity 
              onPress={() => router.push('/(student)/edit-profile')}
              className="absolute top-4 right-4 bg-blue-500/50 px-4 py-2 rounded-2xl flex-row items-center border border-blue-400/20"
            >
              <Text className="text-white font-bold text-xs mr-1">Edit</Text>
              <Ionicons name="pencil" size={12} color="#F97316" />
            </TouchableOpacity>

            {/* Avatar & Meta info */}
            <View className="w-16 h-16 rounded-full bg-blue-500 border-2 border-white items-center justify-center mr-4">
               <Text className="text-white text-xl font-bold">{profile.initials}</Text>
            </View>

             <View className="flex-1 pr-12">
               <Text className="text-white text-lg font-bold mb-0.5">{profile.name}</Text>
               <Text className="text-blue-100 text-xs font-semibold">{profile.university} - {profile.year}</Text>
             </View>
           </View>
         </View>
 
         {/* Info Cards List on Light Gray Background */}
         <View className="px-6 mt-5 gap-4">
           
           {/* Card 1: Status & Bio */}
           <View className={`p-5 rounded-3xl border border-slate-100 ${
             isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white shadow-sm'
           }`}>
             <View className="flex-row items-center justify-between mb-4">
               <View className={`px-3 py-1 rounded-full ${
                 isDarkMode ? 'bg-slate-900' : 'bg-blue-50'
               }`}>
                 <Text className={`text-[10px] font-semibold ${
                   isDarkMode ? 'text-blue-400' : 'text-blue-600'
                 }`}>
                   {profile.status}
                 </Text>
               </View>
 
               <View className="flex-row items-center gap-1.5">
                 <View className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                 <Text className={`text-[10px] font-semibold ${
                   isDarkMode ? 'text-slate-400' : 'text-slate-500'
                 }`}>
                   {profile.availability}
                 </Text>
               </View>
             </View>
 
             <Text className={`text-xs leading-5 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
               {profile.bio}
             </Text>
           </View>
 
           {/* Card 2: Skills */}
           <View className={`p-5 rounded-3xl border border-slate-100 ${
             isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white shadow-sm'
           }`}>
             <Text className={`text-sm font-bold mb-3.5 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
               Skills
             </Text>
 
             <View className="flex-row flex-wrap gap-2">
               {profile.skills.map((skill: string) => (
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
 
           {/* Card 3: Interests */}
           <View className={`p-5 rounded-3xl border border-slate-100 ${
             isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white shadow-sm'
           }`}>
             <Text className={`text-sm font-bold mb-3.5 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
               Interests
             </Text>
 
             <View className="flex-row flex-wrap gap-2">
               {profile.interests.map((interest: string) => (
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
 
           {/* Card 4: Social Link */}
           <TouchableOpacity 
             onPress={handleGithubPress}
             className={`p-5 rounded-3xl border border-slate-100 flex-row items-center gap-3 ${
               isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white shadow-sm'
             }`}
           >
             <Ionicons name="logo-github" size={18} color={isDarkMode ? '#F8FAFC' : '#1E293B'} />
             <Text className={`text-xs font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
               {profile.github}
             </Text>
           </TouchableOpacity>

          {/* Card 5: My Team Workspace */}
          <TouchableOpacity 
            onPress={() => router.push('/teams')}
            className={`p-5 rounded-3xl border border-slate-100 flex-row items-center justify-between ${
              isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white shadow-sm'
            }`}
          >
            <View className="flex-row items-center gap-3">
              <Ionicons name="people-circle-outline" size={20} color={isDarkMode ? '#60A5FA' : '#2563EB'} />
              <Text className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                My Team Workspace
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={isDarkMode ? '#64748B' : '#94A3B8'} />
          </TouchableOpacity>

          {/* Card 6: Sign Out */}
          <TouchableOpacity 
            onPress={async () => {
              await logout();
            }}
            className={`p-5 rounded-3xl border mt-2 flex-row items-center justify-between ${
              isDarkMode ? 'bg-red-950/25 border-red-900/30' : 'bg-red-50 border-red-100'
            }`}
          >
            <View className="flex-row items-center gap-3">
              <Ionicons name="log-out-outline" size={20} color="#EF4444" />
              <Text className="text-xs font-bold text-red-500">
                Sign Out
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#EF4444" />
          </TouchableOpacity>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
