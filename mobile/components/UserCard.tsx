import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useConnectionStore } from '../store/connectionStore';

interface UserCardProps {
  user: {
    userId: string;
    name: string;
    username?: string;
    field: string;
    skills: string[];
    bio?: string;
    avatar?: string | null;
    matchScore: number;
    matchReasons: string[];
  };
}

export default React.memo(function UserCard({ user }: UserCardProps) {
  const { sendRequest } = useConnectionStore();
  const [localLoading, setLocalLoading] = useState(false);
  const [hasSentRequest, setHasSentRequest] = useState(false);
  const router = useRouter();

  const handleConnect = async () => {
    if (hasSentRequest) return;
    setLocalLoading(true);
    const res = await sendRequest(user.userId);
    setLocalLoading(false);
    if (res.success) {
      setHasSentRequest(true);
    }
  };

  return (
    <View className="bg-white/5 rounded-2xl border border-white/10 p-5 mb-4 overflow-hidden">
      {/* Match Score Badge */}
      <View className="absolute top-4 right-4 bg-[#3B82F6]/20 px-3 py-1 rounded-full border border-[#3B82F6]/30">
        <Text className="text-[#3B82F6] font-bold text-xs">{user.matchScore}% Match</Text>
      </View>

      <TouchableOpacity 
        onPress={() => router.push({ pathname: '/profile/[id]', params: { id: user.userId } })}
        className="flex-row items-center mb-4"
      >
        {/* Avatar */}
        <View className="h-16 w-16 bg-slate-800 rounded-full items-center justify-center border border-white/10 overflow-hidden">
          {user.avatar ? (
            <Image source={{ uri: user.avatar }} className="w-full h-full" />
          ) : (
            <Text className="text-white text-xl font-bold">
              {user.name?.charAt(0) || '?'}
            </Text>
          )}
        </View>
        <View className="ml-4 flex-1">
          <Text className="text-white text-xl font-bold">{user.name}</Text>
          {user.username && (
            <Text className="text-[#3B82F6] text-xs font-bold -mt-0.5">@{user.username}</Text>
          )}
          <Text className="text-slate-400 text-sm mt-1">{user.field}</Text>
        </View>
      </TouchableOpacity>

      <Text className="text-slate-300 text-sm mb-4 leading-5" numberOfLines={2}>
        {user.bio || "Student at StudentSociety"}
      </Text>

      {/* Match Reasons Tags */}
      <View className="flex-row flex-wrap gap-2 mb-6">
        {user.matchReasons.map((reason, idx) => (
          <View key={idx} className="bg-white/5 px-2 py-1 rounded-md border border-white/10">
            <Text className="text-slate-400 text-xs font-medium">#{reason}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity 
        onPress={handleConnect}
        disabled={hasSentRequest || localLoading}
        className={`rounded-xl py-3 items-center border ${
          hasSentRequest 
            ? 'bg-emerald-500/10 border-emerald-500/30' 
            : 'bg-[#3B82F6] border-[#3B82F6]'
        }`}
      >
        {localLoading ? (
          <ActivityIndicator color="white" size="small" />
        ) : (
          <Text className={`font-bold ${hasSentRequest ? 'text-emerald-400' : 'text-white'}`}>
            {hasSentRequest ? 'Request Sent' : 'Connect'}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
});
