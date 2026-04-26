import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface TeamCardProps {
  team: {
    _id: string;
    name: string;
    description: string;
    avatar?: string;
    category: string;
    status: string;
    lookingFor: string[];
    members: any[];
    matchScore?: number;
    matchReasons?: string[];
  };
}

export default React.memo(function TeamCard({ team }: TeamCardProps) {
  const router = useRouter();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Recruiting': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'Active': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'Full': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'Study Group': return 'book-outline';
      case 'Research': return 'flask-outline';
      case 'Startup': return 'briefcase-outline';
      case 'Hackathon': return 'code-slash-outline';
      case 'Competitive Exams': return 'trophy-outline';
      case 'Open Source': return 'git-branch-outline';
      case 'Project': return 'rocket-outline';
      default: return 'people-outline';
    }
  };

  return (
    <TouchableOpacity 
      onPress={() => router.push(`/teams/${team._id}`)}
      className="bg-slate-900/50 rounded-[32px] border border-white/10 p-6 mb-6 overflow-hidden"
    >
      {/* Category & Match Score */}
      <View className="flex-row justify-between items-center mb-4">
        <View className="flex-row items-center bg-white/5 px-3 py-1.5 rounded-2xl border border-white/10">
          <Ionicons name={getCategoryIcon(team.category)} size={14} color="#3B82F6" />
          <Text className="text-slate-400 ml-2 text-[10px] font-bold uppercase tracking-wider">{team.category}</Text>
        </View>

        {team.matchScore && team.matchScore > 0 && (
          <View className="bg-[#3B82F6]/10 px-3 py-1 rounded-full border border-[#3B82F6]/20">
             <Text className="text-[#3B82F6] text-[10px] font-bold">{team.matchScore}% Fit 🔥</Text>
          </View>
        )}
      </View>

      <View className="flex-row items-center mb-4">
        {/* Team Avatar */}
        <View className="h-14 w-14 bg-slate-800 rounded-2xl items-center justify-center border border-white/10 overflow-hidden">
          {team.avatar ? (
            <Image source={{ uri: team.avatar }} className="w-full h-full" />
          ) : (
            <Text className="text-white text-xl font-bold">
              {team.name?.charAt(0) || 'T'}
            </Text>
          )}
        </View>

        <View className="ml-4 flex-1">
          <Text className="text-white text-lg font-bold" numberOfLines={1}>{team.name}</Text>
          <View className="flex-row items-center mt-1">
            <View className={`px-2 py-0.5 rounded-md border ${getStatusColor(team.status)}`}>
               <Text className="text-[10px] font-bold uppercase">{team.status}</Text>
            </View>
            <Text className="text-slate-500 text-xs ml-3">{team.members?.length || 0} Members</Text>
          </View>
        </View>
      </View>

      <Text className="text-slate-400 text-sm mb-4 leading-5" numberOfLines={2}>
        {team.description}
      </Text>

      {/* Recruiting Highlights */}
      {team.status === 'Recruiting' && team.lookingFor?.length > 0 && (
        <View className="flex-row flex-wrap gap-2 mb-4">
          <Text className="text-emerald-400/60 text-[10px] font-bold uppercase w-full mb-1">Looking for:</Text>
          {team.lookingFor.slice(0, 3).map((skill, idx) => (
            <View key={idx} className="bg-emerald-500/5 px-2 py-1 rounded-lg border border-emerald-500/10">
              <Text className="text-emerald-400 text-[10px] font-medium">{skill}</Text>
            </View>
          ))}
          {team.lookingFor.length > 3 && (
            <Text className="text-slate-600 text-[10px] self-center">+{team.lookingFor.length - 3} more</Text>
          )}
        </View>
      )}

      {/* Member Preview Avatars */}
      <View className="flex-row items-center justify-between border-t border-white/5 pt-4">
        <View className="flex-row items-center">
           <View className="flex-row -space-x-2">
             {team.members?.slice(0, 3).map((m, i) => (
               <View key={i} className="h-7 w-7 rounded-full bg-slate-800 border-2 border-[#0F172A] items-center justify-center overflow-hidden">
                  {m.user?.avatar ? (
                    <Image source={{ uri: m.user.avatar }} className="w-full h-full" />
                  ) : (
                    <Text className="text-white text-[10px]">{m.user?.name?.charAt(0)}</Text>
                  )}
               </View>
             ))}
           </View>
           {team.members?.length > 3 && (
             <Text className="text-slate-500 text-[10px] ml-2">+{team.members.length - 3} others</Text>
           )}
        </View>
        
        <TouchableOpacity 
           onPress={() => router.push(`/teams/${team._id}`)}
           className="flex-row items-center"
        >
          <Text className="text-[#3B82F6] text-xs font-bold mr-1">View Details</Text>
          <Ionicons name="chevron-forward" size={14} color="#3B82F6" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
});
