import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, FlatList, ActivityIndicator, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useStudyStore } from '@/store/studyStore';
import { useAIStore } from '@/store/aiStore';
import { useAuthStore } from '@/store/authStore';
import useUIStore from '@/store/uiStore';
import { LinearGradient } from 'expo-linear-gradient';

const StudyHubScreen = () => {
  const [activeTab, setActiveTab] = useState('Feed');
  const scrollViewRef = useRef<ScrollView>(null);
  const { feed, fetchFeed, loading: studyLoading } = useStudyStore();
  const { messages, askAI, loading: aiLoading } = useAIStore();
  const { user } = useAuthStore();
  const { isDarkMode } = useUIStore();
  const [aiQuery, setAiQuery] = useState('');

  useEffect(() => {
    if (activeTab === 'Feed') {
      fetchFeed();
    }
  }, [activeTab]);

  const handleAskAI = () => {
    if (!aiQuery.trim()) return;
    askAI(aiQuery, user?.field);
    setAiQuery('');
  };

  const renderFeedItem = ({ item }: { item: any }) => (
    <View className={`${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-white border-slate-100 shadow-sm'} p-4 mb-3 rounded-2xl border`}>
      <View className="flex-row items-center mb-3">
        <Image 
          source={{ uri: item.authorId?.avatar || 'https://via.placeholder.com/40' }} 
          className="w-10 h-10 rounded-full mr-3"
        />
        <View>
          <Text className={`${isDarkMode ? 'text-white' : 'text-black'} font-bold`}>{item.authorId?.name}</Text>
          <Text className={`${isDarkMode ? 'text-slate-400' : 'text-slate-500'} text-xs`}>{item.field} • {item.type}</Text>
        </View>
      </View>
      <Text className={`${isDarkMode ? 'text-slate-200' : 'text-slate-800'} mb-3`}>{item.content}</Text>
      {item.fileUrl && (
        <TouchableOpacity className="bg-blue-500/20 p-3 rounded-xl flex-row items-center">
          <IconSymbol name="doc.fill" size={20} color="#3B82F6" />
          <Text className="text-blue-400 ml-2 font-medium">View Resource</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView className={`flex-1 ${isDarkMode ? 'bg-[#0F172A]' : 'bg-white'}`}>
      <View className="px-6 pt-4 pb-2">
        <Text className={`text-3xl font-black ${isDarkMode ? 'text-white' : 'text-black'} tracking-tight`}>Study Hub</Text>
        <Text className={`${isDarkMode ? 'text-slate-400' : 'text-slate-500'} text-sm`}>Empowering your academic journey</Text>
      </View>

      {/* Tab Switcher */}
      <View className="flex-row px-6 py-4 space-x-2">
        {['Feed', 'Ask', 'AI'].map((tab) => (
          <TouchableOpacity 
            key={tab}
            onPress={() => setActiveTab(tab)}
            className={`px-6 py-2.5 rounded-full ${activeTab === tab ? (isDarkMode ? 'bg-white' : 'bg-[#3B82F6]') : (isDarkMode ? 'bg-white/10' : 'bg-slate-100')}`}
          >
            <Text className={`font-bold ${activeTab === tab ? (isDarkMode ? 'text-black' : 'text-white') : (isDarkMode ? 'text-slate-400' : 'text-slate-500')}`}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View className="flex-1 px-4">
        {activeTab === 'Feed' && (
          <FlatList
            data={feed}
            renderItem={renderFeedItem}
            keyExtractor={item => item._id}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              studyLoading ? <ActivityIndicator color={isDarkMode ? '#FFFFFF' : '#3B82F6'} className="mt-10" /> : <Text className="text-slate-500 text-center mt-10">No resources found yet.</Text>
            }
          />
        )}

        {activeTab === 'AI' && (
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 80}
            className="flex-1"
          >
            <ScrollView 
              className="flex-1 mb-4" 
              showsVerticalScrollIndicator={false}
              ref={scrollViewRef}
              onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
            >
              {messages.length === 0 && (
                <View className="mt-10 items-center">
                  <IconSymbol name="sparkles" size={60} color={isDarkMode ? "#3B82F6" : "#000000"} />
                  <Text className={`text-xl font-bold mt-4 ${isDarkMode ? 'text-white' : 'text-black'}`}>Ask AI Mentor</Text>
                  <Text className={`${isDarkMode ? 'text-slate-400' : 'text-slate-500'} text-center px-10 mt-2`}>Get instant academic assistance powered by Llama 3 & Tavily.</Text>
                </View>
              )}
              {messages.map((msg: any, idx: number) => (
                <View key={idx} className={`p-4 mb-3 rounded-2xl ${msg.role === 'user' 
                  ? (isDarkMode ? 'bg-blue-600/30 self-end max-w-[85%]' : 'bg-[#3B82F6] self-end max-w-[85%]') 
                  : (isDarkMode ? 'bg-white/5 self-start max-w-[90%]' : 'bg-slate-100 self-start max-w-[90%]')}`}>
                   <Text className={`${msg.role === 'user' && !isDarkMode ? 'text-white' : (isDarkMode ? 'text-slate-100' : 'text-slate-800')} leading-relaxed`}>{msg.content}</Text>
                </View>
              ))}
              {aiLoading && <ActivityIndicator color="#3B82F6" className="self-start ml-4 mb-4" />}
            </ScrollView>
            
            <View className={`flex-row items-center ${isDarkMode ? 'bg-white/5' : 'bg-slate-100'} rounded-2xl px-4 py-2 mb-4 border ${isDarkMode ? 'border-white/5' : 'border-slate-200'}`}>
              <TextInput 
                className={`flex-1 ${isDarkMode ? 'text-white' : 'text-black'} py-3 max-h-32`}
                placeholder="Ask anything..."
                placeholderTextColor={isDarkMode ? "#64748B" : "#94A3B8"}
                value={aiQuery}
                onChangeText={setAiQuery}
                multiline
              />
              <TouchableOpacity onPress={handleAskAI} className={`${isDarkMode ? 'bg-white' : 'bg-black'} p-2.5 rounded-xl ml-2 shadow-lg`}>
                <IconSymbol name="paperplane.fill" size={20} color={isDarkMode ? "black" : "white"} />
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        )}

         {activeTab === 'Ask' && (
          <View className="flex-1 justify-center items-center">
             <IconSymbol name="questionmark.circle.fill" size={60} color={isDarkMode ? '#FFFFFF' : '#000000'} />
             <Text className={`text-xl font-bold mt-4 ${isDarkMode ? 'text-white' : 'text-black'}`}>Peer Learning</Text>
             <Text className={`${isDarkMode ? 'text-slate-400' : 'text-slate-500'} text-center px-10 mt-2`}>Connect with other students in your field to solve doubts together.</Text>
             <TouchableOpacity className={`${isDarkMode ? 'bg-white' : 'bg-blue-600'} px-8 py-3 rounded-full mt-6`}>
               <Text className={`${isDarkMode ? 'text-black' : 'text-white'} font-bold`}>Post a Question</Text>
             </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default StudyHubScreen;
