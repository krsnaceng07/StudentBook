import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, Image, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { pickImage, uploadFile } from '../utils/imagePicker';
import { useTeamStore } from '../store/teamStore';
import TagInput from './TagInput';

const CATEGORIES = ['Study Group', 'Research', 'Startup', 'Hackathon', 'Competitive Exams', 'Open Source', 'Project', 'Other'];
const STATUSES = ['Recruiting', 'Active', 'Full', 'Archived'];

interface EditTeamModalProps {
  isVisible: boolean;
  onClose: () => void;
  team: any;
}

export default function EditTeamModal({ isVisible, onClose, team }: EditTeamModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Project');
  const [status, setStatus] = useState('Recruiting');
  const [lookingFor, setLookingFor] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const { updateTeam } = useTeamStore();

  useEffect(() => {
    if (isVisible && team) {
      setName(team.name || '');
      setDescription(team.description || '');
      setCategory(team.category || 'Project');
      setStatus(team.status || 'Recruiting');
      setLookingFor(team.lookingFor || []);
      setSelectedImage(team.avatar ? { uri: team.avatar, isRemote: true } : null);
    }
  }, [isVisible, team]);

  const handlePickImage = async () => {
    const asset = await pickImage({ quality: 0.8 });
    if (asset) {
      setSelectedImage({ ...asset, isRemote: false });
    }
  };

  const handleSave = async () => {
    if (!name.trim() || !description.trim()) {
      Alert.alert('Error', 'Please fill in name and description');
      return;
    }

    setIsUpdating(true);
    let avatarUrl = team.avatar;

    if (selectedImage && !selectedImage.isRemote) {
      try {
        const uploadResult = await uploadFile(selectedImage, '/upload/post'); 
        if (uploadResult.success) {
          avatarUrl = uploadResult.url;
        }
      } catch (error) {
        Alert.alert('Upload Error', 'Failed to upload team avatar');
        setIsUpdating(false);
        return;
      }
    } else if (!selectedImage) {
      avatarUrl = null;
    }

    const result = await updateTeam(team._id, {
      name,
      description,
      category,
      status,
      lookingFor,
      avatar: avatarUrl
    });

    setIsUpdating(false);
    if (result.success) {
      onClose();
    } else {
      Alert.alert('Error', result.error || 'Failed to update team');
    }
  };

  return (
    <Modal visible={isVisible} animationType="slide" transparent>
      <View className="flex-1 bg-black/80 justify-end">
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="bg-[#0F172A] rounded-t-[50px] border-t border-white/10 h-[90%]"
        >
          <View className="p-8 flex-1">
            {/* Header */}
            <View className="flex-row justify-between items-center mb-10">
              <TouchableOpacity onPress={onClose} className="bg-white/5 h-12 w-12 rounded-full items-center justify-center">
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
              <Text className="text-white text-xl font-black">Edit Team</Text>
              <TouchableOpacity onPress={handleSave} disabled={isUpdating}>
                {isUpdating ? (
                  <ActivityIndicator color="#3B82F6" />
                ) : (
                  <Text className="text-[#3B82F6] font-black text-lg">Apply</Text>
                )}
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
              {/* Avatar Picker */}
              <View className="items-center mb-10">
                <TouchableOpacity 
                  onPress={handlePickImage}
                  className="h-32 w-32 bg-white/5 rounded-[40px] border-2 border-dashed border-white/10 items-center justify-center overflow-hidden"
                >
                  {selectedImage ? (
                    <View className="h-full w-full">
                      <Image source={{ uri: selectedImage.uri }} className="h-full w-full" />
                      <View className="absolute inset-0 bg-black/40 items-center justify-center">
                        <Ionicons name="camera" size={32} color="white" />
                      </View>
                    </View>
                  ) : (
                    <View className="items-center">
                      <Ionicons name="camera" size={32} color="#64748b" />
                      <Text className="text-slate-500 text-[10px] mt-2 font-bold uppercase">Change Icon</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              <View className="space-y-8">
                <View>
                  <Text className="text-slate-400 text-[10px] font-black uppercase tracking-widest ml-1 mb-3">Mission Name</Text>
                  <TextInput
                    className="bg-white/5 border border-white/10 rounded-2xl p-5 text-white text-lg font-bold"
                    value={name}
                    onChangeText={setName}
                  />
                </View>

                <View>
                  <Text className="text-slate-400 text-[10px] font-black uppercase tracking-widest ml-1 mb-3">Mission Category</Text>
                  <View className="flex-row flex-wrap gap-2">
                    {CATEGORIES.map(cat => (
                      <TouchableOpacity 
                        key={cat}
                        onPress={() => setCategory(cat)}
                        className={`px-4 py-2 rounded-xl border ${category === cat ? 'bg-[#3B82F6] border-[#3B82F6]' : 'bg-white/5 border-white/10'}`}
                      >
                        <Text className={`text-[10px] font-bold ${category === cat ? 'text-white' : 'text-slate-500'}`}>{cat}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View>
                  <Text className="text-slate-400 text-[10px] font-black uppercase tracking-widest ml-1 mb-3">Team Status</Text>
                  <View className="flex-row flex-wrap gap-2">
                    {STATUSES.map(s => (
                      <TouchableOpacity 
                        key={s}
                        onPress={() => setStatus(s)}
                        className={`px-4 py-2 rounded-xl border ${status === s ? 'bg-emerald-500 border-emerald-500' : 'bg-white/5 border-white/10'}`}
                      >
                        <Text className={`text-[10px] font-bold ${status === s ? 'text-white' : 'text-slate-500'}`}>{s}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <TagInput 
                  label="Recruiting For (Needed Skills)" 
                  tags={lookingFor} 
                  setTags={setLookingFor} 
                  placeholder="e.g. Designer, QA, Frontend"
                />

                <View>
                  <Text className="text-slate-400 text-[10px] font-black uppercase tracking-widest ml-1 mb-3">The Mission Description</Text>
                  <TextInput
                    className="bg-white/5 border border-white/10 rounded-3xl p-5 text-white min-h-[140px]"
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    textAlignVertical="top"
                  />
                  <Text className="text-[#3B82F6] text-[10px] font-bold mt-3 ml-1 italic">
                    * All new members will require your approval before joining.
                  </Text>
                </View>
              </View>
              <View className="h-20" />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
