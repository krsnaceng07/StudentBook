import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useConnectionStore } from '../store/connectionStore';
import { Ionicons } from '@expo/vector-icons';

interface UserCardProps {
  user: {
    userId: string;
    name: string;
    username?: string;
    field: string;
    headline?: string;
    commonSkills: string[];
    commonGoals: string[];
    avatar?: string | null;
    matchScore: number;
    matchReasons: string[];
    isActive?: boolean;
    availability?: string;
    mutualCount?: number;
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

  const getMatchEmoji = (score: number) => {
    if (score >= 80) return '🔥';
    if (score >= 50) return '✨';
    return '🤝';
  };

  return (
    <View className="bg-slate-900/50 rounded-[32px] border border-white/10 p-6 mb-6 overflow-hidden relative">
      {/* Dynamic Background Glow based on match score */}
      <View 
        className={`absolute -top-10 -right-10 h-32 w-32 rounded-full blur-3xl ${
          user.matchScore >= 80 ? 'bg-orange-500/10' : 'bg-[#3B82F6]/5'
        }`} 
      />
      
      <View className="flex-row items-start justify-between mb-4">
         <TouchableOpacity 
          onPress={() => router.push({ pathname: '/profile/[id]', params: { id: user.userId } })}
          className="flex-row items-center flex-1"
        >
          {/* Avatar with Active Badge */}
          <View>
            <View className="h-16 w-16 bg-slate-800 rounded-2xl items-center justify-center border border-white/10 overflow-hidden shadow-2xl">
              {user.avatar ? (
                <Image source={{ uri: user.avatar }} className="w-full h-full" />
              ) : (
                <Text className="text-white text-2xl font-black">
                  {user.name?.charAt(0) || '?'}
                </Text>
              )}
            </View>
            {user.isActive && (
              <View className="absolute -bottom-1 -right-1 h-4 w-4 bg-emerald-500 rounded-full border-2 border-[#0F172A]" />
            )}
          </View>

          <View className="ml-4 flex-1">
            <View className="flex-row items-center">
              <Text className="text-white text-lg font-black" numberOfLines={1}>{user.name}</Text>
              {user.matchScore >= 90 && (
                <View className="ml-2 bg-orange-500/10 px-2 py-0.5 rounded-md">
                   <Text className="text-orange-500 text-[8px] font-black tracking-tighter">ELITE</Text>
                </View>
              )}
            </View>
            <Text className="text-[#3B82F6] text-xs font-black uppercase tracking-wider">
              {user.field || 'Campus User'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Match Score Badge */}
        <View className={`px-3 py-2 rounded-2xl border items-center ${
          user.matchScore >= 80 ? 'bg-orange-500/5 border-orange-500/20' : 'bg-white/5 border-white/10'
        }`}>
          <Text className={`font-black text-sm ${user.matchScore >= 80 ? 'text-orange-500' : 'text-white'}`}>
            {user.matchScore}% {getMatchEmoji(user.matchScore)}
          </Text>
          <Text className="text-slate-500 text-[8px] uppercase font-black mt-0.5 tracking-widest">Match</Text>
        </View>
      </View>

      <Text className="text-slate-400 text-sm mb-4 font-bold leading-5" numberOfLines={2}>
        {user.headline || "Ambitious student ready to collaborate."}
      </Text>

      {/* Mutual Connections & Why This Match */}
      <View className="flex-row gap-3 mb-6">
        {user.mutualCount && user.mutualCount > 0 ? (
          <View className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl flex-row items-center">
            <Ionicons name="people" size={14} color="#64748b" />
            <Text className="text-slate-400 text-[10px] font-bold ml-1.5">{user.mutualCount} Mutuals</Text>
          </View>
        ) : null}
        
        {user.commonSkills?.length > 0 && (
          <View className="bg-[#3B82F6]/10 border border-[#3B82F6]/20 px-3 py-1.5 rounded-xl flex-row items-center">
            <Ionicons name="sparkles" size={14} color="#3B82F6" />
            <Text className="text-[#3B82F6] text-[10px] font-bold ml-1.5">Shared Skills</Text>
          </View>
        )}
      </View>

      {((user.commonSkills?.length || 0) > 0 || (user.commonGoals?.length || 0) > 0) && (
        <View className="bg-white/5 rounded-2xl p-4 mb-6 border border-white/5">
          <Text className="text-slate-500 text-[10px] font-black uppercase mb-2">Common Ground</Text>
          <Text className="text-slate-300 text-xs leading-5">
            You both share interest in{' '}
            <Text className="text-white font-bold">
              {[...(user.commonSkills || []), ...(user.commonGoals || [])].slice(0, 3).join(', ')}
            </Text>
            {((user.commonSkills?.length || 0) + (user.commonGoals?.length || 0) > 3) && ' and more.'}
          </Text>
        </View>
      )}

      {/* Action Buttons */}
      <View className="flex-row gap-4">
        <TouchableOpacity 
          onPress={() => router.push({ pathname: '/profile/[id]', params: { id: user.userId } })}
          className="flex-1 bg-white/5 rounded-3xl py-4 items-center border border-white/10"
        >
          <Text className="text-white font-black">Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={handleConnect}
          disabled={hasSentRequest || localLoading}
          className={`flex-[1.5] rounded-3xl py-4 items-center shadow-2xl ${
            hasSentRequest 
              ? 'bg-emerald-500/10 border border-emerald-500/30 shadow-emerald-500/10' 
              : 'bg-[#3B82F6] border border-[#3B82F6] shadow-[#3B82F6]/20'
          }`}
        >
          {localLoading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <View className="flex-row items-center">
              <Ionicons 
                name={hasSentRequest ? "checkmark-circle" : "person-add"} 
                size={18} 
                color={hasSentRequest ? "#10B981" : "white"} 
              />
              <Text className={`font-black ml-2 ${hasSentRequest ? 'text-emerald-400' : 'text-white'}`}>
                {hasSentRequest ? 'Requested' : 'Connect'}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
});
