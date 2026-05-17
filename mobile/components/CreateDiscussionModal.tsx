import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUIStore } from '../store/uiStore';
import { useDiscussionStore } from '../store/discussionStore';

interface CreateDiscussionModalProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function CreateDiscussionModal({ isVisible, onClose }: CreateDiscussionModalProps) {
  const { isDarkMode, showToast } = useUIStore();
  const { createDiscussion, isLoading } = useDiscussionStore();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<'question' | 'team_search'>('question');

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    const res = await createDiscussion({ title, content, type });
    if (res.success) {
      showToast('Post created successfully!', 'success');
      setTitle('');
      setContent('');
      onClose();
    } else {
      showToast(res.error || 'Failed to create post', 'error');
    }
  };

  return (
    <Modal visible={isVisible} animationType="slide" transparent>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className={`h-[85%] rounded-t-[40px] ${isDarkMode ? 'bg-[#0F172A]' : 'bg-white'} p-6`}>
            {/* Header */}
            <View className="flex-row items-center justify-between mb-8">
              <TouchableOpacity onPress={onClose} className="h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-white/10">
                <Ionicons name="close" size={24} color={isDarkMode ? 'white' : 'black'} />
              </TouchableOpacity>
              <Text className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>New Discussion</Text>
              <TouchableOpacity 
                onPress={handleSubmit}
                disabled={isLoading}
                className="bg-blue-600 px-6 py-2.5 rounded-full"
              >
                {isLoading ? <ActivityIndicator size="small" color="white" /> : <Text className="text-white font-bold">Post</Text>}
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Type Selector */}
              <Text className="text-slate-500 font-bold mb-3 uppercase tracking-wider text-xs">Post Type</Text>
              <View className="flex-row mb-6 bg-slate-100 dark:bg-white/5 p-1.5 rounded-2xl">
                <TouchableOpacity 
                  onPress={() => setType('question')}
                  className={`flex-1 py-3 rounded-xl flex-row items-center justify-center ${type === 'question' ? (isDarkMode ? 'bg-white/10' : 'bg-white shadow-sm') : ''}`}
                >
                  <Ionicons name="help-circle" size={18} color={type === 'question' ? '#3B82F6' : '#94A3B8'} />
                  <Text className={`ml-2 font-bold ${type === 'question' ? (isDarkMode ? 'text-white' : 'text-slate-900') : 'text-slate-400'}`}>Question</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => setType('team_search')}
                  className={`flex-1 py-3 rounded-xl flex-row items-center justify-center ${type === 'team_search' ? (isDarkMode ? 'bg-white/10' : 'bg-white shadow-sm') : ''}`}
                >
                  <Ionicons name="people" size={18} color={type === 'team_search' ? '#3B82F6' : '#94A3B8'} />
                  <Text className={`ml-2 font-bold ${type === 'team_search' ? (isDarkMode ? 'text-white' : 'text-slate-900') : 'text-slate-400'}`}>Team Search</Text>
                </TouchableOpacity>
              </View>

              {/* Title Input */}
              <Text className="text-slate-500 font-bold mb-3 uppercase tracking-wider text-xs">Title</Text>
              <TextInput 
                placeholder={type === 'question' ? "What's your question?" : "What project are you building?"}
                placeholderTextColor="#94A3B8"
                value={title}
                onChangeText={setTitle}
                className={`p-4 rounded-2xl mb-6 text-base ${isDarkMode ? 'bg-white/5 text-white border-white/10' : 'bg-slate-50 text-slate-900 border-slate-200'} border`}
              />

              {/* Content Input */}
              <Text className="text-slate-500 font-bold mb-3 uppercase tracking-wider text-xs">Details</Text>
              <TextInput 
                placeholder={type === 'question' ? "Describe your problem in detail..." : "Tell us about your project and who you need..."}
                placeholderTextColor="#94A3B8"
                value={content}
                onChangeText={setContent}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
                className={`p-4 rounded-2xl mb-6 h-40 text-base ${isDarkMode ? 'bg-white/5 text-white border-white/10' : 'bg-slate-50 text-slate-900 border-slate-200'} border`}
              />
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
