import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, ActivityIndicator, 
  Alert, Modal, KeyboardAvoidingView, Platform, 
  Keyboard, ScrollView 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { usePostStore } from '../store/postStore';
import { useAuthStore } from '../store/authStore';
import { useProfileStore } from '../store/profileStore';
import { pickImage, uploadFile } from '../utils/imagePicker';
import { Image } from 'expo-image';

interface CreatePostModalProps {
  isVisible: boolean;
  onClose: () => void;
  postToEdit?: any;
}

export default function CreatePostModal({ isVisible, onClose, postToEdit }: CreatePostModalProps) {
  const [content, setContent] = useState('');
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { createPost, updatePost, isLoading: isPosting } = usePostStore();
  const { user } = useAuthStore();
  const { profile } = useProfileStore();

  // Initialize content if editing
  useEffect(() => {
    if (isVisible && postToEdit) {
      setContent(postToEdit.content || '');
      // If post has images, set the first one as selected
      if (postToEdit.images && postToEdit.images.length > 0) {
        setSelectedImage({ uri: postToEdit.images[0], isRemote: true }); 
      } else {
        setSelectedImage(null);
      }
    } else if (isVisible && !postToEdit) {
      setContent('');
      setSelectedImage(null);
    }
  }, [isVisible, postToEdit]);

  const handlePickImage = async () => {
    const asset = await pickImage({ quality: 0.9 });
    if (asset) {
      setSelectedImage({ ...asset, isRemote: false });
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
  };

  const handlePost = async () => {
    const hasContent = content.trim().length > 0;
    if (!hasContent && !selectedImage) return;
    
    let imageUrls: string[] = [];
    
    // Case 1: Image is being uploaded (newly selected)
    if (selectedImage && !selectedImage.isRemote) {
      setIsUploading(true);
      try {
        const uploadResult = await uploadFile(selectedImage, '/upload/post');
        if (uploadResult.success) {
          imageUrls = [uploadResult.url];
        }
      } catch (error) {
        Alert.alert('Upload Failed', 'Failed to upload image.');
        setIsUploading(false);
        return;
      }
      setIsUploading(false);
    } 
    // Case 2: Image is remote (existing one being kept)
    else if (selectedImage && selectedImage.isRemote) {
      imageUrls = [selectedImage.uri];
    }
    // Case 3: selectedImage is null (removed) -> imageUrls is empty []

    if (postToEdit) {
      const result = await updatePost(postToEdit._id, content, imageUrls);
      if (result.success) {
        onClose();
      }
      return;
    }

    const result = await createPost(content, imageUrls);
    if (result.success) {
      setContent('');
      setSelectedImage(null);
      onClose();
    }
  };

  const isLoading = isPosting || isUploading;

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-[#0F172A]">
        <SafeAreaView className="flex-1">
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1"
          >
            {/* Header */}
            <View className="flex-row items-center justify-between px-6 py-4 border-b border-white/10">
              <TouchableOpacity onPress={onClose} className="p-2 -ml-2">
                <Ionicons name="close" size={28} color="white" />
              </TouchableOpacity>
              <Text className="text-white text-lg font-bold">{postToEdit ? 'Edit Post' : 'Create Post'}</Text>
              <TouchableOpacity 
                onPress={handlePost}
                disabled={(!content.trim() && !selectedImage) || isLoading}
                className={`px-6 py-2 rounded-full ${(!content.trim() && !selectedImage) ? 'bg-slate-700/50' : 'bg-[#3B82F6]'}`}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text className="text-white font-bold">{postToEdit ? 'Update' : 'Post'}</Text>
                )}
              </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 px-6 pt-6">
              <View className="flex-row items-center mb-6">
                <View className="h-12 w-12 bg-slate-800 rounded-full items-center justify-center border border-white/10 overflow-hidden mr-4">
                  {profile?.avatar ? (
                    <Image source={profile.avatar} style={{ width: '100%', height: '100%' }} contentFit="cover" />
                  ) : (
                    <Text className="text-white font-bold text-xl">{user?.name?.charAt(0) || 'U'}</Text>
                  )}
                </View>
                <View>
                  <Text className="text-white font-bold text-base">{user?.name}</Text>
                  <Text className="text-slate-400 text-xs">@{user?.username}</Text>
                </View>
              </View>

              <TextInput
                className="text-white text-lg leading-7 mb-6"
                placeholder="Share something with your campus..."
                placeholderTextColor="#64748B"
                multiline
                autoFocus
                value={content}
                onChangeText={setContent}
                textAlignVertical="top"
              />

              {selectedImage && (
                <View className="relative bg-black/40 rounded-3xl overflow-hidden border border-white/10 mb-6" style={{ aspectRatio: 1 }}>
                  <Image 
                    source={selectedImage.uri} 
                    style={{ width: '100%', height: '100%' }}
                    contentFit="cover"
                  />
                  <TouchableOpacity 
                    onPress={removeImage}
                    className="absolute top-4 right-4 bg-black/60 h-10 w-10 rounded-full items-center justify-center border border-white/10"
                  >
                    <Ionicons name="close" size={24} color="white" />
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>

            {/* Bottom Toolbar */}
            <View className="px-6 py-4 border-t border-white/10 flex-row items-center">
              <TouchableOpacity 
                onPress={handlePickImage}
                className="flex-row items-center bg-white/5 px-4 py-2 rounded-full border border-white/10 mr-3"
              >
                <Ionicons name="image" size={20} color="#3B82F6" />
                <Text className="text-white ml-2 font-medium">Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                className="flex-row items-center bg-white/5 px-4 py-2 rounded-full border border-white/10"
              >
                <Ionicons name="at" size={20} color="#94A3B8" />
                <Text className="text-white ml-2 font-medium">Tag</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </View>
    </Modal>
  );
}
