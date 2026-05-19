import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useUIStore } from '../../store/uiStore';

export default function SendFeedback() {
  const router = useRouter();
  const { isDarkMode } = useUIStore();
  const [type, setType] = useState('general');
  const [msg, setMsg] = useState('');
  const [rating, setRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const C = {
    bg: isDarkMode ? '#0F172A' : '#F8FAFC',
    card: isDarkMode ? '#1E293B' : '#FFFFFF',
    border: isDarkMode ? '#334155' : '#E2E8F0',
    text: isDarkMode ? '#F8FAFC' : '#0F172A',
    muted: isDarkMode ? '#94A3B8' : '#64748B',
    primary: '#2563EB'
  };

  const TYPES = [
    {id:"general", icon:"💬", label:"General", desc:"General feedback or suggestions"},
    {id:"bug", icon:"🐛", label:"Bug Report", desc:"Something isn't working right"},
    {id:"feature", icon:"💡", label:"Feature Request", desc:"Suggest a new feature"},
    {id:"praise", icon:"🌟", label:"Praise", desc:"Something you love about the app"}
  ];

  const submit = () => {
    if (!msg.trim() || rating === 0) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); setSubmitted(true); }, 900);
  };

  if (submitted) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: C.bg, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 60, marginBottom: 20 }}>🙏</Text>
        <Text className="text-2xl font-extrabold mb-3" style={{ color: C.text }}>Thank you!</Text>
        <Text className="text-sm text-center px-10 mb-8 leading-6" style={{ color: C.muted }}>Your feedback helps us build a better CollabSpace for students across Nepal.</Text>
        <TouchableOpacity onPress={() => router.back()} className="px-6 py-3 rounded-xl" style={{ backgroundColor: `${C.primary}15` }}>
          <Text className="font-bold" style={{ color: C.primary }}>← Back to Settings</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={['top']}>
      <View className="px-5 py-4 flex-row items-center border-b" style={{ borderColor: C.border, backgroundColor: C.card }}>
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full items-center justify-center mr-3" style={{ backgroundColor: C.bg }}>
          <Ionicons name="arrow-back" size={20} color={C.text} />
        </TouchableOpacity>
        <Text className="text-xl font-extrabold" style={{ color: C.text }}>Send Feedback</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        
        <Text className="text-xs font-bold mb-3" style={{ color: C.text }}>Type of feedback</Text>
        <View className="gap-3 mb-6">
          {TYPES.map(t => (
            <TouchableOpacity
              key={t.id}
              onPress={() => setType(t.id)}
              className="p-4 rounded-2xl border flex-row items-center gap-3"
              style={{ backgroundColor: type === t.id ? `${C.primary}08` : C.card, borderColor: type === t.id ? C.primary : C.border }}
            >
              <Text style={{ fontSize: 22 }}>{t.icon}</Text>
              <View className="flex-1">
                <Text className="font-bold text-sm" style={{ color: type === t.id ? C.primary : C.text }}>{t.label}</Text>
                <Text className="text-[11px] mt-0.5" style={{ color: C.muted }}>{t.desc}</Text>
              </View>
              {type === t.id && <Ionicons name="checkmark-circle" size={20} color={C.primary} />}
            </TouchableOpacity>
          ))}
        </View>

        <Text className="text-xs font-bold mb-4" style={{ color: C.text }}>How would you rate your experience?</Text>
        <View className="flex-row justify-center gap-2 mb-2">
          {[1,2,3,4,5].map(s => (
            <TouchableOpacity key={s} onPress={() => setRating(s)}>
              <Ionicons name={s <= rating ? "star" : "star-outline"} size={s <= rating ? 40 : 34} color={s <= rating ? "#F59E0B" : C.muted} />
            </TouchableOpacity>
          ))}
        </View>
        <Text className="text-center text-xs mb-6 font-semibold" style={{ color: C.muted }}>
          {["", "Needs work", "Could be better", "Good", "Very good", "Excellent! 🎉"][rating]}
        </Text>

        <Text className="text-xs font-bold mb-3" style={{ color: C.text }}>Your feedback</Text>
        <TextInput
          value={msg}
          onChangeText={setMsg}
          placeholder="Tell us what you think, what's working, what can be improved..."
          placeholderTextColor={C.muted}
          multiline
          numberOfLines={5}
          textAlignVertical="top"
          className="rounded-2xl border p-4 font-medium mb-1"
          style={{ backgroundColor: C.card, borderColor: C.border, color: C.text, minHeight: 120 }}
        />
        <Text className="text-right text-[10px] mb-8 font-bold" style={{ color: C.muted }}>{msg.length}/500</Text>

        <TouchableOpacity 
          onPress={submit}
          disabled={!msg.trim() || rating === 0 || loading}
          className="py-4 rounded-2xl items-center justify-center"
          style={{ backgroundColor: (!msg.trim() || rating === 0) ? C.border : C.primary }}
        >
          {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-sm">Submit Feedback →</Text>}
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}
