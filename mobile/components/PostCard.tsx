import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { usePostStore } from '../store/postStore';
import { useAuthStore } from '../store/authStore';
import { formatDistanceToNow } from '../utils/date';
import { Image } from 'expo-image';

interface PostCardProps {
  post: {
    _id: string;
    content: string;
    author: {
      _id: string;
      name: string;
      username: string;
      avatar?: string | null;
    };
    likesCount: number;
    commentsCount: number;
    isLiked: boolean;
    createdAt: string;
    images?: string[];
    tags?: string[];
  };
  onEdit?: (post: any) => void;
}

const blurhash = '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQipWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{olj[ayj[j[fQayWCoeoeaya{j[ayfQa{olj[ayj[j[fQayWCoeoeaya{j[ayfQa{olj[ayj[j[fQayWC';

export default React.memo(function PostCard({ post, onEdit }: PostCardProps) {
  const router = useRouter();
  const { likePost } = usePostStore();
  const { user } = useAuthStore();

  const isAuthor = (user?._id ?? user?.id) === post.author._id;
  const timeAgo = formatDistanceToNow(new Date(post.createdAt));

  const handleLike = () => {
    likePost(post._id);
  };

  return (
    <View className="bg-[#1E293B]/50 rounded-3xl border border-white/10 mb-4 overflow-hidden shadow-xl">
      {/* Header */}
      <View className="p-4 flex-row items-center justify-between">
        <TouchableOpacity 
          onPress={() => router.push(`/profile/${post.author._id}`)}
          className="flex-row items-center flex-1"
        >
          <View className="h-11 w-11 bg-slate-800 rounded-full items-center justify-center border border-white/20 overflow-hidden shadow-inner">
            {post.author.avatar ? (
              <Image 
                source={post.author.avatar} 
                style={{ width: '100%', height: '100%' }}
                contentFit="cover"
              />
            ) : (
              <Text className="text-white text-lg font-bold">
                {post.author.name.charAt(0)}
              </Text>
            )}
          </View>
          <View className="ml-3">
            <Text className="text-white font-semibold text-[15px] leading-5">{post.author.name}</Text>
            <View className="flex-row items-center">
              <Text className="text-slate-400 text-xs">@{post.author.username}</Text>
              <View className="h-1 w-1 rounded-full bg-slate-600 mx-1.5" />
              <Text className="text-slate-500 text-xs">{timeAgo}</Text>
            </View>
          </View>
        </TouchableOpacity>
        
        {isAuthor && (
          <View className="flex-row items-center space-x-2">
            <TouchableOpacity 
              onPress={() => onEdit?.(post)}
              className="bg-white/5 p-2 rounded-full border border-white/10"
            >
              <Ionicons name="pencil" size={16} color="#3B82F6" />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => {
                const { usePostStore } = require('../store/postStore');
                usePostStore.getState().deletePost(post._id);
              }}
              className="bg-white/5 p-2 rounded-full border border-white/10"
            >
              <Ionicons name="trash" size={16} color="#EF4444" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Content Text */}
      {post.content ? (
        <View className="px-4 pb-3">
          <Text className="text-slate-200 text-base leading-[22px]">
            {post.content}
          </Text>
        </View>
      ) : null}

      {/* Media Content - Optimized for Millions of Posts */}
      {post.images && post.images.length > 0 && post.images[0] ? (
        <View 
          className="w-full bg-slate-900/50 border-y border-white/5"
          style={{ minHeight: 250, maxHeight: 500 }}
        >
           <Image 
             source={post.images[0]} 
             style={{ width: '100%', height: '100%' }}
             contentFit="cover"
             placeholder={blurhash}
             transition={300}
             cachePolicy="memory-disk"
           />
        </View>
      ) : null}

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <View className="px-4 py-2 flex-row flex-wrap gap-2">
          {post.tags.map((tag, idx) => (
            <Text key={idx} className="text-[#60A5FA] text-[13px] font-medium">#{tag}</Text>
          ))}
        </View>
      )}

      {/* Interactive Actions */}
      <View className="px-4 py-3 flex-row items-center justify-between border-t border-white/5">
        <View className="flex-row items-center space-x-6">
          <TouchableOpacity 
            onPress={handleLike}
            className="flex-row items-center"
          >
            <View className={`h-9 w-9 rounded-full items-center justify-center ${post.isLiked ? 'bg-red-500/10' : 'bg-transparent'}`}>
              <Ionicons 
                name={post.isLiked ? "heart" : "heart-outline"} 
                size={22} 
                color={post.isLiked ? "#EF4444" : "#94A3B8"} 
              />
            </View>
            <Text className={`font-medium text-sm ml-1 ${post.isLiked ? 'text-[#EF4444]' : 'text-slate-400'}`}>
              {post.likesCount > 0 ? post.likesCount : ''}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => router.push(`/posts/${post._id}/comments`)}
            className="flex-row items-center"
          >
            <View className="h-9 w-9 rounded-full items-center justify-center bg-transparent">
              <Ionicons name="chatbubble-outline" size={20} color="#94A3B8" />
            </View>
            <Text className="text-slate-400 font-medium text-sm ml-1">
              {post.commentsCount > 0 ? post.commentsCount : ''}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity className="h-9 w-9 rounded-full items-center justify-center">
          <Ionicons name="paper-plane-outline" size={20} color="#94A3B8" />
        </TouchableOpacity>
      </View>
    </View>
  );
});
