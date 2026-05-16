import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import client from '../api/client';
import useUIStore from '../store/uiStore';

interface TeamCardProps {
  team: {
    teamId: string;
    _id?: string;
    name: string;
    category?: string;
    avatar?: string | null;
    memberCount: number;
    matchScore: number;
    reasons?: string[];
    matchReasons?: string[];
    hasPendingRequest?: boolean;
    isLeader?: boolean;   // user is leader/owner of this team
    isMember?: boolean;   // user is already a member
  };
}

export default React.memo(function TeamCard({ team }: TeamCardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { isDarkMode } = useUIStore();
  // Seed initial state from backend so card is correct on first render
  const [requestState, setRequestState] = useState<'none' | 'pending'>(
    team.hasPendingRequest ? 'pending' : 'none'
  );

  // Use teamId if present (discover store), fall back to _id (team store)
  const id = team.teamId || team._id || '';
  // Already in this team — hide all join/cancel buttons
  const isAlreadyInTeam = !!(team.isLeader || team.isMember);
  // Resolved reasons from either field name
  const reasons = team.reasons?.length ? team.reasons : (team.matchReasons || []);

  const handleJoin = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await client.post(`/teams/${team.teamId}/request`, { message: 'Interested in joining!' });
      setRequestState('pending');
    } catch (err: any) {
      // If already pending (edge case), still show pending state
      if (err?.response?.status === 400) setRequestState('pending');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRequest = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await client.delete(`/teams/${team.teamId}/request`);
      setRequestState('none');
    } catch {
      // silently fail — UI will remain pending to avoid confusion
    } finally {
      setLoading(false);
    }
  };

  const getMatchEmoji = (score: number) => {
    if (score >= 80) return '🔥';
    if (score >= 50) return '✨';
    return '🤝';
  };

  const categoryIcon: Record<string, string> = {
    'Study Group': 'book',
    'Research': 'flask',
    'Startup': 'rocket',
    'Hackathon': 'code-slash',
    'Competitive Exams': 'trophy',
    'Open Source': 'logo-github',
    'Project': 'construct',
    'Other': 'grid',
  };
  const icon = (categoryIcon[team.category || ''] || 'people') as any;

  const isPending = requestState === 'pending';

  return (
    <View className={`${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-slate-100 shadow-sm'} rounded-[32px] border p-6 mb-6 overflow-hidden relative`}>
      {/* Background glow */}
      <View
        className="absolute -top-10 -right-10 h-32 w-32 rounded-full"
        style={{
          backgroundColor: team.matchScore >= 70
            ? 'rgba(139,92,246,0.08)'
            : 'rgba(99,102,241,0.05)'
        }}
      />

      {/* Header row */}
      <View className="flex-row items-start justify-between mb-4">
        <TouchableOpacity
          onPress={() => router.push(`/teams/${id}` as any)}
          className="flex-row items-center flex-1"
        >
          {/* Avatar */}
          <View className={`${isDarkMode ? 'bg-slate-800 border-white/10' : 'bg-slate-100 border-slate-200'} h-16 w-16 rounded-2xl items-center justify-center border overflow-hidden`}>
            {team.avatar ? (
              <Image source={{ uri: team.avatar || undefined }} className="w-full h-full" />
            ) : (
              <Ionicons name={icon} size={28} color={isDarkMode ? "#A78BFA" : "#000000"} />
            )}
          </View>

          <View className="ml-4 flex-1">
            <View className="flex-row items-center">
              <Text className={`${isDarkMode ? 'text-white' : 'text-black'} text-lg font-black flex-1`} numberOfLines={1}>
                {team.name}
              </Text>
              {team.isLeader && (
                <View className="ml-2 bg-yellow-500/15 px-2 py-0.5 rounded-md">
                  <Text className="text-yellow-400 text-[9px] font-black">YOUR TEAM</Text>
                </View>
              )}
              {!team.isLeader && team.isMember && (
                <View className="ml-2 bg-emerald-500/15 px-2 py-0.5 rounded-md">
                  <Text className="text-emerald-400 text-[9px] font-black">MEMBER</Text>
                </View>
              )}
            </View>
            <Text className={`${isDarkMode ? 'text-white/80' : 'text-purple-500'} text-xs font-black uppercase tracking-wider`}>
              {team.category || 'Team'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Match score badge */}
        <View
          className="px-3 py-2 rounded-2xl border items-center"
          style={{
            backgroundColor: team.matchScore >= 70
              ? 'rgba(139,92,246,0.08)'
              : 'rgba(255,255,255,0.05)',
            borderColor: team.matchScore >= 70
              ? 'rgba(139,92,246,0.25)'
              : 'rgba(255,255,255,0.1)',
          }}
        >
          <Text
            className="font-black text-sm"
            style={{ color: isDarkMode ? '#FFFFFF' : (team.matchScore >= 70 ? '#8B5CF6' : '#000000') }}
          >
            {team.matchScore}% {getMatchEmoji(team.matchScore)}
          </Text>
          <Text className="text-slate-500 text-[8px] uppercase font-black mt-0.5 tracking-widest">
            Match
          </Text>
        </View>
      </View>

      {/* Subtitle */}
      <Text className={`${isDarkMode ? 'text-slate-400' : 'text-slate-500'} text-sm mb-4 font-bold leading-5`}>
        {team.memberCount} member{team.memberCount !== 1 ? 's' : ''} · Public Team
      </Text>

      {/* Common Ground */}
      {reasons.length > 0 && (
        <View className={`${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'} rounded-2xl p-4 mb-6 border`}>
          <Text className="text-slate-500 text-[10px] font-black uppercase mb-2">
            Why This Team
          </Text>
          <Text className={`${isDarkMode ? 'text-slate-300' : 'text-slate-700'} text-xs leading-5`}>
            Matches your interest in{' '}
            <Text className={`${isDarkMode ? 'text-white' : 'text-black'} font-bold`}>
              {reasons.slice(0, 3).join(', ')}
            </Text>
            {reasons.length > 3 && ' and more.'}
          </Text>
        </View>
      )}

      {/* Action Buttons */}
      <View className="flex-row gap-4">
        {/* Left: View Team (always visible) */}
        <TouchableOpacity
          onPress={() => router.push(`/teams/${id}` as any)}
          className={`${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'} flex-1 rounded-3xl py-4 items-center border`}
        >
          <Text className={`${isDarkMode ? 'text-white' : 'text-black'} font-black`}>View Team</Text>
        </TouchableOpacity>

        {/* Right: only show for non-members */}
        {!isAlreadyInTeam && (
          isPending ? (
            <TouchableOpacity
              onPress={handleCancelRequest}
              disabled={loading}
              className="flex-[1.5] rounded-3xl py-4 items-center"
              style={{ backgroundColor: 'rgba(239,68,68,0.1)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.35)' }}
            >
              {loading ? (
                <ActivityIndicator color="#F87171" size="small" />
              ) : (
                <View className="flex-row items-center">
                  <Ionicons name="close-circle" size={18} color="#F87171" />
                  <Text className="font-black ml-2 text-red-400">Cancel Request</Text>
                </View>
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={handleJoin}
              disabled={loading}
              className="flex-[1.5] rounded-3xl py-4 items-center shadow-2xl"
              style={{ backgroundColor: isDarkMode ? '#FFFFFF' : (isDarkMode ? '#FFFFFF' : '#000000'), borderWidth: 1, borderColor: isDarkMode ? '#FFFFFF' : '#000000' }}
            >
              {loading ? (
                <ActivityIndicator color={isDarkMode ? 'black' : 'white'} size="small" />
              ) : (
                <View className="flex-row items-center">
                  <Ionicons name="person-add" size={18} color={isDarkMode ? 'black' : 'white'} />
                  <Text className={`font-black ml-2 ${isDarkMode ? 'text-black' : 'text-white'}`}>Join Team</Text>
                </View>
              )}
            </TouchableOpacity>
          )
        )}
      </View>
    </View>
  );
});
