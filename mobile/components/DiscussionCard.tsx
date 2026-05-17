import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUIStore } from '../store/uiStore';
import { useRouter } from 'expo-router';

interface DiscussionCardProps {
  discussion: {
    id: string;
    title: string;
    content: string;
    type: 'question' | 'team_search';
    created_at: string;
    comment_count?: { count: number }[];
    author?: {
      full_name: string;
      avatar_url: string;
      college_name: string;
    };
  };
}

export default function DiscussionCard({ discussion }: DiscussionCardProps) {
  const { isDarkMode } = useUIStore();
  const router = useRouter();
  
  const isQuestion = discussion.type === 'question';
  const author = discussion.author;

  return (
    <TouchableOpacity 
      onPress={() => router.push(`/discussion/${discussion.id}` as any)}
      activeOpacity={0.7}
      className={`mb-4 p-5 rounded-3xl border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-slate-100'} shadow-sm`}
    >
      {/* Header: Author & Type */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          <View className={`h-10 w-10 rounded-full items-center justify-center ${isDarkMode ? 'bg-white/10' : 'bg-slate-100'} overflow-hidden mr-3`}>
            {author?.avatar_url ? (
              <Image source={{ uri: author.avatar_url }} className="h-full w-full" />
            ) : (
              <View className="flex-1 items-center justify-center">
                <Ionicons name="person" size={20} color="#94A3B8" />
              </View>
            )}
          </View>
          <View>
            <Text className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              {author?.full_name || 'Student'}
            </Text>
            <Text className="text-slate-500 text-xs">{author?.college_name || 'University'}</Text>
          </View>
        </View>
        
        <View className={`px-3 py-1 rounded-full ${isQuestion ? 'bg-amber-100' : 'bg-indigo-100'}`}>
          <Text className={`text-[10px] font-bold uppercase ${isQuestion ? 'text-amber-600' : 'text-indigo-600'}`}>
            {isQuestion ? 'Question' : 'Team Search'}
          </Text>
        </View>
      </View>

      {/* Content */}
      <Text className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
        {discussion.title}
      </Text>
      <Text className="text-slate-500 text-sm leading-5" numberOfLines={3}>
        {discussion.content}
      </Text>

      {/* Footer: Stats */}
      <View className="flex-row items-center mt-4 pt-4 border-t border-slate-50 dark:border-white/5">
        <View className="flex-row items-center mr-6">
          <Ionicons name="chatbubble-outline" size={18} color="#64748B" />
          <Text className="text-slate-500 text-xs ml-1.5 font-medium">{discussion.comment_count?.[0]?.count || 0} comments</Text>
        </View>
        <View className="flex-row items-center">
          <Ionicons name="time-outline" size={18} color="#64748B" />
          <Text className="text-slate-500 text-xs ml-1.5 font-medium">
            {new Date(discussion.created_at).toLocaleDateString()}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
