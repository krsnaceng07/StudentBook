import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useProfileStore } from '../../store/profileStore';
import { useConnectionStore } from '../../store/connectionStore';
import { useAuthStore } from '../../store/authStore';
import client from '../../api/client';

export default function ProfileViewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { fetchProfileByUserId } = useProfileStore();
  const { isLoading: connLoading } = useConnectionStore();
  const { user: currentUser } = useAuthStore();
  
  const [profile, setProfile] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [connection, setConnection] = useState<any>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const router = useRouter();

  const loadData = async () => {
    if (!id) return;
    setIsInitialLoading(true);
    try {
      const [profRes, connRes] = await Promise.all([
        fetchProfileByUserId(id),
        client.get(`/connections/status/${id}`)
      ]);

      if (profRes.success) {
        setProfile(profRes.profile);
      } else {
        setError(profRes.error);
      }

      if (connRes.data.success) {
        setConnection(connRes.data.data);
      }
    } catch (err) {
      console.error('Error loading profile data:', err);
    } finally {
      setIsInitialLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  if (isInitialLoading) {
    return (
      <View className="flex-1 bg-[#0F172A] items-center justify-center">
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (error || !profile) {
    return (
      <View className="flex-1 bg-[#0F172A] items-center justify-center p-6">
        <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
        <Text className="text-white text-xl font-bold mt-4">Profile Not Found</Text>
        <Text className="text-slate-400 text-center mt-2">{error || "The profile you're looking for doesn't exist."}</Text>
        <TouchableOpacity 
          onPress={() => router.back()}
          className="mt-8 bg-white/5 px-8 py-3 rounded-xl border border-white/10"
        >
          <Text className="text-white font-bold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isOwnProfile = currentUser?.id === id || currentUser?._id === id;
  const status = connection?.status || 'none';
  const isRequester = connection?.requester === currentUser?._id || connection?.requester === currentUser?.id;

  const handleConnect = async () => {
    const res = await useConnectionStore.getState().sendRequest(id);
    if (res.success) loadData();
  };

  const handleCancel = async () => {
    const res = await useConnectionStore.getState().cancelRequest(connection._id);
    if (res.success) loadData();
  };

  const handleAccept = async () => {
    const res = await useConnectionStore.getState().acceptRequest(connection._id);
    if (res.success) loadData();
  };

  const handleReject = async () => {
    const res = await useConnectionStore.getState().rejectRequest(connection._id);
    if (res.success) loadData();
  };

  const handleDisconnect = async () => {
    const res = await useConnectionStore.getState().disconnectUser(connection._id);
    if (res.success) loadData();
  };

  const handleMessage = async () => {
    const { createConversation } = require('../../store/chatStore').useChatStore.getState();
    const result = await createConversation(id);
    if (result.success) {
      router.push(`/chat/${result.conversation._id}`);
    }
  };

  return (
    <ScrollView className="flex-1 bg-[#0F172A]">
      <View className="h-40 bg-gradient-to-br from-[#3B82F6] via-[#8B5CF6] to-[#DB2777] opacity-30" />
      
      <View className="px-6 -mt-16">
        <View className="flex-row items-end justify-between mb-6">
           <View className="h-32 w-32 rounded-3xl bg-[#1E293B] border-4 border-[#0F172A] items-center justify-center overflow-hidden">
            {profile.avatar ? (
              <Image source={{ uri: profile.avatar }} className="w-full h-full" />
            ) : (
              <Text className="text-white text-4xl font-bold">{profile.userId?.name?.charAt(0) || '?'}</Text>
            )}
          </View>
          
          <View className="flex-row gap-2">
            {!isOwnProfile && (
              <View className="flex-row gap-2">
                {status === 'accepted' ? (
                  <>
                    <TouchableOpacity 
                      onPress={handleMessage}
                      className="bg-[#3B82F6] px-5 py-3 rounded-xl shadow-lg"
                    >
                      <Text className="text-white font-bold">Message</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      onPress={handleDisconnect}
                      className="bg-white/5 px-4 py-3 rounded-xl border border-white/10"
                    >
                      <Ionicons name="person-remove-outline" size={20} color="#EF4444" />
                    </TouchableOpacity>
                  </>
                ) : status === 'pending' ? (
                  isRequester ? (
                    <TouchableOpacity 
                      onPress={handleCancel}
                      className="bg-slate-800 px-5 py-3 rounded-xl border border-white/10 flex-row items-center"
                    >
                      <Text className="text-slate-400 font-bold mr-2">Pending</Text>
                      <Ionicons name="close-circle" size={16} color="#94A3B8" />
                    </TouchableOpacity>
                  ) : (
                    <View className="flex-row gap-2">
                      <TouchableOpacity 
                        onPress={handleAccept}
                        className="bg-emerald-500 px-4 py-3 rounded-xl shadow-lg"
                      >
                        <Ionicons name="checkmark" size={20} color="white" />
                      </TouchableOpacity>
                      <TouchableOpacity 
                        onPress={handleReject}
                        className="bg-red-500/10 px-4 py-3 rounded-xl border border-red-500/30"
                      >
                        <Ionicons name="close" size={20} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  )
                ) : (
                  <TouchableOpacity 
                    onPress={handleConnect}
                    disabled={connLoading}
                    className="bg-[#3B82F6] px-6 py-3 rounded-xl shadow-lg"
                  >
                    <Text className="text-white font-bold">Connect</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
            {isOwnProfile && (
               <TouchableOpacity 
                onPress={() => router.push('/profile/edit')}
                className="bg-white/5 px-6 py-3 rounded-xl border border-white/10"
              >
                <Text className="text-white font-bold">Edit</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity 
              onPress={() => router.back()}
              className="bg-white/5 p-3 rounded-xl border border-white/10"
            >
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        <View className="mb-8">
          <Text className="text-white text-3xl font-bold">{profile.userId?.name}</Text>
          {profile.userId?.username && (
            <Text className="text-[#3B82F6] font-medium text-lg mt-0.5">@{profile.userId.username}</Text>
          )}
          <View className="flex-row items-center mt-2">
            <Ionicons name="school-outline" size={18} color="#94A3B8" />
            <Text className="text-slate-400 ml-2 text-lg font-medium">{profile.field || 'Student'}</Text>
          </View>

          {profile.userId?.email && (
            <View className="flex-row items-center mt-2">
              <Ionicons name="mail-outline" size={18} color="#94A3B8" />
              <Text className="text-slate-400 ml-2 text-base font-medium">{profile.userId.email}</Text>
            </View>
          )}
          
          {profile.bio && (
            <View className="mt-6 bg-white/5 p-5 rounded-2xl border border-white/10">
               <Text className="text-white font-bold text-lg mb-2">About</Text>
               <Text className="text-slate-300 leading-6 text-base">{profile.bio}</Text>
            </View>
          )}
        </View>

        {/* Detailed Info Sections */}
        <View className="space-y-6 mb-20">
          {/* Skills */}
          <View className="bg-white/5 rounded-2xl border border-white/10 p-5">
            <View className="flex-row items-center mb-3">
              <Ionicons name="flash-outline" size={18} color="#3B82F6" />
              <Text className="text-white font-bold text-lg ml-2">Skills</Text>
            </View>
            <View className="flex-row flex-wrap gap-2">
              {profile.skills?.length ? profile.skills.map((item: string, idx: number) => (
                <View key={idx} className="bg-[#3B82F6]/10 px-3 py-1.5 rounded-full border border-[#3B82F6]/20">
                  <Text className="text-[#3B82F6] font-medium">{item}</Text>
                </View>
              )) : <Text className="text-slate-500 italic">No skills added.</Text>}
            </View>
          </View>

          {/* Interests */}
          <View className="bg-white/5 rounded-2xl border border-white/10 p-5">
            <View className="flex-row items-center mb-3">
              <Ionicons name="heart-outline" size={18} color="#8B5CF6" />
              <Text className="text-white font-bold text-lg ml-2">Interests</Text>
            </View>
            <View className="flex-row flex-wrap gap-2">
              {profile.interests?.length ? profile.interests.map((item: string, idx: number) => (
                <View key={idx} className="bg-[#8B5CF6]/10 px-3 py-1.5 rounded-full border border-[#8B5CF6]/20">
                  <Text className="text-[#8B5CF6] font-medium">{item}</Text>
                </View>
              )) : <Text className="text-slate-500 italic">No interests added.</Text>}
            </View>
          </View>

          {/* Goals */}
          <View className="bg-white/5 rounded-2xl border border-white/10 p-5">
            <View className="flex-row items-center mb-3">
              <Ionicons name="rocket-outline" size={18} color="#10B981" />
              <Text className="text-white font-bold text-lg ml-2">Goals</Text>
            </View>
            <View className="flex-row flex-wrap gap-2">
              {profile.goals?.length ? profile.goals.map((item: string, idx: number) => (
                <View key={idx} className="bg-[#10B981]/10 px-3 py-1.5 rounded-full border border-[#10B981]/20">
                  <Text className="text-[#10B981] font-medium">{item}</Text>
                </View>
              )) : <Text className="text-slate-500 italic">No goals added.</Text>}
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
