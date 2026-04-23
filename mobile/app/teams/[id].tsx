import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, FlatList, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTeamStore } from '../../store/teamStore';
import { useAuthStore } from '../../store/authStore';
import { useProfileStore } from '../../store/profileStore';

export default function TeamDetailScreen() {
  const { id: teamId } = useLocalSearchParams();
  const router = useRouter();
  const { activeTeam, fetchTeamDetails, requestToJoin, pendingRequests, fetchTeamRequests, handleJoinRequest, isLoading, clearActiveTeam } = useTeamStore();
  const { user } = useAuthStore();
  const { profile } = useProfileStore();
  
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    fetchTeamDetails(teamId);
    return () => clearActiveTeam();
  }, [teamId]);

  const normalizeId = (id: any) => {
    if (!id) return null;
    if (typeof id === 'string') return id;
    return (id._id || id.id || id).toString();
  };

  useEffect(() => {
    const checkAndFetch = async () => {
      if (!activeTeam) return;

      const leaderId = normalizeId(activeTeam.leader);
      const authId = normalizeId(user);
      const profileId = normalizeId(profile?.userId);
      const currentId = authId || profileId;

      if (leaderId && currentId && leaderId === currentId) {
        fetchTeamRequests(teamId);
      }
    };
    checkAndFetch();
  }, [activeTeam, user, profile]);

  const handleJoin = async () => {
    setRequesting(true);
    const result = await requestToJoin(teamId as string);
    if (result.success) {
      Alert.alert('Success', 'Join request sent to the team leader!');
    } else {
      Alert.alert('Info', result.error || 'Failed to send request');
    }
    setRequesting(false);
  };

  const onHandleRequest = async (requestId: string, status: 'accepted' | 'rejected') => {
    const result = await handleJoinRequest(requestId, status);
    if (result && status === 'accepted') {
      fetchTeamDetails(teamId); // Refresh member list
    }
  };

  if (!activeTeam && isLoading) {
    return (
      <View className="flex-1 bg-[#0F172A] items-center justify-center">
        <ActivityIndicator color="#3B82F6" size="large" />
      </View>
    );
  }

  if (!activeTeam) return null;

  const leaderId = normalizeId(activeTeam.leader);
  const authId = normalizeId(user);
  const profileId = normalizeId(profile?.userId);
  const currentUserId = authId || profileId;
  
  const isLeader = !!(leaderId && currentUserId && leaderId === currentUserId);
  const isMember = isLeader || activeTeam.members?.some((m: any) => {
    const mId = normalizeId(m.user);
    return mId && mId === currentUserId;
  });

  return (
    <ScrollView className="flex-1 bg-[#0F172A] pt-14">
      {/* Header */}
      <View className="px-6 flex-row items-center justify-between mb-8">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="h-10 w-10 bg-white/5 rounded-full items-center justify-center border border-white/10"
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-white font-bold text-lg">Team Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <View className="px-6">
        {/* Team Identity */}
        <View className="bg-white/5 rounded-[40px] p-8 border border-white/10 items-center">
          <View className="h-24 w-24 bg-[#3B82F6]/10 rounded-[30px] items-center justify-center border-2 border-[#3B82F6]/20 mb-4">
            <Text className="text-[#3B82F6] text-4xl font-bold">{activeTeam.name.charAt(0)}</Text>
          </View>
          <Text className="text-white text-3xl font-bold text-center">{activeTeam.name}</Text>
          <View className="flex-row items-center mt-2">
            <Ionicons name="person" size={14} color="#64748b" />
            <Text className="text-slate-500 ml-1">Led by {activeTeam.leader?.name || 'Student Society User'}</Text>
          </View>
          
          <View className="flex-row flex-wrap justify-center gap-2 mt-4">
             {activeTeam.tags?.map((tag: string, idx: number) => {
               return (
                <View key={`tag-${tag}-${idx}`} className="bg-white/5 px-4 py-1.5 rounded-full border border-white/10">
                  <Text className="text-slate-400 text-[11px] font-bold">#{tag}</Text>
                </View>
              );})}
          </View>
        </View>

        {/* Action Button */}
        <View className="my-8">
          {isMember ? (
            <TouchableOpacity 
              onPress={() => router.push(`/chat/${activeTeam.conversationId}`)}
              className="bg-[#3B82F6] flex-row items-center justify-center p-5 rounded-[25px] shadow-xl shadow-[#3B82F6]/20"
            >
              <Ionicons name="chatbubbles" size={20} color="white" />
              <Text className="text-white font-bold text-lg ml-3">Open Team Chat</Text>
            </TouchableOpacity>
          ) : activeTeam.hasPendingRequest ? (
            <View className="bg-white/5 border border-white/10 p-5 rounded-[25px] items-center flex-row justify-center">
              <Ionicons name="time-outline" size={20} color="#94A3B8" />
              <Text className="text-slate-400 font-bold text-lg ml-2">Request Pending</Text>
            </View>
          ) : activeTeam.isPublic ? (
            <TouchableOpacity 
              onPress={handleJoin}
              disabled={requesting}
              className="bg-white/10 border border-white/10 p-5 rounded-[25px] items-center"
            >
              <Text className="text-white font-bold text-lg">
                {requesting ? 'Processing...' : 'Apply to Join ✨'}
              </Text>
            </TouchableOpacity>
          ) : (
            <View className="bg-amber-500/10 border border-amber-500/20 p-5 rounded-[25px] items-center flex-row justify-center">
              <Ionicons name="lock-closed" size={18} color="#F59E0B" />
              <Text className="text-amber-500 font-bold ml-2 uppercase tracking-widest">Invite Only 🔒</Text>
            </View>
          )}
        </View>

        {/* Description */}
        <View className="mb-10">
          <Text className="text-white font-bold text-lg mb-3">About Team</Text>
          <Text className="text-slate-400 leading-6">{activeTeam.description}</Text>
        </View>

        {/* Member List Section */}
        <View className="mb-10">
           <Text className="text-white font-bold text-lg mb-4">Team Members ({activeTeam.members?.length})</Text>
           <View className="bg-white/5 rounded-3xl border border-white/10 overflow-hidden">
             {activeTeam.members?.map((member: any, idx: number) => {
               const userId = normalizeId(member.user);
               if (!userId && !member._id) return null;
               
               return (
                <View key={userId || member._id || `member-${idx}`} className={`p-4 flex-row items-center justify-between ${idx !== activeTeam.members.length -1 ? 'border-b border-white/5' : ''}`}>
                <View className="flex-row items-center">
                   <View className="h-10 w-10 bg-white/10 rounded-xl items-center justify-center overflow-hidden">
                     {member.user?.avatar ? (
                       <Image 
                         source={{ uri: member.user.avatar }} 
                         className="w-full h-full" 
                       />
                     ) : (
                       <Text className="text-white font-bold">{member.user?.name?.charAt(0) || '?'}</Text>
                     )}
                   </View>
                   <View className="ml-3">
                     <Text className="text-white font-bold">{member.user?.name || 'Unknown User'}</Text>
                     <Text className="text-slate-500 text-xs capitalize">{member.role}</Text>
                   </View>
                </View>
                 {member.role === 'leader' && <Ionicons name="ribbon" size={18} color="#3B82F6" />}
               </View>
               );
             })}
           </View>
        </View>

        {/* Leader: Pending Requests Section */}
        {isLeader && pendingRequests.length > 0 && (
          <View className="mb-20">
            <Text className="text-[#3B82F6] font-bold text-lg mb-4">Pending Join Requests ({pendingRequests.length})</Text>
            {pendingRequests.map((req: any, idx: number) => (
              <View key={req._id || `req-${idx}`} className="bg-white/5 border border-white/10 p-4 rounded-3xl mb-3">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <View className="h-10 w-10 bg-[#3B82F6]/20 rounded-xl items-center justify-center overflow-hidden">
                      {req.requester?.avatar ? (
                        <Image 
                          source={{ uri: req.requester.avatar }} 
                          className="w-full h-full" 
                        />
                      ) : (
                        <Text className="text-[#3B82F6] font-bold">{req.requester?.name?.charAt(0) || '?'}</Text>
                      )}
                    </View>
                    <View className="ml-3">
                      <Text className="text-white font-bold">{req.requester?.name || 'Unknown'}</Text>
                      <Text className="text-slate-500 text-xs">Wants to join</Text>
                    </View>
                  </View>
                  
                  <View className="flex-row gap-2">
                    <TouchableOpacity 
                      onPress={() => onHandleRequest(req._id, 'rejected')}
                      className="h-10 w-10 bg-red-500/10 rounded-full items-center justify-center border border-red-500/20"
                    >
                      <Ionicons name="close" size={20} color="#EF4444" />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      onPress={() => onHandleRequest(req._id, 'accepted')}
                      className="h-10 w-10 bg-[#10B981]/10 rounded-full items-center justify-center border border-[#10B981]/20"
                    >
                      <Ionicons name="checkmark" size={20} color="#10B981" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
      <View className="h-20" />
    </ScrollView>
  );
}
