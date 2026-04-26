import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, FlatList, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTeamStore } from '../../store/teamStore';
import { useAuthStore } from '../../store/authStore';
import { useProfileStore } from '../../store/profileStore';
import EditTeamModal from '../../components/EditTeamModal';

export default function TeamDetailScreen() {
  const { id: teamId } = useLocalSearchParams();
  const router = useRouter();
  const { activeTeam, fetchTeamDetails, requestToJoin, pendingRequests, fetchTeamRequests, handleJoinRequest, isLoading, clearActiveTeam } = useTeamStore();
  const { user } = useAuthStore();
  const { profile } = useProfileStore();
  
  const [requesting, setRequesting] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

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
  const currentUserId = normalizeId(user) || normalizeId(profile?.userId);
  
  const isLeader = !!(leaderId && currentUserId && leaderId === currentUserId);
  const isMember = isLeader || activeTeam.members?.some((m: any) => {
    const mId = normalizeId(m.user);
    return mId && mId === currentUserId;
  });

  return (
    <ScrollView className="flex-1 bg-[#0F172A] pt-14" showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View className="px-6 flex-row items-center justify-between mb-8">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="h-12 w-12 bg-white/5 rounded-2xl items-center justify-center border border-white/10"
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-white font-black text-xl">Team Hub</Text>
        {isLeader ? (
          <TouchableOpacity 
            onPress={() => setIsEditModalVisible(true)}
            className="h-12 w-12 bg-[#3B82F6]/10 rounded-2xl items-center justify-center border border-[#3B82F6]/20"
          >
            <Ionicons name="settings-outline" size={24} color="#3B82F6" />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 48 }} />
        )}
      </View>

      <View className="px-6">
        {/* Team Identity Card */}
        <View className="bg-slate-900/80 rounded-[40px] p-8 border border-white/10 items-center relative overflow-hidden">
          <View className="absolute -top-20 -right-20 h-40 w-40 bg-[#3B82F6]/10 rounded-full blur-3xl" />
          
          <View className="h-28 w-28 bg-[#3B82F6]/10 rounded-[35px] items-center justify-center border-2 border-[#3B82F6]/20 mb-6 overflow-hidden">
            {activeTeam.avatar ? (
              <Image source={{ uri: activeTeam.avatar }} className="h-full w-full" />
            ) : (
              <Text className="text-[#3B82F6] text-5xl font-black">{activeTeam.name.charAt(0)}</Text>
            )}
          </View>
          
          <Text className="text-white text-3xl font-black text-center mb-2">{activeTeam.name}</Text>
          
          <View className="flex-row items-center mb-4">
            <View className="flex-row items-center bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
              <Ionicons name="rocket-outline" size={14} color="#3B82F6" />
              <Text className="text-slate-400 ml-2 text-[10px] font-black uppercase tracking-wider">{activeTeam.category || 'Project'}</Text>
            </View>
            <View className="flex-row items-center bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20 ml-2">
              <View className="h-2 w-2 rounded-full bg-emerald-500 mr-2" />
              <Text className="text-emerald-400 text-[10px] font-black uppercase tracking-wider">{activeTeam.status || 'Active'}</Text>
            </View>
          </View>

          <View className="flex-row items-center">
            <Ionicons name="person" size={12} color="#64748b" />
            <Text className="text-slate-500 ml-1 text-xs font-bold">Led by {activeTeam.leader?.name || 'Student'}</Text>
          </View>
          
          <View className="flex-row flex-wrap justify-center gap-2 mt-6">
             {activeTeam.tags?.map((tag: string, idx: number) => (
                <View key={`tag-${tag}-${idx}`} className="bg-white/5 px-4 py-1.5 rounded-full border border-white/10">
                  <Text className="text-slate-400 text-[10px] font-bold">#{tag}</Text>
                </View>
              ))}
          </View>
        </View>

        {/* Smart Match Hint */}
        {activeTeam.matchScore && activeTeam.matchScore >= 50 && (
          <View className="mt-6 bg-[#3B82F6]/5 border border-[#3B82F6]/10 p-6 rounded-[35px] flex-row items-center">
            <View className="h-12 w-12 bg-[#3B82F6]/20 rounded-full items-center justify-center">
               <Ionicons name="sparkles" size={24} color="#3B82F6" />
            </View>
            <View className="ml-4 flex-1">
              <Text className="text-white font-black text-lg">Ideal Match! 🔥</Text>
              <Text className="text-slate-400 text-xs mt-1 leading-4">Your profile highlights align perfectly with this team's current mission and tech stack.</Text>
            </View>
          </View>
        )}

        {/* Recruitment Needs */}
        {activeTeam.status === 'Recruiting' && activeTeam.lookingFor?.length > 0 && (
           <View className="mt-8">
             <Text className="text-white font-black text-xl mb-4">Looking For</Text>
             <View className="flex-row flex-wrap gap-3">
               {activeTeam.lookingFor.map((skill, idx) => (
                 <View key={idx} className="bg-emerald-500/10 px-4 py-2 rounded-2xl border border-emerald-500/20 flex-row items-center">
                    <Ionicons name="add-circle" size={14} color="#10B981" />
                    <Text className="text-emerald-400 font-bold ml-2">{skill}</Text>
                 </View>
               ))}
             </View>
           </View>
        )}

        {/* Action Button */}
        <View className="my-10">
          {isMember ? (
            <TouchableOpacity 
              onPress={() => router.push(`/chat/${activeTeam.conversationId}`)}
              className="bg-[#3B82F6] flex-row items-center justify-center p-5 rounded-[30px] shadow-2xl shadow-[#3B82F6]/30"
            >
              <Ionicons name="chatbubbles" size={24} color="white" />
              <Text className="text-white font-black text-xl ml-3">Join Discussion</Text>
            </TouchableOpacity>
          ) : activeTeam.hasPendingRequest ? (
            <View className="bg-white/5 border border-white/10 p-5 rounded-[30px] items-center flex-row justify-center">
              <Ionicons name="time-outline" size={24} color="#94A3B8" />
              <Text className="text-slate-400 font-black text-xl ml-3">Waiting for Admin...</Text>
            </View>
          ) : (
            <TouchableOpacity 
              onPress={handleJoin}
              disabled={requesting}
              className="bg-[#3B82F6]/20 border border-[#3B82F6]/30 p-5 rounded-[30px] items-center flex-row justify-center"
            >
              <Ionicons name="shield-checkmark-outline" size={24} color="#3B82F6" />
              <Text className="text-[#3B82F6] font-black text-xl ml-3">
                {requesting ? 'Sending...' : 'Request to Join'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Description */}
        <View className="mb-10">
          <Text className="text-white font-black text-xl mb-4">The Mission</Text>
          <Text className="text-slate-400 leading-7 text-base font-medium">{activeTeam.description}</Text>
        </View>

        {/* Member List */}
        <View className="mb-10">
           <Text className="text-white font-black text-xl mb-4">The Squad ({activeTeam.members?.length})</Text>
           <View className="bg-white/5 rounded-[35px] border border-white/10 overflow-hidden">
             {activeTeam.members?.map((member: any, idx: number) => {
               const userId = normalizeId(member.user);
               return (
                <View key={userId || idx} className={`p-5 flex-row items-center justify-between ${idx !== activeTeam.members.length -1 ? 'border-b border-white/5' : ''}`}>
                  <View className="flex-row items-center">
                    <View className="h-12 w-12 bg-white/10 rounded-2xl items-center justify-center overflow-hidden">
                      {member.user?.avatar ? (
                        <Image source={{ uri: member.user.avatar }} className="w-full h-full" />
                      ) : (
                        <Text className="text-white font-black text-lg">{member.user?.name?.charAt(0)}</Text>
                      )}
                    </View>
                    <View className="ml-4">
                      <Text className="text-white font-bold text-base">{member.user?.name}</Text>
                      <Text className="text-slate-500 text-xs font-bold uppercase tracking-tighter">{member.role}</Text>
                    </View>
                  </View>
                  {member.role === 'leader' && (
                    <View className="bg-[#3B82F6]/20 p-2 rounded-xl">
                      <Ionicons name="ribbon" size={16} color="#3B82F6" />
                    </View>
                  )}
                </View>
               );
             })}
           </View>
        </View>

        {/* Pending Requests for Leader */}
        {isLeader && pendingRequests.length > 0 && (
          <View className="mb-20">
            <Text className="text-[#3B82F6] font-black text-xl mb-6">New Applicants ({pendingRequests.length})</Text>
            {pendingRequests.map((req: any) => (
              <View key={req._id} className="bg-white/5 border border-white/10 p-6 rounded-[35px] mb-4">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1">
                    <View className="h-12 w-12 bg-[#3B82F6]/20 rounded-2xl items-center justify-center overflow-hidden">
                      {req.requester?.avatar ? (
                        <Image source={{ uri: req.requester.avatar }} className="w-full h-full" />
                      ) : (
                        <Text className="text-[#3B82F6] font-black text-lg">{req.requester?.name?.charAt(0)}</Text>
                      )}
                    </View>
                    <View className="ml-4">
                      <Text className="text-white font-bold text-lg">{req.requester?.name}</Text>
                      <Text className="text-slate-500 text-xs font-medium">Ready to join the mission</Text>
                    </View>
                  </View>
                  
                  <View className="flex-row gap-3">
                    <TouchableOpacity 
                      onPress={() => onHandleRequest(req._id, 'rejected')}
                      className="h-12 w-12 bg-red-500/10 rounded-2xl items-center justify-center border border-red-500/20"
                    >
                      <Ionicons name="close" size={24} color="#EF4444" />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      onPress={() => onHandleRequest(req._id, 'accepted')}
                      className="h-12 w-12 bg-[#10B981]/10 rounded-2xl items-center justify-center border border-[#10B981]/20"
                    >
                      <Ionicons name="checkmark" size={24} color="#10B981" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
      <View className="h-20" />
      
      <EditTeamModal 
        isVisible={isEditModalVisible}
        onClose={() => setIsEditModalVisible(false)}
        team={activeTeam}
      />
    </ScrollView>
  );
}
