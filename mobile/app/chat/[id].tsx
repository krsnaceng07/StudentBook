import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useChatStore } from '../../store/chatStore';
import { useAuthStore } from '../../store/authStore';
import MessageBubble from '../../components/MessageBubble';

export default function ChatDetailScreen() {
  const { id: conversationId } = useLocalSearchParams();
  const router = useRouter();
  const { 
    messages, 
    fetchMessages, 
    sendMessage, 
    personalConversations, 
    teamConversations, 
    isLoading, 
    clearActiveChat 
  } = useChatStore();
  const { user } = useAuthStore();
  
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [replyingTo, setReplyingTo] = useState<any>(null);
  const flatListRef = useRef<FlatList>(null);

  // Find conversation details in either personal or team lists
  const conversation = 
    personalConversations.find((c: any) => c._id === conversationId) || 
    teamConversations.find((c: any) => c._id === conversationId);
    
  const otherUser = conversation?.otherUser;
  const isTeamChat = conversation?.type === 'team';

  useEffect(() => {
    fetchMessages(conversationId as string);
    return () => clearActiveChat();
  }, [conversationId]);

  const handleSend = async () => {
    if (!inputText.trim() || isSending) return;
    
    setIsSending(true);
    const result = await sendMessage(
      conversationId as string, 
      inputText.trim(),
      replyingTo?._id
    );
    if (result.success) {
      setInputText('');
      setReplyingTo(null);
    }
    setIsSending(false);
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <View className="flex-1 bg-[#0F172A] pt-14">
        {/* Header */}
        <View className="px-6 flex-row items-center justify-between pb-4 border-b border-white/5">
          <View className="flex-row items-center">
            <TouchableOpacity 
              onPress={() => router.back()}
              className="h-10 w-10 bg-white/5 rounded-full items-center justify-center border border-white/10 mr-4"
            >
              <Ionicons name="arrow-back" size={20} color="white" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => {
                if (!otherUser?._id) return;
                router.push(isTeamChat ? `/teams/${otherUser._id}` : `/profile/${otherUser._id}`);
              }}
              className="flex-row items-center"
              activeOpacity={0.7}
            >
              <View className={`h-10 w-10 rounded-full items-center justify-center border overflow-hidden ${
                isTeamChat ? 'bg-purple-500/10 border-purple-500/20' : 'bg-[#3B82F6]/10 border-[#3B82F6]/20'
              }`}>
                {isTeamChat ? (
                  <Ionicons name="people" size={20} color="#A855F7" />
                ) : otherUser?.avatar ? (
                  <Image source={{ uri: otherUser.avatar }} className="w-full h-full" />
                ) : (
                  <Text className="text-[#3B82F6] font-bold">{otherUser?.name?.charAt(0) || '?'}</Text>
                )}
              </View>
              <View className="ml-3">
                <Text className="text-white font-bold">{otherUser?.name || 'Loading...'}</Text>
                <View className="flex-row items-center">
                  <View className={`h-1.5 w-1.5 rounded-full mr-1.5 ${isTeamChat ? 'bg-purple-500' : 'bg-green-500'}`} />
                  <Text className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                    {isTeamChat ? 'Team Collaboration' : 'Direct Message'}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <TouchableOpacity 
              onLongPress={() => setReplyingTo(item)}
              activeOpacity={0.9}
            >
              <MessageBubble 
                text={item.text} 
                isMe={item.sender?._id === (user?._id || user?.id) || item.sender === (user?._id || user?.id)} 
                timestamp={item.createdAt} 
                senderName={isTeamChat ? item.sender?.name : undefined}
                senderAvatar={isTeamChat ? item.sender?.avatar : undefined}
                senderId={item.sender?._id || item.sender}
                replyTo={item.replyTo}
              />
            </TouchableOpacity>
          )}
          contentContainerStyle={{ padding: 20, paddingBottom: 20 }}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
          ListEmptyComponent={() => (
            !isLoading && (
              <View className="items-center mt-10">
                <Text className="text-slate-600 text-sm">Send a message to start collaborating!</Text>
              </View>
            )
          )}
          ListHeaderComponent={isLoading ? <ActivityIndicator color="#3B82F6" className="my-4" /> : null}
        />

        {/* Reply Preview Bar */}
        {replyingTo && (
          <View className="px-4 py-2 bg-white/5 border-t border-white/10 flex-row items-center justify-between">
            <View className="flex-1 border-l-2 border-[#3B82F6] pl-3">
              <Text className="text-[#3B82F6] text-[10px] font-bold">
                Replying to {replyingTo.sender?.name || (replyingTo.sender === (user?._id || user?.id) ? 'yourself' : 'User')}
              </Text>
              <Text className="text-slate-400 text-xs" numberOfLines={1}>
                {replyingTo.text}
              </Text>
            </View>
            <TouchableOpacity onPress={() => setReplyingTo(null)}>
              <Ionicons name="close-circle" size={20} color="#64748b" />
            </TouchableOpacity>
          </View>
        )}

        {/* Input area */}
        <View className="p-4 border-t border-white/5 bg-[#0F172A]">
          <View className="flex-row items-center bg-white/5 rounded-2xl border border-white/10 px-4 py-2">
            <TextInput
              placeholder="Type a message..."
              placeholderTextColor="#64748b"
              className="flex-1 text-white py-2 max-h-24"
              value={inputText}
              onChangeText={setInputText}
              multiline
            />
            <TouchableOpacity 
              onPress={handleSend}
              disabled={!inputText.trim() || isSending}
              className={`h-10 w-10 rounded-full items-center justify-center ml-2 ${
                inputText.trim() ? 'bg-[#3B82F6]' : 'bg-white/5'
              }`}
            >
              <Ionicons name="send" size={18} color={inputText.trim() ? 'white' : '#475569'} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
