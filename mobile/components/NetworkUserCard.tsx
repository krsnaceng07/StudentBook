import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useChatStore } from '../store/chatStore';

interface NetworkUserCardProps {
  user: {
    userId: string;
    name: string;
    avatar?: string;
    field: string;
    skills: string[];
  };
}

export default function NetworkUserCard({ user }: NetworkUserCardProps) {
  const router = useRouter();
  const { createConversation } = useChatStore();

  const handleMessage = async () => {
    const result = await createConversation(user.userId);
    if (result.success) {
      router.push(`/chat/${result.conversation._id}`);
    }
  };

  return (
    <View className="bg-white/5 rounded-2xl border border-white/10 p-4 mb-3 flex-row items-center justify-between">
      <TouchableOpacity 
        onPress={() => router.push(`/profile/${user.userId}`)}
        className="flex-row items-center flex-1"
      >
        <View className="h-12 w-12 bg-white/10 rounded-full items-center justify-center border border-white/10 overflow-hidden">
          {user.avatar ? (
            <Image 
              source={{ uri: user.avatar }} 
              className="w-full h-full" 
            />
          ) : (
            <Text className="text-white font-bold">{user.name.charAt(0)}</Text>
          )}
        </View>
        <View className="ml-3 flex-1">
          <Text className="text-white font-bold">{user.name}</Text>
          <Text className="text-slate-500 text-xs" numberOfLines={1}>{user.field}</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity 
        className="bg-white/5 h-10 w-10 rounded-full items-center justify-center border border-white/10 ml-2"
        onPress={handleMessage}
      >
        <Ionicons name="chatbubble-ellipses-outline" size={18} color="#3B82F6" />
      </TouchableOpacity>
    </View>
  );
}
