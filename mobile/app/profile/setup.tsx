import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useProfileStore } from '../../store/profileStore';
import { useAuthStore } from '../../store/authStore';
import TagInput from '../../components/TagInput';

export default function ProfileSetupScreen() {
  const [bio, setBio] = useState('');
  const [field, setField] = useState('');
  const [avatar, setAvatar] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [goals, setGoals] = useState<string[]>([]);
  const [username, setUsername] = useState('');
  const { updateProfile, isLoading, error } = useProfileStore();
  const { user } = useAuthStore();
  const router = useRouter();

  // Pre-fill username from auth store if available
  React.useEffect(() => {
    if (user?.username && !username) {
      setUsername(user.username);
    }
  }, [user?.username]);

  const handleSetup = async () => {
    if (!username) return Alert.alert('Wait!', 'You need a unique username so people can find you.');
    
    const res = await updateProfile({ username, bio, field, avatar, skills, interests, goals });
    if (res.success) {
      router.replace('/(tabs)');
    } else {
      Alert.alert('Setup Issue', res.error || 'We had a problem saving your profile settings.');
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      className="flex-1 bg-[#0F172A]"
    >
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
        <View className="mb-8 mt-10">
          <Text className="text-white text-3xl font-bold">Set Up Profile</Text>
          <Text className="text-slate-400 mt-2 text-base">Tell us a bit about yourself to get started</Text>
        </View>

        <View className="space-y-4">
          {error && (
            <View className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl mb-6">
              <Text className="text-red-400 text-center">{error}</Text>
            </View>
          )}

          {/* Avatar URL Input */}
          <View className="items-center mb-8">
            <View className="h-28 w-28 bg-[#1E293B] rounded-3xl items-center justify-center border-4 border-white/5 overflow-hidden">
               {avatar ? (
                 <Image source={{ uri: avatar }} className="w-full h-full" />
               ) : (
                 <Ionicons name="person" size={48} color="#3B82F6" />
               )}
            </View>
            <TouchableOpacity className="mt-4">
               <Text className="text-[#3B82F6] font-bold uppercase text-[10px] tracking-widest">Profile Photo URL</Text>
            </TouchableOpacity>
            <View className="w-full mt-4 bg-white/5 rounded-xl border border-white/10 px-4 py-2">
               <TextInput
                 className="text-white text-sm"
                 placeholder="https://example.com/photo.jpg"
                 placeholderTextColor="#64748B"
                 value={avatar}
                 onChangeText={setAvatar}
               />
            </View>
          </View>

          <View className="bg-white/5 rounded-xl border border-white/10 px-4 py-3">
            <Text className="text-slate-400 text-xs uppercase mb-1 font-semibold">Username</Text>
            <TextInput
              className="text-white text-base"
              placeholder="unique_username"
              placeholderTextColor="#94A3B8"
              autoCapitalize="none"
              value={username}
              onChangeText={(val) => setUsername(val.replace(/[^a-z0-9_]/gi, '').toLowerCase())}
            />
            <Text className="text-slate-500 text-[10px] mt-1 italic">This will be your unique identifier on the platform.</Text>
          </View>

          <View className="bg-white/5 rounded-xl border border-white/10 px-4 py-3">
            <Text className="text-slate-400 text-xs uppercase mb-1 font-semibold">Bio</Text>
            <TextInput
              className="text-white text-base"
              placeholder="I am a software engineering student passionate about AI..."
              placeholderTextColor="#94A3B8"
              multiline
              value={bio}
              onChangeText={setBio}
              style={{ minHeight: 80, textAlignVertical: 'top' }}
            />
          </View>

          <View className="bg-white/5 rounded-xl border border-white/10 px-4 py-3">
            <Text className="text-slate-400 text-xs uppercase mb-1 font-semibold">Field of Study</Text>
            <TextInput
              className="text-white text-base"
              placeholder="e.g. Computer Science"
              placeholderTextColor="#94A3B8"
              value={field}
              onChangeText={setField}
            />
          </View>

          <TagInput 
            label="Skills" 
            tags={skills} 
            setTags={setSkills} 
            placeholder="Add a skill (e.g. React)" 
          />

          <TagInput 
            label="Interests" 
            tags={interests} 
            setTags={setInterests} 
            placeholder="Add an interest (e.g. Hiking)" 
          />

          <TagInput 
            label="Goals" 
            tags={goals} 
            setTags={setGoals} 
            placeholder="Add a goal (e.g. Networking)" 
          />

          <TouchableOpacity 
            onPress={handleSetup} 
            disabled={isLoading}
            className="bg-[#3B82F6] rounded-xl py-4 mt-8 items-center shadow-lg shadow-[#3B82F6]/30"
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-lg">Create Profile</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
