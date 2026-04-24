import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function HelpCenterScreen() {
  const router = useRouter();

  const faqs = [
    {
      question: "How do I connect with other students?",
      answer: "Go to the Discover tab, find a profile you like, and tap 'Connect'. Once they accept, you can start messaging!"
    },
    {
      question: "What are Teams?",
      answer: "Teams are collaborative spaces where you can work on projects, study together, and share resources with a specific group."
    },
    {
      question: "Is my data safe?",
      answer: "Yes! We use industry-standard encryption and give you full control over what information (like email) is visible on your profile."
    },
    {
      question: "How do I report a user?",
      answer: "You can report a user by visiting their profile and tapping the report button (coming soon) or by contacting support directly."
    }
  ];

  return (
    <ScrollView className="flex-1 bg-[#0F172A]">
      <View className="px-6 pt-16 pb-20">
        <View className="flex-row items-center justify-between mb-8">
          <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-2xl font-bold">Help Center</Text>
          <View className="w-10" />
        </View>

        <View className="mb-8">
          <Text className="text-[#3B82F6] font-bold text-lg mb-2">Frequently Asked Questions</Text>
          <Text className="text-slate-400">Everything you need to know about StudentSociety.</Text>
        </View>

        <View className="space-y-4">
          {faqs.map((faq, index) => (
            <View key={index} className="bg-white/5 p-6 rounded-3xl border border-white/10">
              <Text className="text-white font-bold text-lg mb-2">{faq.question}</Text>
              <Text className="text-slate-400 leading-6">{faq.answer}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity className="mt-12 bg-[#3B82F6] p-5 rounded-3xl items-center flex-row justify-center">
          <Ionicons name="mail-outline" size={20} color="white" className="mr-2" />
          <Text className="text-white font-bold text-lg ml-2">Contact Support</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
