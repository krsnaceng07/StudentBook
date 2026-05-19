import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useUIStore } from '../../../store/uiStore';

export default function HelpFAQ() {
  const router = useRouter();
  const { isDarkMode } = useUIStore();
  const [search, setSearch] = useState('');
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const C = {
    bg: isDarkMode ? '#0F172A' : '#F8FAFC',
    card: isDarkMode ? '#1E293B' : '#FFFFFF',
    border: isDarkMode ? '#334155' : '#E2E8F0',
    text: isDarkMode ? '#F8FAFC' : '#0F172A',
    muted: isDarkMode ? '#94A3B8' : '#64748B',
  };

  const FAQS = [
    {q:"How does teammate matching work?",a:"CollabSpace matches students based on their skills, interests, and goals. You can browse all student profiles and filter by skill, domain, or availability."},
    {q:"How do I send a collaboration request?",a:"Go to the Discover tab, find a student you'd like to work with, open their profile, and tap 'Send Collaboration Request'."},
    {q:"Can I message someone without a collaboration request?",a:"No — messaging is only unlocked after both parties accept a collaboration request. This ensures all conversations are meaningful and prevents spam."},
    {q:"How do I post an event as a college?",a:"College accounts can post events by going to the My Events tab and tapping '+ Post New Event'."},
  ];

  const filtered = FAQS.filter(f => !search || f.q.toLowerCase().includes(search.toLowerCase()));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={['top']}>
      <View className="px-5 py-4 flex-row items-center border-b" style={{ borderColor: C.border, backgroundColor: C.card }}>
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full items-center justify-center mr-3" style={{ backgroundColor: C.bg }}>
          <Ionicons name="arrow-back" size={20} color={C.text} />
        </TouchableOpacity>
        <Text className="text-xl font-extrabold" style={{ color: C.text }}>Help & FAQ</Text>
      </View>

      <View className="p-4 border-b" style={{ backgroundColor: C.card, borderColor: C.border }}>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="🔍 Search questions..."
          placeholderTextColor={C.muted}
          className="rounded-2xl px-4 py-3 border font-semibold"
          style={{ backgroundColor: C.bg, borderColor: C.border, color: C.text }}
        />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {filtered.length === 0 ? (
          <Text className="text-center mt-10 font-bold" style={{ color: C.muted }}>No results for "{search}"</Text>
        ) : (
          filtered.map((faq, i) => (
            <View key={i} className="rounded-2xl mb-3 overflow-hidden border" style={{ backgroundColor: C.card, borderColor: C.border }}>
              <TouchableOpacity 
                onPress={() => setOpenIndex(openIndex === i ? null : i)}
                className="p-4 flex-row justify-between items-center"
              >
                <Text className="text-sm font-bold flex-1 pr-3" style={{ color: C.text }}>{faq.q}</Text>
                <Ionicons name={openIndex === i ? "chevron-up" : "chevron-down"} size={18} color={C.muted} />
              </TouchableOpacity>
              {openIndex === i && (
                <View className="px-4 pb-4 pt-1">
                  <Text className="text-xs leading-5" style={{ color: C.muted }}>{faq.a}</Text>
                </View>
              )}
            </View>
          ))
        )}

        <View className="mt-6 p-6 rounded-[24px] border items-center text-center" style={{ backgroundColor: C.card, borderColor: C.border }}>
          <Text className="text-3xl mb-2">💬</Text>
          <Text className="text-sm font-bold mb-1" style={{ color: C.text }}>Still need help?</Text>
          <Text className="text-xs text-center mb-4" style={{ color: C.muted }}>Contact our support team directly</Text>
          <TouchableOpacity className="py-3 px-6 rounded-xl" style={{ backgroundColor: '#2563EB15' }}>
            <Text className="font-bold text-blue-600">Contact Support</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
