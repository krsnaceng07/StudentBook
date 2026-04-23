import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useConnectionStore } from '../store/connectionStore';

interface RequestCardProps {
  request: {
    _id: string;
    user: {
      _id: string;
      name: string;
      avatar?: string;
      field: string;
      skills: string[];
    };
  };
}

export default function RequestCard({ request }: RequestCardProps) {
  const { handleRequest } = useConnectionStore();
  const [loading, setLoading] = useState<string | null>(null);
  const router = useRouter();

  const onAction = async (status: 'accepted' | 'rejected') => {
    setLoading(status);
    await handleRequest(request._id, status);
    setLoading(null);
  };

  return (
    <View className="bg-white/5 rounded-2xl border border-white/10 p-5 mb-4">
      <TouchableOpacity 
        onPress={() => router.push(`/profile/${request.user._id}`)}
        className="flex-row items-center mb-4"
      >
        <View className="h-14 w-14 bg-[#3B82F6]/10 rounded-full items-center justify-center border border-[#3B82F6]/20 overflow-hidden">
          {request.user.avatar ? (
            <Image 
              source={{ uri: request.user.avatar }} 
              className="w-full h-full" 
            />
          ) : (
            <Text className="text-[#3B82F6] text-xl font-bold">{request.user.name.charAt(0)}</Text>
          )}
        </View>
        <View className="ml-4 flex-1">
          <Text className="text-white text-lg font-bold">{request.user.name}</Text>
          <Text className="text-slate-400 text-xs">{request.user.field}</Text>
        </View>
      </TouchableOpacity>

      <View className="flex-row flex-wrap gap-2 mb-6">
        {request.user.skills.slice(0, 3).map((skill, idx) => (
          <View key={idx} className="bg-white/5 px-2 py-1 rounded-md border border-white/10">
            <Text className="text-slate-500 text-[10px] font-medium">{skill}</Text>
          </View>
        ))}
      </View>

      <View className="flex-row gap-3">
        <TouchableOpacity 
          onPress={() => onAction('accepted')}
          disabled={!!loading}
          className="flex-1 bg-[#3B82F6] rounded-xl py-3 items-center"
        >
          {loading === 'accepted' ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text className="text-white font-bold">Accept</Text>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={() => onAction('rejected')}
          disabled={!!loading}
          className="flex-1 bg-white/5 rounded-xl py-3 items-center border border-white/10"
        >
          {loading === 'rejected' ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text className="text-slate-300 font-bold">Decline</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
