import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePostStore } from '../store/postStore';
import { useAuthStore } from '../store/authStore';
import { useProfileStore } from '../store/profileStore';
import { pickImage, uploadFile } from '../utils/imagePicker';
import { Image } from 'expo-image';

export default function CreatePostBox() {
  const [content, setContent] = useState('');
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { createPost, isLoading: isPosting } = usePostStore();
  const { user } = useAuthStore();
  const { profile } = useProfileStore();

  const handlePickImage = async () => {
    const asset = await pickImage({ quality: 0.9 });
    if (asset) {
      setSelectedImage(asset);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
  };

  const handlePost = async () => {
    if (!content.trim() && !selectedImage) return;
    
    let imageUrls: string[] = [];
    
    if (selectedImage) {
      setIsUploading(true);
      try {
        const uploadResult = await uploadFile(selectedImage, '/upload/post');
        if (uploadResult.success) {
          imageUrls = [uploadResult.url];
        }
      } catch (error) {
        Alert.alert('Upload Failed', 'Failed to upload image. Post without image?');
        setIsUploading(false);
        return;
      }
      setIsUploading(false);
    }

    const result = await createPost(content, imageUrls);
    if (result.success) {
      setContent('');
      setSelectedImage(null);
    }
  };

  const isLoading = isPosting || isUploading;

  return (
    <View className="bg-[#1E293B]/40 rounded-[32px] border border-white/10 p-5 mb-6 shadow-2xl">
      <View className="flex-row items-start">
        <View className="h-11 w-11 bg-slate-800 rounded-full items-center justify-center border border-white/10 overflow-hidden mr-3 shadow-inner">
          {profile?.avatar ? (
            <Image 
              source={profile.avatar} 
              style={{ width: '100%', height: '100%' }}
              contentFit="cover"
            />
          ) : (
            <Text className="text-white font-bold text-lg">{user?.name?.charAt(0) || 'U'}</Text>
          )}
        </View>
        <TextInput
          className="flex-1 text-white text-[16px] leading-6 py-1"
          placeholder="What's happening on campus?"
          placeholderTextColor="#94A3B8"
          multiline
          value={content}
          onChangeText={setContent}
          maxLength={2000}
        />
      </View>

      {selectedImage && (
        <View className="mt-4 relative bg-black/40 rounded-2xl overflow-hidden border border-white/10 shadow-lg" style={{ aspectRatio: 4 / 5, maxHeight: 400 }}>
          {/* Blurred Background Layer */}
          <Image 
            source={selectedImage.uri} 
            style={{ width: '100%', height: '100%', opacity: 0.4 }}
            contentFit="cover"
            blurRadius={20}
          />
          
          {/* Original Image Layer (Contain mode = 0% crop) */}
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
            <Image 
              source={selectedImage.uri} 
              style={{ width: '100%', height: '100%' }}
              contentFit="contain"
            />
          </View>

          <TouchableOpacity 
            onPress={removeImage}
            className="absolute top-3 right-3 bg-black/60 h-9 w-9 rounded-full items-center justify-center border border-white/10"
          >
            <Ionicons name="close" size={22} color="white" />
          </TouchableOpacity>
        </View>
      )}
      
      <View className="flex-row items-center justify-between mt-4 pt-4 border-t border-white/5">
        <View className="flex-row space-x-2">
          <TouchableOpacity 
            onPress={handlePickImage}
            className="h-10 w-10 rounded-full items-center justify-center bg-blue-500/10"
          >
            <Ionicons name="image" size={20} color="#60A5FA" />
          </TouchableOpacity>
          <TouchableOpacity className="h-10 w-10 rounded-full items-center justify-center bg-slate-800/50">
            <Ionicons name="at" size={20} color="#94A3B8" />
          </TouchableOpacity>
          <TouchableOpacity className="h-10 w-10 rounded-full items-center justify-center bg-slate-800/50">
            <Ionicons name="happy-outline" size={20} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          onPress={handlePost}
          disabled={(!content.trim() && !selectedImage) || isLoading}
          className={`px-8 py-2.5 rounded-full shadow-lg ${(!content.trim() && !selectedImage) ? 'bg-slate-700/50' : 'bg-[#3B82F6]'}`}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text className="text-white font-bold tracking-tight">Post</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
