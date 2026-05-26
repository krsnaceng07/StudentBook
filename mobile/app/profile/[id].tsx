import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Linking, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useUIStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import api from '../../api/client';
import { supabase } from '../../config/supabase';

export default function PublicProfile() {
  const { id } = useLocalSearchParams();
  const { isDarkMode } = useUIStore();
  const { user } = useAuthStore();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({ connections: 0, events_joined: 0, requests_sent: 0 });
  const [activities, setActivities] = useState<any[]>([]);
  const [requestSent, setRequestSent] = useState(false);
  const [connectionInfo, setConnectionInfo] = useState<any>(null);

  const isOwnProfile = user?.id === id;

  const C = {
    bg: isDarkMode ? '#0F172A' : '#F8FAFC',
    card: isDarkMode ? '#1E293B' : '#FFFFFF',
    border: isDarkMode ? '#334155' : '#E2E8F0',
    text: isDarkMode ? '#F8FAFC' : '#0F172A',
    muted: isDarkMode ? '#94A3B8' : '#64748B',
    primary: profile?.appearance_accent || '#2563EB',
    success: '#10B981',
    warning: '#F59E0B'
  };

  const fetchProfile = async () => {
    setLoading(true);
    try {
      if (typeof id === 'string') {
        const response = await api.get(`/profile/${id}`);
        if (response.data?.success && response.data.data?.profile) {
          setProfile(response.data.data.profile);
          if (response.data.data.stats) {
            setStats(response.data.data.stats);
          }
          if (response.data.data.connection_info) {
            setConnectionInfo(response.data.data.connection_info);
          } else {
            setConnectionInfo(null);
          }
        }
      }
    } catch (err) {
      console.warn('Error fetching public profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
      setActivities([
        { icon: "🎓", text: "Joined CollabSpace", time: "Recently", color: "#7C3AED" }
      ]);
    }, [id])
  );

  useEffect(() => {
    if (!user?.id || !id) return;
    const channel = supabase
      .channel(`connections_profile_${id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'connections' },
        (payload: any) => {
          const row = payload.new || payload.old;
          if (!row) return;
          const involvesBoth = (row.sender_id === user.id && row.receiver_id === id) || (row.sender_id === id && row.receiver_id === user.id);
          if (involvesBoth) {
            if (payload.eventType === 'DELETE') {
               setConnectionInfo(null);
               setRequestSent(false);
            } else {
               if (row.status === 'accepted') {
                  fetchProfile();
               } else {
                  setConnectionInfo({
                    id: row.id,
                    status: row.status,
                    is_sender: row.sender_id === user.id
                  });
               }
            }
          }
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [id, user?.id]);

  const handleSendRequest = async () => {
    if (!profile || requestSent || isOwnProfile) return;
    try {
      const response = await api.post('/student/connections/request', { receiverId: id });
      if (response.data?.success) {
        setRequestSent(true);
        Alert.alert("Request Sent", "Your collaboration request has been successfully sent!", [{ text: "Awesome" }]);
        fetchProfile();
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.error || "Failed to send collaboration request.";
      Alert.alert("Error", errMsg);
    }
  };

  const handleCancelRequest = async () => {
    if (!connectionInfo?.id) return;
    try {
      const response = await api.delete(`/student/connections/request/${connectionInfo.id}`);
      if (response.data?.success) {
        setConnectionInfo(null);
        setRequestSent(false);
      }
    } catch (err: any) {
      console.warn('Error cancelling request:', err);
    }
  };

  if (loading) return <View style={{ flex: 1, backgroundColor: C.bg, justifyContent: 'center' }}><ActivityIndicator color={C.primary} /></View>;
  
  if (!profile) return (
    <View style={{ flex: 1, backgroundColor: C.bg, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ color: C.text, fontSize: 16, fontWeight: 'bold' }}>Profile not found.</Text>
      <TouchableOpacity onPress={() => router.back()} className="mt-4 px-4 py-2 rounded-lg" style={{ backgroundColor: C.primary }}>
        <Text className="text-white font-bold">Go Back</Text>
      </TouchableOpacity>
    </View>
  );

  const joined = new Date(profile?.created_at || Date.now());
  const monthsOn = Math.max(1, Math.round((Date.now() - joined.getTime()) / (1000 * 60 * 60 * 24 * 30)));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header Banner */}
        <View style={{ backgroundColor: `${C.primary}EA`, paddingTop: 20, paddingHorizontal: 20, paddingBottom: 0 }}>
          {/* Top Actions */}
          <View className="flex-row justify-between mb-4">
            <TouchableOpacity 
              onPress={() => router.back()}
              className="w-10 h-10 rounded-xl items-center justify-center"
              style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
            >
              <Ionicons name="arrow-back" size={20} color="white" />
            </TouchableOpacity>
            
            {/* Action Header Button if not own profile */}
            {!isOwnProfile && (
              connectionInfo?.status === 'accepted' ? (
                <TouchableOpacity 
                  onPress={() => {
                    if (connectionInfo.conversation_id) {
                       router.push({ pathname: '/chat/[conversationId]', params: { conversationId: connectionInfo.conversation_id, name: profile.full_name, initials: profile.initials } });
                    } else {
                       Alert.alert("Error", "Chat is being initialized, please try again.");
                       fetchProfile();
                    }
                  }}
                  className="h-10 px-4 rounded-xl flex-row items-center gap-2"
                  style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                >
                  <Ionicons name="chatbubble" size={14} color="white" />
                  <Text className="text-white font-bold text-xs">Message</Text>
                </TouchableOpacity>
              ) : connectionInfo?.status === 'pending' ? (
                connectionInfo.is_sender ? (
                  <TouchableOpacity 
                    onPress={handleCancelRequest}
                    className="h-10 px-4 rounded-xl flex-row items-center gap-2"
                    style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                  >
                    <Ionicons name="close" size={14} color="white" />
                    <Text className="text-white font-bold text-xs">Cancel Request</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity 
                    onPress={() => router.push('/(student)/connections')}
                    className="h-10 px-4 rounded-xl flex-row items-center gap-2"
                    style={{ backgroundColor: C.success }}
                  >
                    <Ionicons name="checkmark" size={14} color="white" />
                    <Text className="text-white font-bold text-xs">Respond</Text>
                  </TouchableOpacity>
                )
              ) : (
                <TouchableOpacity 
                  onPress={handleSendRequest}
                  disabled={requestSent}
                  className="h-10 px-4 rounded-xl flex-row items-center gap-2"
                  style={{ backgroundColor: requestSent ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.2)' }}
                >
                  <Ionicons name={requestSent ? "checkmark" : "person-add"} size={14} color="white" />
                  <Text className="text-white font-bold text-xs">{requestSent ? 'Sent' : 'Connect'}</Text>
                </TouchableOpacity>
              )
            )}
          </View>

          {/* Avatar + Info */}
          <View className="flex-row gap-4 items-end mb-4">
            <View className="relative">
              <View className="w-20 h-20 rounded-full items-center justify-center border-4 border-white shadow-lg" style={{ backgroundColor: 'rgba(255,255,255,0.25)' }}>
                <Text className="text-3xl font-black text-white">{profile?.initials || '??'}</Text>
              </View>
              <View className="absolute bottom-0.5 right-0.5 w-5 h-5 rounded-full border-2 border-white" style={{ backgroundColor: profile?.availability ? C.success : C.muted }} />
            </View>
            <View className="flex-1 pb-1">
              <Text className="text-2xl font-black text-white mb-0.5">{profile?.full_name || 'Anonymous'}</Text>
              <Text className="text-white/90 text-xs font-semibold mb-0.5">{profile?.department || 'Department'} · {profile?.university_year || 'Year'}</Text>
              <Text className="text-white/70 text-[11px] font-bold">{profile?.university || 'University'}</Text>
            </View>
          </View>

          {/* Stats Row */}
          <View className="flex-row border-t border-white/20">
            {[
              ["Connections", stats.connections],
              ["Requests", stats.requests_sent],
              ["Events", stats.events_joined]
            ].map(([label, val], i) => (
              <View key={label as string} className="flex-1 py-3 items-center" style={{ borderRightWidth: i < 2 ? 1 : 0, borderColor: 'rgba(255,255,255,0.2)' }}>
                <Text className="text-xl font-black text-white">{val}</Text>
                <Text className="text-[10px] text-white/70 font-bold uppercase mt-0.5">{label as string}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Tab Bar */}
        <View className="flex-row bg-white border-b" style={{ borderColor: C.border, backgroundColor: C.bg }}>
          {["overview", "skills", "activity"].map(t => (
            <TouchableOpacity 
              key={t}
              onPress={() => setActiveTab(t)}
              className="flex-1 py-4 items-center"
              style={{ borderBottomWidth: 3, borderColor: activeTab === t ? C.primary : 'transparent' }}
            >
              <Text className="text-xs capitalize" style={{ color: activeTab === t ? C.primary : C.muted, fontWeight: activeTab === t ? '800' : '600' }}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        <View style={{ padding: 20 }}>
          {/* OVERVIEW TAB */}
          {activeTab === "overview" && (
            <View>
              {/* Goal & Bio */}
              <View className="p-4 rounded-[24px] mb-4 border" style={{ backgroundColor: C.card, borderColor: C.border }}>
                <View className="flex-row justify-between items-center mb-3">
                  <View className="px-3 py-1.5 rounded-xl" style={{ backgroundColor: `${C.primary}15` }}>
                    <Text className="text-xs font-bold" style={{ color: C.primary }}>
                      {profile?.goal === 'looking_for_team' ? '🚀 Looking for Team' : profile?.goal === 'open_to_join' ? '🤝 Open to Join' : '👀 Exploring'}
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-1.5">
                    <View className="w-2 h-2 rounded-full" style={{ backgroundColor: profile?.availability ? C.success : C.muted }} />
                    <Text className="text-[10px] font-bold" style={{ color: profile?.availability ? C.success : C.muted }}>
                      {profile?.availability ? 'Available now' : 'Busy'}
                    </Text>
                  </View>
                </View>
                {profile?.bio && (
                  <View className="pt-3 border-t" style={{ borderColor: C.border }}>
                    <Text className="text-xs leading-5" style={{ color: C.muted }}>{profile.bio}</Text>
                  </View>
                )}
              </View>

              {/* Links */}
              {(profile?.social_links?.github || profile?.social_links?.portfolio || profile?.social_links?.linkedin) && (
                <View className="p-4 rounded-[24px] mb-4 border" style={{ backgroundColor: C.card, borderColor: C.border }}>
                  <Text className="text-xs font-bold mb-3" style={{ color: C.text }}>Links</Text>
                  <View className="gap-2">
                    {profile.social_links.github && (
                      <TouchableOpacity onPress={() => Linking.openURL(profile.social_links.github.startsWith('http') ? profile.social_links.github : `https://${profile.social_links.github}`)} className="flex-row items-center gap-3">
                        <View className="w-8 h-8 rounded-xl items-center justify-center" style={{ backgroundColor: '#24292e' }}><Ionicons name="logo-github" size={16} color="white" /></View>
                        <View><Text className="text-[10px] font-bold" style={{ color: C.muted }}>GitHub</Text><Text className="text-xs font-bold" style={{ color: C.primary }}>{profile.social_links.github}</Text></View>
                      </TouchableOpacity>
                    )}
                    {profile.social_links.portfolio && (
                      <TouchableOpacity onPress={() => Linking.openURL(profile.social_links.portfolio.startsWith('http') ? profile.social_links.portfolio : `https://${profile.social_links.portfolio}`)} className="flex-row items-center gap-3">
                        <View className="w-8 h-8 rounded-xl items-center justify-center" style={{ backgroundColor: `${C.primary}22` }}><Ionicons name="globe-outline" size={16} color={C.primary} /></View>
                        <View><Text className="text-[10px] font-bold" style={{ color: C.muted }}>Portfolio</Text><Text className="text-xs font-bold" style={{ color: C.primary }}>{profile.social_links.portfolio}</Text></View>
                      </TouchableOpacity>
                    )}
                    {profile.social_links.linkedin && (
                      <TouchableOpacity onPress={() => Linking.openURL(profile.social_links.linkedin.startsWith('http') ? profile.social_links.linkedin : `https://${profile.social_links.linkedin}`)} className="flex-row items-center gap-3">
                        <View className="w-8 h-8 rounded-xl items-center justify-center" style={{ backgroundColor: '#0077B522' }}><Ionicons name="logo-linkedin" size={16} color="#0077B5" /></View>
                        <View><Text className="text-[10px] font-bold" style={{ color: C.muted }}>LinkedIn</Text><Text className="text-xs font-bold" style={{ color: "#0077B5" }}>{profile.social_links.linkedin}</Text></View>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              )}

              {/* Interests */}
              {profile?.interests?.length > 0 && (
                <View className="p-4 rounded-[24px] mb-4 border" style={{ backgroundColor: C.card, borderColor: C.border }}>
                  <Text className="text-xs font-bold mb-3" style={{ color: C.text }}>Interests</Text>
                  <View className="flex-row flex-wrap gap-2">
                    {profile.interests.map((i: string) => (
                      <View key={i} className="px-3 py-1.5 rounded-full" style={{ backgroundColor: `${C.primary}18` }}>
                        <Text className="text-[11px] font-bold" style={{ color: C.primary }}>{i}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              <View className="items-center py-2">
                <Text className="text-xs" style={{ color: C.muted }}>🎓 Member since {joined.toLocaleDateString()} · {monthsOn} months on CollabSpace</Text>
              </View>
            </View>
          )}

          {/* SKILLS TAB */}
          {activeTab === "skills" && (
            <View>
              {profile?.skills?.length > 0 ? (
                <View>
                  <View className="flex-row flex-wrap gap-2 mb-6">
                    {profile.skills.map((s: string) => (
                      <View key={s} className="px-4 py-2 rounded-xl border" style={{ backgroundColor: `${C.primary}12`, borderColor: `${C.primary}33` }}>
                        <Text className="text-xs font-bold" style={{ color: C.primary }}>{s}</Text>
                      </View>
                    ))}
                  </View>

                  <View className="p-4 rounded-[24px] border" style={{ backgroundColor: C.card, borderColor: C.border }}>
                    <Text className="text-xs font-bold mb-4" style={{ color: C.text }}>Skill Overview</Text>
                    {profile.skills.map((s: string, i: number) => {
                      const lvls = [85, 72, 68, 90, 55, 78];
                      const lvl = lvls[i % lvls.length];
                      return (
                        <View key={s} className="mb-3">
                          <View className="flex-row justify-between mb-1.5">
                            <Text className="text-xs font-bold" style={{ color: C.text }}>{s}</Text>
                            <Text className="text-[10px] font-bold" style={{ color: C.muted }}>{lvl}%</Text>
                          </View>
                          <View className="h-1.5 rounded-full w-full overflow-hidden" style={{ backgroundColor: C.border }}>
                            <View className="h-full rounded-full" style={{ width: `${lvl}%`, backgroundColor: C.primary, opacity: 0.8 }} />
                          </View>
                        </View>
                      );
                    })}
                  </View>
                </View>
              ) : (
                <View className="items-center py-8">
                  <Text style={{ fontSize: 36, marginBottom: 10 }}>⚡</Text>
                  <Text className="text-sm font-bold mb-2" style={{ color: C.text }}>No skills added yet</Text>
                </View>
              )}
            </View>
          )}

          {/* ACTIVITY TAB */}
          {activeTab === "activity" && (
            <View>
              <View className="flex-row flex-wrap gap-3 mb-5">
                {[
                  { icon: "🤝", val: stats.connections, label: "Collaborations", sub: "Active connections" },
                  { icon: "📅", val: stats.events_joined, label: "Events Joined", sub: "Hackathons, etc." },
                  { icon: "📤", val: stats.requests_sent, label: "Requests Sent", sub: "To potential teams" }
                ].map(stat => (
                  <View key={stat.label} className="p-4 rounded-[24px] border flex-1 min-w-[45%]" style={{ backgroundColor: C.card, borderColor: C.border }}>
                    <Text className="text-2xl mb-1.5">{stat.icon}</Text>
                    <Text className="text-xl font-black" style={{ color: C.text }}>{stat.val}</Text>
                    <Text className="text-[11px] font-bold mt-1" style={{ color: C.text }}>{stat.label}</Text>
                    <Text className="text-[9px] mt-0.5" style={{ color: C.muted }}>{stat.sub}</Text>
                  </View>
                ))}
              </View>

              <Text className="text-sm font-bold mb-3" style={{ color: C.text }}>Recent Activity</Text>
              {activities.length > 0 ? activities.map((a, i) => (
                <View key={i} className="flex-row gap-3 mb-4">
                  <View className="w-10 h-10 rounded-xl items-center justify-center border" style={{ backgroundColor: `${a.color}15`, borderColor: `${a.color}33` }}>
                    <Text className="text-lg">{a.icon}</Text>
                  </View>
                  <View className="flex-1 justify-center">
                    <Text className="text-xs font-bold" style={{ color: C.text }}>{a.text}</Text>
                    <Text className="text-[10px] mt-1" style={{ color: C.muted }}>{a.time}</Text>
                  </View>
                </View>
              )) : (
                 <Text className="text-xs italic" style={{ color: C.muted }}>No recent activity to show.</Text>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Floating Bottom Button for Collab Request */}
      {!isOwnProfile && (!connectionInfo || connectionInfo.status !== 'accepted') && (
        <View className={`absolute bottom-0 left-0 right-0 p-6`} style={{ backgroundColor: C.bg }}>
          {connectionInfo?.status === 'pending' ? (
             connectionInfo.is_sender ? (
                <TouchableOpacity 
                  onPress={handleCancelRequest}
                  className={`w-full py-4 rounded-2xl items-center justify-center shadow-lg bg-red-500`}
                >
                  <Text className="text-white font-bold text-sm">Cancel Request</Text>
                </TouchableOpacity>
             ) : (
                <TouchableOpacity 
                  onPress={() => router.push('/(student)/connections')}
                  className={`w-full py-4 rounded-2xl items-center justify-center shadow-lg bg-emerald-500`}
                >
                  <Text className="text-white font-bold text-sm">Respond to Request</Text>
                </TouchableOpacity>
             )
          ) : (
             <TouchableOpacity 
               onPress={handleSendRequest}
               disabled={requestSent}
               className={`w-full py-4 rounded-2xl items-center justify-center ${requestSent ? 'bg-slate-400' : 'shadow-lg'}`}
               style={{ backgroundColor: requestSent ? '#94A3B8' : C.primary }}
             >
               <Text className="text-white font-bold text-sm">
                 {requestSent ? 'Collaboration Request Sent ✓' : 'Send Collaboration Request'}
               </Text>
             </TouchableOpacity>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}
