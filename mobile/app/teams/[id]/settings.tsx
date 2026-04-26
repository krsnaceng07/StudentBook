import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, Image, Modal } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTeamStore } from '../../../store/teamStore';
import { useAuthStore } from '../../../store/authStore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';

export default function TeamSettingsScreen() {
  const { id: teamId } = useLocalSearchParams();
  const router = useRouter();
  const { activeTeam, updateTeam, deleteTeam, leaveTeam, manageMember, updateTeamLinks, isLoading } = useTeamStore();
  const { user } = useAuthStore();

  const [name, setName] = useState(activeTeam?.name || '');
  const [description, setDescription] = useState(activeTeam?.description || '');
  const [status, setStatus] = useState(activeTeam?.status || 'Active');
  const [isPublic, setIsPublic] = useState(activeTeam?.isPublic ?? true);
  const [links, setLinks] = useState(activeTeam?.links || []);
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');

  const normalizeId = (id: any) => {
    if (!id) return null;
    if (typeof id === 'string') return id;
    return (id._id || id.id || id).toString();
  };

  const currentUserId = normalizeId(user);
  const isLeader = normalizeId(activeTeam?.leader) === currentUserId;
  const isAdmin = isLeader || activeTeam?.members?.some((m: any) => normalizeId(m.user) === currentUserId && m.role === 'admin');

  useEffect(() => {
    if (!activeTeam) {
        router.back();
    }
  }, [activeTeam]);

  if (!activeTeam) return null;

  const handleUpdateBasic = async () => {
    const res = await updateTeam(teamId as string, { name, description, status, isPublic });
    if (res.success) {
      Alert.alert('Success', 'Team settings updated!');
    }
  };

  const handleAddLink = async () => {
    if (!newLinkTitle || !newLinkUrl) return;
    const updatedLinks = [...links, { title: newLinkTitle, url: newLinkUrl, icon: 'link' }];
    const res = await updateTeamLinks(teamId as string, updatedLinks);
    if (res.success) {
      setLinks(updatedLinks);
      setNewLinkTitle('');
      setNewLinkUrl('');
    }
  };

  const handleRemoveLink = async (index: number) => {
    const updatedLinks = links.filter((_: any, i: number) => i !== index);
    const res = await updateTeamLinks(teamId as string, updatedLinks);
    if (res.success) {
      setLinks(updatedLinks);
    }
  };

  const onManageMember = (targetUserId: string, action: 'remove' | 'update_role', role?: string) => {
    Alert.alert(
      'Confirm Action',
      `Are you sure you want to ${action === 'remove' ? 'remove' : 'update the role of'} this member?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Confirm', 
          style: action === 'remove' ? 'destructive' : 'default',
          onPress: async () => {
            const res = await manageMember(teamId as string, targetUserId, action, role);
            if (res.success) {
                Alert.alert('Updated', 'Member list updated successfully');
            } else {
                Alert.alert('Error', res.error || 'Failed to update member');
            }
          }
        }
      ]
    );
  };

  const onLeaveTeam = () => {
    Alert.alert('Leave Team', 'Are you sure you want to leave this team?', [
      { text: 'Stay', style: 'cancel' },
      { 
        text: 'Leave', 
        style: 'destructive',
        onPress: async () => {
          const res = await leaveTeam(teamId as string);
          if (res.success) router.replace('/(tabs)/teams');
        }
      }
    ]);
  };

  const onDeleteTeam = () => {
    Alert.alert('Delete Team', 'CRITICAL: This action cannot be undone. All data, chats, and requests will be destroyed.', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Delete Forever', 
        style: 'destructive',
        onPress: async () => {
          const res = await deleteTeam(teamId as string);
          if (res.success) router.replace('/(tabs)/teams');
        }
      }
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0F172A]">
      {/* Header */}
      <View className="px-6 flex-row items-center justify-between py-4">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="h-10 w-10 bg-white/5 rounded-xl items-center justify-center border border-white/10"
        >
          <Ionicons name="close" size={20} color="white" />
        </TouchableOpacity>
        <Text className="text-white font-black text-lg">Team Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {/* Identity Section */}
        <View className="mb-8">
          <Text className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-4">Team Identity</Text>
          <View className="bg-slate-900/80 border border-white/5 rounded-3xl p-5">
             <View className="mb-4">
                <Text className="text-slate-400 text-xs font-bold mb-2">Team Name</Text>
                <TextInput 
                  value={name}
                  onChangeText={setName}
                  placeholder="The Squad Name"
                  placeholderTextColor="#475569"
                  className="bg-white/5 border border-white/10 p-4 rounded-xl text-white font-bold"
                />
             </View>
             <View className="mb-4">
                <Text className="text-slate-400 text-xs font-bold mb-2">Mission Description</Text>
                <TextInput 
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={3}
                  placeholder="What is the goal?"
                  placeholderTextColor="#475569"
                  className="bg-white/5 border border-white/10 p-4 rounded-xl text-white font-medium min-h-[100px]"
                  style={{ textAlignVertical: 'top' }}
                />
             </View>
             <View className="mb-6">
                <Text className="text-slate-400 text-xs font-bold mb-3">Privacy & Visibility</Text>
                <View className="flex-row items-center justify-between bg-white/5 border border-white/10 p-4 rounded-xl">
                  <View className="flex-1 mr-4">
                    <Text className="text-white font-bold text-sm">{isPublic ? 'Public Team' : 'Private Team'}</Text>
                    <Text className="text-slate-500 text-[10px] mt-1">
                      {isPublic ? 'Visible to all students in discover and search results.' : 'Hidden from everyone except team members and invitees.'}
                    </Text>
                  </View>
                  <TouchableOpacity 
                    onPress={() => setIsPublic(!isPublic)}
                    className={`h-7 w-12 rounded-full p-1 ${isPublic ? 'bg-emerald-500' : 'bg-slate-700'}`}
                  >
                    <View className={`h-5 w-5 bg-white rounded-full ${isPublic ? 'self-end' : 'self-start'}`} />
                  </TouchableOpacity>
                </View>
             </View>
             <TouchableOpacity 
               onPress={handleUpdateBasic}
               disabled={isLoading}
               className="bg-[#3B82F6] p-4 rounded-xl items-center"
             >
                <Text className="text-white font-black">{isLoading ? 'Saving...' : 'Update Identity'}</Text>
             </TouchableOpacity>
          </View>
        </View>

        {/* Member Management */}
        <View className="mb-8">
          <Text className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-4">Members & Roles ({activeTeam.members?.length})</Text>
          <View className="bg-slate-900/80 border border-white/5 rounded-3xl overflow-hidden">
            {activeTeam.members?.map((member: any, idx: number) => {
              const mId = normalizeId(member.user);
              const isSelf = mId === currentUserId;
              
              return (
                <View key={mId || idx} className={`p-4 flex-row items-center justify-between ${idx !== activeTeam.members.length -1 ? 'border-b border-white/5' : ''}`}>
                  <View className="flex-row items-center flex-1">
                    <View className="h-10 w-10 bg-white/10 rounded-xl items-center justify-center overflow-hidden">
                      {member.user?.avatar ? (
                        <Image source={{ uri: member.user.avatar }} className="w-full h-full" />
                      ) : (
                        <Text className="text-white font-bold">{member.user?.name?.charAt(0)}</Text>
                      )}
                    </View>
                    <View className="ml-3 flex-1">
                      <Text className="text-white font-bold text-sm" numberOfLines={1}>{member.user?.name} {isSelf && '(You)'}</Text>
                      <Text className="text-slate-500 text-[10px] uppercase font-black">{member.role}</Text>
                    </View>
                  </View>
                  
                  {/* Member Actions */}
                  {!isSelf && (isLeader || (isAdmin && member.role === 'member')) && (
                    <View className="flex-row gap-2">
                       {isLeader && (
                         <TouchableOpacity 
                           onPress={() => onManageMember(mId, 'update_role', member.role === 'admin' ? 'member' : 'admin')}
                           className="h-8 w-8 bg-white/5 rounded-lg items-center justify-center border border-white/10"
                         >
                           <Ionicons name={member.role === 'admin' ? 'arrow-down' : 'arrow-up'} size={14} color="#3B82F6" />
                         </TouchableOpacity>
                       )}
                       <TouchableOpacity 
                         onPress={() => onManageMember(mId, 'remove')}
                         className="h-8 w-8 bg-red-500/10 rounded-lg items-center justify-center border border-red-500/20"
                       >
                         <Ionicons name="trash-outline" size={14} color="#EF4444" />
                       </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </View>

        {/* Workspace Links */}
        <View className="mb-8">
          <Text className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-4">Workspace Resources</Text>
          <View className="bg-slate-900/80 border border-white/5 rounded-3xl p-5">
            {links.map((link: any, idx: number) => (
              <View key={idx} className="flex-row items-center justify-between bg-white/5 p-3 rounded-xl mb-2 border border-white/5">
                <View className="flex-row items-center flex-1">
                  <Ionicons name="link" size={16} color="#3B82F6" />
                  <View className="ml-3 flex-1">
                    <Text className="text-white font-bold text-xs" numberOfLines={1}>{link.title}</Text>
                    <Text className="text-slate-500 text-[10px]" numberOfLines={1}>{link.url}</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={() => handleRemoveLink(idx)}>
                  <Ionicons name="close-circle" size={18} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ))}

            <View className="mt-4 pt-4 border-t border-white/5">
              <TextInput 
                value={newLinkTitle}
                onChangeText={setNewLinkTitle}
                placeholder="Title (e.g. GitHub Repository)"
                placeholderTextColor="#475569"
                className="bg-white/5 border border-white/10 p-3 rounded-xl text-white text-xs mb-2"
              />
              <TextInput 
                value={newLinkUrl}
                onChangeText={setNewLinkUrl}
                placeholder="URL (https://...)"
                placeholderTextColor="#475569"
                className="bg-white/5 border border-white/10 p-3 rounded-xl text-white text-xs mb-3"
              />
              <TouchableOpacity 
                onPress={handleAddLink}
                className="bg-white/10 p-3 rounded-xl items-center flex-row justify-center border border-white/10"
              >
                <Ionicons name="add" size={16} color="white" />
                <Text className="text-white font-bold ml-1 text-xs">Add Resource</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Danger Zone */}
        <View className="mb-20">
          <Text className="text-red-500/50 font-bold uppercase tracking-widest text-[10px] mb-4">Danger Zone</Text>
          <View className="bg-red-500/5 border border-red-500/10 rounded-3xl p-5">
             {!isLeader && (
               <TouchableOpacity 
                 onPress={onLeaveTeam}
                 className="flex-row items-center justify-between p-4 bg-red-500/10 rounded-xl mb-3"
               >
                 <Text className="text-red-500 font-bold">Leave Team</Text>
                 <Ionicons name="log-out-outline" size={20} color="#EF4444" />
               </TouchableOpacity>
             )}
             
             {isLeader && (
               <TouchableOpacity 
                 onPress={onDeleteTeam}
                 className="flex-row items-center justify-between p-4 bg-red-500/20 rounded-xl"
               >
                 <View>
                   <Text className="text-red-500 font-black">Delete Team Forever</Text>
                   <Text className="text-red-400/60 text-[10px] mt-1">This action is irreversible.</Text>
                 </View>
                 <Ionicons name="nuclear-outline" size={24} color="#EF4444" />
               </TouchableOpacity>
             )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
