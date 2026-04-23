import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface ChatListItemProps {
  conversation: {
    _id: string;
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
  const date = new Date(conversation.updatedAt);
  const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const isTeam = (conversation as any).type === 'team';

  return (
    <TouchableOpacity 
      onPress={() => router.push(`/chat/${conversation._id}`)}
      className="bg-white/5 rounded-2xl border border-white/10 p-4 mb-3 flex-row items-center"
    >
      <TouchableOpacity 
        onPress={(e) => {
          if (!isTeam) {
            e.stopPropagation();
            router.push(`/profile/${conversation.otherUser._id}`);
          }
        }}
        className={`h-14 w-14 rounded-full items-center justify-center border ${
          isTeam ? 'bg-purple-500/10 border-purple-500/20' : 'bg-[#3B82F6]/10 border-[#3B82F6]/20'
        }`}
      >
        {isTeam ? (
          <Ionicons name="people" size={24} color="#A855F7" />
        ) : (
          <Text className="text-[#3B82F6] text-xl font-bold">
            {conversation.otherUser.name.charAt(0)}
          </Text>
        )}
      </TouchableOpacity>
      
      <View className="ml-4 flex-1">
        <View className="flex-row justify-between items-center mb-1">
          <View className="flex-row items-center">
            <Text className="text-white font-bold text-lg">{conversation.otherUser.name}</Text>
            {isTeam && (
              <View className="bg-purple-500/20 px-2 py-0.5 rounded-lg ml-2">
                <Text className="text-purple-500 text-[8px] font-bold uppercase">Team</Text>
              </View>
            )}
          </View>
          <Text className="text-slate-500 text-[10px]">{timeString}</Text>
        </View>
        <Text className="text-slate-400 text-sm" numberOfLines={1}>
          {conversation.lastMessage || 'Start a conversation...'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
