import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useProfileStore } from '../../store/profileStore';
import { pickImage, uploadFile } from '../../utils/imagePicker';
import TagInput from '../../components/TagInput';

export default function EditProfileScreen() {
  const { profile, updateProfile, isLoading: isUpdating, error } = useProfileStore();
  const [bio, setBio] = useState('');
  const [field, setField] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [goals, setGoals] = useState<string[]>([]);
  const [avatar, setAvatar] = useState('');
  const [username, setUsername] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (profile) {
      setBio(profile.bio || '');
      setField(profile.field || '');
      setSkills(profile.skills || []);
      setInterests(profile.interests || []);
      setGoals(profile.goals || []);
      setAvatar(profile.avatar || '');
      setUsername(profile.userId?.username || '');
    }
  }, [profile]);

  const handlePickAvatar = async () => {
    const asset = await pickImage({ quality: 0.9 });
    if (asset) {
      setIsUploading(true);
      try {
        const res = await uploadFile(asset, '/upload/profile');
        if (res.success) {
          setAvatar(res.url);
          // Sync with store immediately so other screens update
          const { profile } = useProfileStore.getState();
          if (profile) {
            useProfileStore.setState({ 
              profile: { ...profile, avatar: res.url } 
            });
          }
        }
      } catch (err) {
        Alert.alert('Error', 'Failed to upload avatar');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleUpdate = async () => {
    const res = await updateProfile({ username, bio, field, skills, interests, goals, avatar });
    if (res.success) {
      router.back();
    }
  };

  const isLoading = isUpdating || isUploading;

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      className="flex-1 bg-[#0F172A]"
    >
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
        <View className="mb-8 mt-10 flex-row items-center justify-between">
          <Text className="text-white text-3xl font-bold">Edit Profile</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text className="text-slate-400">Cancel</Text>
          </TouchableOpacity>
        </View>

        <View className="items-center mb-8">
           <TouchableOpacity 
            onPress={handlePickAvatar}
            className="h-32 w-32 rounded-full bg-slate-800 border-2 border-[#3B82F6] overflow-hidden relative"
            disabled={isLoading}
           >
              {avatar ? (
                <Image source={{ uri: avatar }} className="w-full h-full" />
              ) : (
                <View className="w-full h-full items-center justify-center">
                  <Ionicons name="person" size={50} color="#64748B" />
                </View>
              )}
              {isUploading && (
                <View className="absolute inset-0 bg-black/50 items-center justify-center">
                  <ActivityIndicator color="white" />
                </View>
              )}
              <View className="absolute bottom-0 left-0 right-0 bg-[#3B82F6] py-1">
                <Text className="text-white text-[10px] text-center font-bold">EDIT</Text>
              </View>
           </TouchableOpacity>
        </View>

        <View className="space-y-4">
          {error && (
            <View className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl mb-4">
              <Text className="text-red-400 text-center">{error}</Text>
            </View>
          )}

          <View className="bg-white/5 rounded-xl border border-white/10 px-4 py-3">
            <Text className="text-slate-400 text-xs uppercase mb-1 font-semibold">Username</Text>
            <TextInput
              className="text-white text-base"
              placeholder="unique_username"
              placeholderTextColor="#94A3B8"
              autoCapitalize="none"
              value={username}
              onChangeText={(val) => setUsername(val.replace(/[^a-z0-9_]/gi, '').toLowerCase())}
              editable={!profile?.userId?.username}
            />
          </View>

          <View className="bg-white/5 rounded-xl border border-white/10 px-4 py-3">
            <Text className="text-slate-400 text-xs uppercase mb-1 font-semibold">Bio</Text>
            <TextInput
              className="text-white text-base"
              placeholder="Your bio"
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
            placeholder="Add a skill" 
          />

          <TagInput 
            label="Interests" 
            tags={interests} 
            setTags={setInterests} 
            placeholder="Add an interest" 
          />

          <TagInput 
            label="Goals" 
            tags={goals} 
            setTags={setGoals} 
            placeholder="Add a goal" 
          />

          <TouchableOpacity 
            onPress={handleUpdate} 
            disabled={isLoading}
            className="bg-[#3B82F6] rounded-xl py-4 mt-6 items-center shadow-lg shadow-[#3B82F6]/30"
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-lg">Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
