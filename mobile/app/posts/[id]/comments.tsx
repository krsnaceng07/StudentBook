import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { usePostStore } from '../../../store/postStore';
import { useAuthStore } from '../../../store/authStore';
import { useProfileStore } from '../../../store/profileStore';
import { formatDistanceToNow } from '../../../utils/date';
import client from '../../../api/client';

export default function CommentScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { posts, addComment, fetchPosts } = usePostStore();
  const { user } = useAuthStore();
  const { profile } = useProfileStore();

  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const post = posts.find((p: any) => p._id === id);

  useEffect(() => {
    loadComments();
  }, [id]);

  const loadComments = async () => {
    setIsLoading(true);
    try {
      const res = await client.get(`/posts/${id}/comments`);
      setComments(res.data.data);
    } catch (error) {
      console.error('Failed to load comments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!newComment.trim() || isSubmitting) return;
    setIsSubmitting(true);
    const result = await addComment(id, newComment);
    if (result.success) {
      setNewComment('');
      // Optimistically add comment or reload
      loadComments();
    }
    setIsSubmitting(false);
  };

  const renderComment = ({ item }: { item: any }) => (
    <View className="mb-4 flex-row items-start">
      <TouchableOpacity 
        onPress={() => router.push(`/profile/${item.user._id}`)}
        className="h-8 w-8 bg-slate-800 rounded-full items-center justify-center border border-white/10 overflow-hidden mr-3"
      >
        {item.user.avatar ? (
          <Image source={{ uri: item.user.avatar }} className="w-full h-full" />
        ) : (
          <Text className="text-white text-xs font-bold">{item.user.name.charAt(0)}</Text>
        )}
      </TouchableOpacity>
      <View className="flex-1 bg-white/5 rounded-2xl p-3 border border-white/10">
        <View className="flex-row items-center justify-between mb-1">
          <TouchableOpacity onPress={() => router.push(`/profile/${item.user._id}`)}>
            <Text className="text-white font-bold text-sm">{item.user.name}</Text>
          </TouchableOpacity>
          <Text className="text-slate-500 text-[10px]">
            {formatDistanceToNow(new Date(item.createdAt))}
          </Text>
        </View>
        <Text className="text-slate-300 text-sm">{item.content}</Text>
        <View className="flex-row items-center mt-2 space-x-4">
          <TouchableOpacity className="flex-row items-center">
            <Ionicons name="heart-outline" size={14} color="#94A3B8" />
            <Text className="text-slate-500 text-xs ml-1">{item.likesCount || 0}</Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Text className="text-[#3B82F6] text-xs font-bold">Reply</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-[#0F172A]"
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Header */}
      <View className="pt-14 px-6 pb-4 flex-row items-center border-b border-white/5">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold">Comments</Text>
      </View>

      <FlatList
        data={comments}
        keyExtractor={(item) => item._id}
        renderItem={renderComment}
        ListHeaderComponent={() => post && (
          <View className="px-6 py-6 border-b border-white/5 mb-6">
             <TouchableOpacity 
               onPress={() => router.push(`/profile/${post.author._id}`)}
               className="flex-row items-center mb-4"
             >
                <View className="h-10 w-10 bg-slate-800 rounded-full items-center justify-center mr-3 border border-white/10 overflow-hidden">
                  {post.author.avatar ? <Image source={{ uri: post.author.avatar }} className="w-full h-full" /> : <Text className="text-white font-bold">{post.author.name.charAt(0)}</Text>}
                </View>
                <View>
                  <Text className="text-white font-bold">{post.author.name}</Text>
                  <Text className="text-slate-500 text-xs">@{post.author.username}</Text>
                </View>
             </TouchableOpacity>
             <Text className="text-slate-200 text-base">{post.content}</Text>
          </View>
        )}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}
        ListEmptyComponent={() => !isLoading && (
          <View className="items-center mt-20">
            <Ionicons name="chatbubbles-outline" size={40} color="#334155" />
            <Text className="text-slate-500 mt-4">No comments yet. Be the first to reply!</Text>
          </View>
        )}
      />

      {/* Input */}
      <View className="absolute bottom-0 left-0 right-0 bg-[#0F172A] border-t border-white/10 px-6 py-4 flex-row items-center">
        <View className="h-10 w-10 bg-slate-800 rounded-full items-center justify-center mr-3 border border-white/10 overflow-hidden">
           {profile?.avatar ? <Image source={{ uri: profile.avatar }} className="w-full h-full" /> : <Text className="text-white font-bold">{user?.name?.charAt(0)}</Text>}
        </View>
        <TextInput
          className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-2 text-white"
          placeholder="Add a comment..."
          placeholderTextColor="#64748B"
          value={newComment}
          onChangeText={setNewComment}
          multiline
        />
        <TouchableOpacity 
          onPress={handleSubmit}
          disabled={!newComment.trim() || isSubmitting}
          className="ml-3"
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#3B82F6" />
          ) : (
            <Ionicons name="send" size={24} color={newComment.trim() ? "#3B82F6" : "#334155"} />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
