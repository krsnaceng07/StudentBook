import React from 'react';
import { View, Text, TouchableOpacity, Share, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { usePostStore } from '../store/postStore';
import { useAuthStore } from '../store/authStore';
import { formatDistanceToNow } from '../utils/date';
import { Image } from 'expo-image';
import useUIStore from '../store/uiStore';

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
  const { likePost, deletePost } = usePostStore();
  const { user } = useAuthStore();
  const { isDarkMode } = useUIStore();

  const isAuthor = (user?._id ?? user?.id) === (post.author?._id ?? post.author?.id);
  const timeAgo = post.createdAt ? formatDistanceToNow(new Date(post.createdAt)) : 'recently';

  const handleLike = () => {
    likePost(post._id);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${post.author?.name || 'A user'} posted on StudentSociety: ${post.content}\n\nJoin us at StudentSociety!`,
      });
    } catch (error) {
      console.error('Share Error:', error);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Post",
      "Are you sure you want to delete this post? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: () => deletePost(post._id)
        }
      ]
    );
  };

  // Helper to render text with clickable hashtags and mentions
  const renderRichText = (text: string) => {
    if (!text) return null;
    
    const parts = text.split(/([@#]\w+)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('#')) {
        return (
          <Text 
            key={index} 
            className={`${isDarkMode ? 'text-white' : 'text-[#3B82F6]'} font-bold`}
            onPress={() => router.push({ pathname: '/(tabs)', params: { search: part } })}
          >
            {part}
          </Text>
        );
      } else if (part.startsWith('@')) {
        return (
          <Text 
            key={index} 
            className={`${isDarkMode ? 'text-white' : 'text-[#3B82F6]'} font-bold`}
            onPress={() => router.push({ pathname: '/(tabs)', params: { search: part } })}
          >
            {part}
          </Text>
        );
      }
      return <Text key={index} className={isDarkMode ? 'text-slate-200' : 'text-slate-800'}>{part}</Text>;
    });
  };

  return (
    <View className={`${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-slate-100 shadow-sm'} rounded-3xl border mb-4 overflow-hidden`}>
      {/* Header */}
      <View className="p-4 flex-row items-center justify-between">
        <TouchableOpacity 
          onPress={() => post.author?._id && router.push(`/profile/${post.author._id}`)}
          className="flex-row items-center flex-1"
        >
          <View className={`${isDarkMode ? 'bg-white/5 border-white/20' : 'bg-slate-100 border-slate-200'} h-11 w-11 rounded-full items-center justify-center border overflow-hidden`}>
            {post.author?.avatar ? (
              <Image 
                source={{ uri: post.author.avatar || undefined }} 
                style={{ width: '100%', height: '100%' }}
                contentFit="cover"
              />
            ) : (
              <Text className={`${isDarkMode ? 'text-white' : 'text-black'} text-lg font-bold`}>
                {(post.author?.name || 'U').charAt(0)}
              </Text>
            )}
          </View>
          <View className="ml-3">
            <Text className={`${isDarkMode ? 'text-white' : 'text-black'} font-semibold text-[15px] leading-5`}>{post.author?.name || 'Unknown User'}</Text>
            <View className="flex-row items-center">
              <Text className={`${isDarkMode ? 'text-slate-400' : 'text-slate-500'} text-xs`}>@{post.author?.username || 'user'}</Text>
              <View className={`h-1 w-1 rounded-full ${isDarkMode ? 'bg-slate-600' : 'bg-slate-300'} mx-1.5`} />
              <Text className={`${isDarkMode ? 'text-slate-500' : 'text-slate-400'} text-xs`}>{timeAgo}</Text>
            </View>
          </View>
        </TouchableOpacity>
        
        {isAuthor && (
          <View className="flex-row items-center gap-2">
            <TouchableOpacity 
              onPress={() => onEdit?.(post)}
              className={`${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-200'} p-2 rounded-full border`}
            >
              <Ionicons name="pencil" size={16} color={isDarkMode ? '#FFFFFF' : '#000000'} />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={handleDelete}
              className={`${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-red-50 border-red-100'} p-2 rounded-full border`}
            >
              <Ionicons name="trash" size={16} color="#EF4444" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Content Text */}
      {post.content ? (
        <View className="px-4 pb-3">
          <Text className={`${isDarkMode ? 'text-slate-200' : 'text-slate-800'} text-base leading-6`}>
            {renderRichText(post.content)}
          </Text>
        </View>
      ) : null}

      {/* Media Content */}
      {post.images && post.images.length > 0 && post.images[0] ? (
        <View 
          className="w-full bg-slate-900/50 border-y border-white/5"
          style={{ minHeight: 250, maxHeight: 500 }}
        >
           <Image 
             source={{ uri: post.images[0] }} 
             style={{ width: '100%', height: '100%' }}
             contentFit="cover"
             placeholder={blurhash}
             transition={300}
             cachePolicy="memory-disk"
           />
        </View>
      ) : null}

      {/* Tags Section */}
      {post.tags && post.tags.length > 0 && (
        <View className="px-4 py-2 flex-row flex-wrap gap-2">
          {post.tags.map((tag, idx) => (
            <TouchableOpacity key={idx} onPress={() => router.push({ pathname: '/(tabs)', params: { search: `#${tag}` } })}>
              <Text className={`${isDarkMode ? 'text-white' : 'text-[#3B82F6]'} text-[13px] font-bold`}>#{tag}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Interactive Actions */}
      <View className={`px-4 py-3 flex-row items-center justify-between border-t ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
        <View className="flex-row items-center gap-8">
          <TouchableOpacity 
            onPress={handleLike}
            className="flex-row items-center"
          >
            <View className={`h-10 w-10 rounded-full items-center justify-center ${post.isLiked ? 'bg-red-500/10' : 'bg-transparent'}`}>
              <Ionicons 
                name={post.isLiked ? "heart" : "heart-outline"} 
                size={24} 
                color={post.isLiked ? "#EF4444" : "#94A3B8"} 
              />
            </View>
            <Text className={`font-bold text-[13px] ml-1 ${post.isLiked ? 'text-[#EF4444]' : 'text-slate-400'}`}>
              {post.likesCount > 0 ? post.likesCount : ''}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => router.push(`/posts/${post._id}/comments`)}
            className="flex-row items-center"
          >
            <View className="h-10 w-10 rounded-full items-center justify-center bg-transparent">
              <Ionicons name="chatbubble-outline" size={22} color="#94A3B8" />
            </View>
            <Text className="text-slate-400 font-bold text-[13px] ml-1">
              {post.commentsCount > 0 ? post.commentsCount : ''}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          onPress={handleShare}
          className={`${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-200'} h-10 w-10 rounded-full items-center justify-center border`}
        >
          <Ionicons name="share-social-outline" size={20} color={isDarkMode ? "#94A3B8" : "#000000"} />
        </TouchableOpacity>
      </View>
    </View>
  );
});
