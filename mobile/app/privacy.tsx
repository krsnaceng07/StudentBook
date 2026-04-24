import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function PrivacyPolicyScreen() {
  const router = useRouter();

  const sections = [
    {
      title: "Data Collection",
      content: "We collect minimal data necessary for the app to function, including your name, email, and academic interests. We do not track your location or sell your data to third parties."
    },
    {
      title: "Information Visibility",
      content: "You have full control over your privacy. By default, your email is hidden from other users. You can choose to make it public in your account settings."
    },
    {
      title: "Messaging Privacy",
      content: "Your messages are private between you and the participants. We do not use your messages for advertising or profiling."
    },
    {
      title: "Account Deletion",
      content: "You can delete your account at any time. This will 'soft-delete' your profile, making it invisible to all other users. For full data erasure, please contact our support team."
    }
  ];

  return (
    <ScrollView className="flex-1 bg-[#0F172A]">
      <View className="px-6 pt-16 pb-20">
        <View className="flex-row items-center justify-between mb-8">
          <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-2xl font-bold">Privacy Policy</Text>
          <View className="w-10" />
        </View>

        <View className="mb-10">
          <Text className="text-slate-400 leading-6 italic">
            Last Updated: April 2026. Your privacy is our top priority. We are committed to protecting your personal data and ensuring a safe environment for students.
          </Text>
        </View>

        <View className="space-y-8">
          {sections.map((section, index) => (
            <View key={index}>
              <Text className="text-[#10B981] font-bold text-lg mb-3">{section.title}</Text>
              <Text className="text-slate-300 leading-7 text-base">
                {section.content}
              </Text>
            </View>
          ))}
        </View>

        <View className="mt-12 p-6 bg-white/5 rounded-3xl border border-white/10">
          <Text className="text-white font-bold mb-2">Questions?</Text>
          <Text className="text-slate-400">If you have any questions about our privacy practices, please contact us at privacy@studentsociety.com</Text>
        </View>
      </View>
    </ScrollView>
  );
}
