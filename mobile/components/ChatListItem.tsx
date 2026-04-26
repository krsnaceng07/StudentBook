import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useChatStore } from '../store/chatStore';

interface ChatListItemProps {
  conversation: {
    _id: string;
    type?: string;
    otherUser: {
      _id: string;
      name: string;
      avatar?: string;
    };
    lastMessage: string;
    updatedAt: string;
  };
}

export default function ChatListItem({ conversation }: ChatListItemProps) {
  const router = useRouter();
  const { typingUsers, onlineUsers } = useChatStore();
  
  const date = new Date(conversation.updatedAt);
  const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const isTeam = conversation.type === 'team';
  const otherUserId = conversation.otherUser?._id;
  const isOnline = !isTeam && otherUserId && onlineUsers.has(otherUserId);
  
  // Typing detection
  const typers = typingUsers[conversation._id];
  const isTyping = typers && Object.keys(typers).length > 0;

  return (
    <TouchableOpacity 
      onPress={() => router.push(`/chat/${conversation._id}`)}
      className="bg-white/5 rounded-[28px] border border-white/10 p-5 mb-4 flex-row items-center"
      activeOpacity={0.7}
    >
      <View>
        <TouchableOpacity 
          onPress={(e) => {
            if (!isTeam && otherUserId) {
              e.stopPropagation();
              router.push(`/profile/${otherUserId}`);
            }
          }}
          className={`h-16 w-16 rounded-2xl items-center justify-center border overflow-hidden ${
            isTeam ? 'bg-purple-500/10 border-purple-500/20' : 'bg-[#3B82F6]/10 border-[#3B82F6]/20'
          }`}
        >
          {isTeam ? (
            <Ionicons name="people" size={28} color="#A855F7" />
          ) : conversation.otherUser.avatar ? (
            <Image source={{ uri: conversation.otherUser.avatar }} className="w-full h-full" />
          ) : (
            <Text className="text-[#3B82F6] text-2xl font-black">
              {conversation.otherUser.name.charAt(0)}
            </Text>
          )}
        </TouchableOpacity>
        
        {isOnline && (
          <View className="absolute -bottom-1 -right-1 h-4 w-4 bg-emerald-500 rounded-full border-2 border-[#0F172A]" />
        )}
      </View>
      
      <View className="ml-4 flex-1">
        <View className="flex-row justify-between items-center mb-1">
          <View className="flex-row items-center">
            <Text className="text-white font-black text-lg" numberOfLines={1}>
              {conversation.otherUser.name}
            </Text>
            {isTeam && (
              <View className="bg-purple-500/10 px-2 py-0.5 rounded-md ml-2 border border-purple-500/20">
                <Text className="text-purple-500 text-[8px] font-black uppercase tracking-tighter">Team</Text>
              </View>
            )}
          </View>
          <Text className="text-slate-500 text-[10px] font-bold">{timeString}</Text>
        </View>
        
        <View className="flex-row items-center">
          {isTyping ? (
             <Text className="text-[#3B82F6] text-sm font-bold italic animate-pulse">Typing...</Text>
          ) : (
            <Text className="text-slate-400 text-sm" numberOfLines={1}>
              {conversation.lastMessage || 'Start collaborating...'}
            </Text>
          )}
        </View>
      </View>

      <Ionicons name="chevron-forward" size={16} color="#334155" />
    </TouchableOpacity>
  );
}
