import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Linking, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { useUIStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../config/supabase';
import api from '../../api/client';

export default function Profile() {
  const { isDarkMode } = useUIStore();
  const { logout, user } = useAuthStore();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({ connections: 0, events_joined: 0, requests_sent: 0 });
  const [activities, setActivities] = useState<any[]>([]);

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
    try {
      const response = await api.get('/profile/me');
      if (response.data?.success && response.data.data?.profile) {
        setProfile(response.data.data.profile);
        if (response.data.data.stats) {
          setStats(response.data.data.stats);
        }
      }
    } catch (err) {
      console.warn('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
      // Fetch mock activities for now (could connect to an API endpoint later)
      setActivities([
        { icon: "🎓", text: "Joined CollabSpace", time: "Recently", color: "#7C3AED" }
      ]);
    }, [])
  );

  // Real-time synchronization
  useEffect(() => {
    if (!user?.id) return;
    const channel = supabase
      .channel('public:extended_profiles')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'extended_profiles', filter: `id=eq.${user.id}` },
        (payload) => {
          setProfile(payload.new);
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const joined = new Date(profile?.created_at || Date.now());
  const monthsOn = Math.max(1, Math.round((Date.now() - joined.getTime()) / (1000 * 60 * 60 * 24 * 30)));

  const checks = [
    { label: "Name & College", done: !!(profile?.full_name && profile?.university) },
    { label: "Department & Year", done: !!(profile?.department && profile?.university_year) },
    { label: "Bio added", done: !!profile?.bio },
    { label: "Skills selected", done: !!(profile?.skills?.length > 0) },
    { label: "Interests selected", done: !!(profile?.interests?.length > 0) },
    { label: "Goal set", done: !!profile?.goal },
  ];
  const completion = Math.round((checks.filter(c => c.done).length / checks.length) * 100);
  const completionColor = completion < 40 ? '#EF4444' : completion < 70 ? '#F59E0B' : '#10B981';

  if (loading) return <View style={{ flex: 1, backgroundColor: C.bg, justifyContent: 'center' }}><ActivityIndicator color={C.primary} /></View>;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={['top']}>
      {/* Header Banner */}
      <View style={{ backgroundColor: `${C.primary}EA`, paddingTop: 20, paddingHorizontal: 20, paddingBottom: 0 }}>
        {/* Top Actions */}
        <View className="flex-row justify-between mb-4">
          <TouchableOpacity 
            onPress={() => router.push('/settings')}
            className="w-10 h-10 rounded-xl items-center justify-center"
            style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
          >
            <Ionicons name="settings-outline" size={20} color="white" />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => router.push('/edit-profile')}
            className="h-10 px-4 rounded-xl flex-row items-center gap-2"
            style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
          >
            <Ionicons name="pencil" size={14} color="white" />
            <Text className="text-white font-bold text-xs">Edit Profile</Text>
          </TouchableOpacity>
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
            <TouchableOpacity key={label as string} className="flex-1 py-3 items-center" style={{ borderRightWidth: i < 2 ? 1 : 0, borderColor: 'rgba(255,255,255,0.2)' }}>
              <Text className="text-xl font-black text-white">{val}</Text>
              <Text className="text-[10px] text-white/70 font-bold uppercase mt-0.5">{label as string}</Text>
            </TouchableOpacity>
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
      <ScrollView contentContainerStyle={{ padding: 20 }}>
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

            {/* Profile Strength */}
            <View className="p-4 rounded-[24px] mb-4 border" style={{ backgroundColor: completion === 100 ? `${C.success}08` : C.card, borderColor: completion === 100 ? C.success : C.border }}>
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-xs font-bold" style={{ color: C.text }}>Profile Strength</Text>
                <Text className="text-sm font-black" style={{ color: completionColor }}>{completion}%</Text>
              </View>
              <View className="h-2 rounded-full w-full overflow-hidden mb-3" style={{ backgroundColor: C.border }}>
                <View className="h-full rounded-full" style={{ width: `${completion}%`, backgroundColor: completionColor }} />
              </View>
              <View className="gap-2">
                {checks.map(c => (
                  <View key={c.label} className="flex-row items-center gap-2">
                    <View className="w-4 h-4 rounded-full border-2 items-center justify-center" style={{ borderColor: c.done ? C.success : C.border, backgroundColor: c.done ? `${C.success}22` : C.border }}>
                      {c.done && <Ionicons name="checkmark" size={10} color={C.success} />}
                    </View>
                    <Text className="text-xs flex-1" style={{ color: c.done ? C.text : C.muted, fontWeight: c.done ? '600' : '400' }}>{c.label}</Text>
                    {!c.done && (
                      <TouchableOpacity onPress={() => router.push('/edit-profile')}>
                        <Text className="text-[10px] font-bold" style={{ color: C.primary }}>Add →</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
              </View>
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
            <Text className="text-xs leading-5 mb-4" style={{ color: C.muted }}>Your skills are shown on your profile card and used to match you with relevant teammates and events.</Text>
            
            {profile?.skills?.length > 0 ? (
              <View>
                <View className="flex-row flex-wrap gap-2 mb-6">
                  {profile.skills.map((s: string) => (
                    <View key={s} className="px-4 py-2 rounded-xl border" style={{ backgroundColor: `${C.primary}12`, borderColor: `${C.primary}33` }}>
                      <Text className="text-xs font-bold" style={{ color: C.primary }}>{s}</Text>
                    </View>
                  ))}
                </View>
                <TouchableOpacity onPress={() => router.push('/edit-profile')} className="py-3.5 rounded-2xl border items-center mb-4" style={{ borderColor: C.primary }}>
                  <Text className="text-xs font-bold" style={{ color: C.primary }}>✏️ Manage Skills</Text>
                </TouchableOpacity>

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
                <Text className="text-xs text-center mb-6 px-4" style={{ color: C.muted }}>Add your skills so teammates can find you for the right projects</Text>
                <TouchableOpacity onPress={() => router.push('/edit-profile')} className="py-3.5 px-6 rounded-2xl" style={{ backgroundColor: C.primary }}>
                  <Text className="text-xs font-bold text-white">+ Add Skills</Text>
                </TouchableOpacity>
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
      </ScrollView>
    </SafeAreaView>
  );
}
