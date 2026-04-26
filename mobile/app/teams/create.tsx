import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Switch, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTeamStore } from '../../store/teamStore';
import TagInput from '../../components/TagInput';

const CATEGORIES = ['Study Group', 'Research', 'Startup', 'Hackathon', 'Competitive Exams', 'Open Source', 'Project', 'Other'];

export default function CreateTeamScreen() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Project');
  const [tags, setTags] = useState<string[]>([]);
  const [lookingFor, setLookingFor] = useState<string[]>([]);
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

    const result = await createTeam({ 
      name: name.trim(), 
      description: description.trim(), 
      category,
      tags, 
      lookingFor,
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
        <View className="px-6 mb-8 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <TouchableOpacity 
              onPress={() => router.back()}
              className="h-10 w-10 bg-white/5 rounded-full items-center justify-center mr-4"
            >
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
            <Text className="text-white text-2xl font-bold">New Mission</Text>
          </View>
        </View>

        <View className="px-6 space-y-8">
          <View>
            <Text className="text-slate-400 text-xs font-bold uppercase mb-3 ml-1">Team Name</Text>
            <TextInput
              className="bg-white/5 border border-white/10 rounded-2xl p-5 text-white text-lg font-bold"
              placeholder="e.g. Martian AI Startup"
              placeholderTextColor="#475569"
              value={name}
              onChangeText={setName}
            />
          </View>

          <View>
            <Text className="text-slate-400 text-xs font-bold uppercase mb-3 ml-1">Category</Text>
            <View className="flex-row flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <TouchableOpacity 
                  key={cat}
                  onPress={() => setCategory(cat)}
                  className={`px-4 py-2.5 rounded-xl border ${category === cat ? 'bg-[#3B82F6] border-[#3B82F6]' : 'bg-white/5 border-white/10'}`}
                >
                  <Text className={`text-xs font-bold ${category === cat ? 'text-white' : 'text-slate-400'}`}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View>
            <Text className="text-slate-400 text-xs font-bold uppercase mb-3 ml-1">Description</Text>
            <TextInput
              className="bg-white/5 border border-white/10 rounded-3xl p-5 text-white h-40"
              placeholder="Explain the mission, goals, and culture of this team..."
              placeholderTextColor="#475569"
              multiline
              textAlignVertical="top"
              value={description}
              onChangeText={setDescription}
            />
          </View>

          <TagInput 
            label="Looking for (Skills Needed)" 
            tags={lookingFor} 
            setTags={setLookingFor} 
            placeholder="e.g. React, UI/UX, Sales" 
          />

          <TagInput 
            label="Tech Stack / Tags" 
            tags={tags} 
            setTags={setTags} 
            placeholder="e.g. python, figma, nodejs" 
          />

          <View className="flex-row items-center justify-between bg-white/5 border border-white/10 rounded-3xl p-6">
            <View className="flex-1 pr-4">
              <Text className="text-white font-bold text-lg">Visible to Public</Text>
              <Text className="text-slate-500 text-xs mt-1">If enabled, anyone can find this team. Note: Admin approval is ALWAYS required to join.</Text>
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
            className="bg-[#3B82F6] rounded-3xl p-5 items-center justify-center mt-6 shadow-2xl shadow-[#3B82F6]/40"
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-black text-xl">Launch Team 🚀</Text>
            )}
          </TouchableOpacity>
        </View>
        <View className="h-20" />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
