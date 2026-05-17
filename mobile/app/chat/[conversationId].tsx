import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useUIStore } from '../../store/uiStore';

const MOCK_MESSAGES = [
  {
    id: '1',
    sender: 'other',
    content: "Hey! I saw your profile.\nYou're into Flutter too?",
    status: 'read',
  },
  {
    id: '2',
    sender: 'me',
    content: "Yes! I'm building a student\napp right now.",
    status: 'read',
  },
  {
    id: '3',
    sender: 'other',
    content: "That sounds amazing! Are\nyou looking for teammates?",
    status: 'read',
  },
  {
    id: '4',
    sender: 'me',
    content: "Actually yes — need a UI\ndesigner. Interested?",
    status: 'read',
  },
  {
    id: '5',
    sender: 'other',
    content: "Definitely! I can help with\nFigma designs too.",
    status: 'delivered',
  },
];

export default function ChatScreen() {
  const { conversationId } = useLocalSearchParams();
  const router = useRouter();
  const { isDarkMode } = useUIStore();
  
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState(MOCK_MESSAGES);

  const sendMessage = () => {
    if (!message.trim()) return;
    setMessages([
      ...messages,
      {
        id: Date.now().toString(),
        sender: 'me',
        content: message.trim(),
        status: 'delivered',
      },
    ]);
    setMessage('');
  };

  return (
    <SafeAreaView className={`flex-1 ${isDarkMode ? 'bg-[#0F172A]' : 'bg-[#F8FAFC]'}`} edges={['top', 'bottom']}>
      {/* Header */}
      <View className={`px-4 py-3 flex-row items-center border-b ${isDarkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
        <TouchableOpacity onPress={() => router.back()} className="mr-3 p-2">
          <Ionicons name="chevron-back" size={24} color={isDarkMode ? '#F8FAFC' : '#0F172A'} />
        </TouchableOpacity>
        
        <View className="flex-row items-center flex-1">
          <View className="w-10 h-10 rounded-full bg-purple-100 items-center justify-center mr-3">
            <Text className="text-purple-700 font-bold">PR</Text>
          </View>
          <View>
            <Text className={`font-bold text-base ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Priya Rana</Text>
            <View className="flex-row items-center mt-0.5">
              <Text className="text-blue-500 text-xs font-medium">Online</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity className="p-2">
          <Ionicons name="ellipsis-horizontal" size={20} color={isDarkMode ? '#94A3B8' : '#64748B'} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          className="flex-1 px-4"
          contentContainerStyle={{ paddingVertical: 16 }}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={() => (
            <Text className={`text-center text-xs mb-6 ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
              Today
            </Text>
          )}
          renderItem={({ item, index }) => {
            const isMe = item.sender === 'me';
            const isLast = index === messages.length - 1;
            
            return (
              <View className={`mb-4 max-w-[80%] ${isMe ? 'self-end' : 'self-start'}`}>
                <View 
                  className={`px-4 py-3 rounded-2xl ${
                    isMe 
                      ? 'bg-blue-600 rounded-tr-sm' 
                      : isDarkMode 
                        ? 'bg-slate-800 rounded-tl-sm' 
                        : 'bg-white rounded-tl-sm shadow-sm'
                  }`}
                >
                  <Text className={`text-[15px] leading-6 ${isMe ? 'text-white' : isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                    {item.content}
                  </Text>
                </View>
                {isMe && isLast && (
                  <Text className={`text-right text-[10px] mt-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                    {item.status === 'read' ? 'Read' : 'Delivered'}
                  </Text>
                )}
              </View>
            );
          }}
        />

        {/* Input Bar */}
        <View className={`px-4 py-3 flex-row items-center border-t ${isDarkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-100 bg-white'}`}>
          <View className={`flex-1 flex-row items-center px-4 py-2.5 rounded-full mr-3 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
            <TextInput
              className={`flex-1 mr-2 text-[15px] ${isDarkMode ? 'text-white' : 'text-slate-900'}`}
              placeholder="Message..."
              placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'}
              value={message}
              onChangeText={setMessage}
              multiline
              maxLength={500}
            />
          </View>
          <TouchableOpacity 
            onPress={sendMessage}
            className={`w-11 h-11 rounded-full items-center justify-center ${message.trim() ? 'bg-blue-600' : isDarkMode ? 'bg-slate-700' : 'bg-blue-500 opacity-50'}`}
            disabled={!message.trim()}
          >
            <Ionicons name="send" size={18} color="white" style={{ marginLeft: 2 }} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
