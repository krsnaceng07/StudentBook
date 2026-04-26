import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, ActivityIndicator, Platform, Image, Keyboard, KeyboardAvoidingView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePostStore } from '../../../store/postStore';
import { useAuthStore } from '../../../store/authStore';
import { useProfileStore } from '../../../store/profileStore';
import { useCommentStore } from '../../../store/commentStore';
import { formatDistanceToNow } from '../../../utils/date';

export default function CommentScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { posts } = usePostStore();
  const { user } = useAuthStore();
  const { profile } = useProfileStore();
  const { 
    comments, isLoading, replyTo, 
    fetchComments, addComment, likeComment, setReplyTo 
  } = useCommentStore();

  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const post = posts.find((p: any) => p._id === id);

  useEffect(() => {
    fetchComments(id as string);
  }, [id]);

  const handleSubmit = async () => {
    if (!newComment.trim() || isSubmitting) return;
    setIsSubmitting(true);
    const result = await addComment(id as string, newComment);
    if (result.success) {
      setNewComment('');
      Keyboard.dismiss();
    }
    setIsSubmitting(false);
  };

  const displayComments = useMemo(() => {
    const parents = comments.filter(c => !c.parentId);
    const result: any[] = [];
    
    parents.forEach(parent => {
      result.push(parent);
      const replies = comments.filter(c => c.parentId === parent._id);
      replies.forEach(reply => {
        result.push({ ...reply, isReply: true });
      });
    });
    
    return result;
  }, [comments]);

  const renderComment = ({ item }: { item: any }) => (
    <View className={`mb-4 flex-row items-start ${item.isReply ? 'ml-10' : ''}`}>
      <TouchableOpacity 
        onPress={() => router.push(`/profile/${item.user._id}`)}
        className={`${item.isReply ? 'h-6 w-6' : 'h-8 w-8'} bg-slate-800 rounded-full items-center justify-center border border-white/10 overflow-hidden mr-3`}
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
          <TouchableOpacity 
            onPress={() => likeComment(item._id)}
            className="flex-row items-center"
          >
            <Ionicons 
              name={item.isLiked ? "heart" : "heart-outline"} 
              size={14} 
              color={item.isLiked ? "#EF4444" : "#94A3B8"} 
            />
            <Text className={`text-xs ml-1 ${item.isLiked ? 'text-[#EF4444]' : 'text-slate-500'}`}>
              {item.likesCount || 0}
            </Text>
          </TouchableOpacity>
          
          {!item.isReply && (
            <TouchableOpacity onPress={() => setReplyTo(item)}>
              <Text className="text-[#3B82F6] text-xs font-bold">Reply</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-[#0F172A]">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <SafeAreaView className="flex-1 bg-[#0F172A]" edges={['top']}>
          {/* Header */}
          <View className="px-6 py-4 flex-row items-center border-b border-white/5">
            <TouchableOpacity onPress={() => router.back()} className="mr-4">
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text className="text-white text-xl font-bold">Comments</Text>
          </View>

          <FlatList
            data={displayComments}
            keyExtractor={(item) => item._id}
            renderItem={renderComment}
            keyboardShouldPersistTaps="handled"
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
            contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 20 }}
            ListEmptyComponent={() => !isLoading && (
              <View className="items-center mt-20">
                <Ionicons name="chatbubbles-outline" size={40} color="#334155" />
                <Text className="text-slate-500 mt-4">No comments yet. Be the first to reply!</Text>
              </View>
            )}
          />

          {/* Input Section */}
          <View className="bg-[#1E293B] border-t border-white/10 px-4 py-3" style={{ paddingBottom: insets.bottom || 20 }}>
            {replyTo && (
              <View className="bg-white/5 px-4 py-2 flex-row items-center justify-between rounded-t-xl border-b border-white/5 mb-2">
                <Text className="text-slate-400 text-xs">
                  Replying to <Text className="text-[#3B82F6] font-bold">@{replyTo.user.username}</Text>
                </Text>
                <TouchableOpacity onPress={() => setReplyTo(null)}>
                  <Ionicons name="close-circle" size={18} color="#94A3B8" />
                </TouchableOpacity>
              </View>
            )}
            
            <View className="flex-row items-center">
              <View className="h-9 w-9 bg-slate-800 rounded-full items-center justify-center mr-3 border border-white/10 overflow-hidden">
                 {profile?.avatar ? <Image source={{ uri: profile.avatar }} className="w-full h-full" /> : <Text className="text-white font-bold">{user?.name?.charAt(0)}</Text>}
              </View>
              <TextInput
                className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-2 text-white text-sm"
                placeholder={replyTo ? "Add a reply..." : "Add a comment..."}
                placeholderTextColor="#64748B"
                value={newComment}
                onChangeText={setNewComment}
                multiline
                maxHeight={100}
              />
              <TouchableOpacity 
                onPress={handleSubmit}
                disabled={!newComment.trim() || isSubmitting}
                className="ml-3 h-10 w-10 items-center justify-center"
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#3B82F6" />
                ) : (
                  <Ionicons name="send" size={24} color={newComment.trim() ? "#3B82F6" : "#334155"} />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  );
}
