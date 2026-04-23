import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Switch, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTeamStore } from '../../store/teamStore';

export default function CreateTeamScreen() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const { createTeam, isLoading } = useTeamStore();
  const router = useRouter();

  const handleCreate = async () => {
    if (!name.trim()) {
      return Alert.alert('Name your team!', 'Give your group a catchy name so students know what it stands for.');
    }
    if (!description.trim()) {
      return Alert.alert('Add a description', 'Briefly explain the goal of this team to attract the right contributors.');
    }

    const tagList = tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
    const result = await createTeam({ 
      name: name.trim(), 
      description: description.trim(), 
      tags: tagList, 
      isPublic 
    });

    if (result.success) {
      router.back();
    } else {
      Alert.alert('Try again', result.error || 'We had a little trouble creating your team right now.');
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView className="flex-1 bg-[#0F172A] pt-14">
        <View className="px-6 mb-8 flex-row items-center">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="h-10 w-10 bg-white/5 rounded-full items-center justify-center mr-4"
          >
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-2xl font-bold">New Team</Text>
        </View>

        <View className="px-6 space-y-6">
          <View>
            <Text className="text-slate-400 text-xs font-bold uppercase mb-2 ml-1">Team Name</Text>
            <TextInput
              className="bg-white/5 border border-white/10 rounded-2xl p-4 text-white"
              placeholder="e.g. AI Research Group"
              placeholderTextColor="#475569"
              value={name}
              onChangeText={setName}
            />
          </View>

          <View>
            <Text className="text-slate-400 text-xs font-bold uppercase mb-2 ml-1">Description</Text>
            <TextInput
              className="bg-white/5 border border-white/10 rounded-2xl p-4 text-white h-32"
              placeholder="What is this team about?"
              placeholderTextColor="#475569"
              multiline
              textAlignVertical="top"
              value={description}
              onChangeText={setDescription}
            />
          </View>

          <View>
            <Text className="text-slate-400 text-xs font-bold uppercase mb-2 ml-1">Tags (comma separated)</Text>
            <TextInput
              className="bg-white/5 border border-white/10 rounded-2xl p-4 text-white"
              placeholder="python, research, startup..."
              placeholderTextColor="#475569"
              value={tags}
              onChangeText={setTags}
            />
          </View>

          <View className="flex-row items-center justify-between bg-white/5 border border-white/10 rounded-2xl p-4">
            <View>
              <Text className="text-white font-bold">Public Team</Text>
              <Text className="text-slate-500 text-xs">Anyone can request to join</Text>
            </View>
            <Switch
              value={isPublic}
              onValueChange={setIsPublic}
              trackColor={{ false: '#334155', true: '#3B82F6' }}
              thumbColor={Platform.OS === 'ios' ? '#FFFFFF' : isPublic ? '#FFFFFF' : '#64748b'}
            />
          </View>

          <TouchableOpacity 
            onPress={handleCreate}
            disabled={isLoading}
            className={`bg-[#3B82F6] rounded-2xl p-4 items-center justify-center mt-4 ${isLoading ? 'opacity-50' : ''}`}
          >
            <Text className="text-white font-bold text-lg">
              {isLoading ? 'Creating...' : 'Create Team'}
            </Text>
          </TouchableOpacity>
        </View>
        <View className="h-20" />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
