import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useChatStore } from '../../store/chatStore';
import { useAuthStore } from '../../store/authStore';
import MessageBubble from '../../components/MessageBubble';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';

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
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<any>(null);
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

  const handlePickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
      });
      
      if (!result.canceled) {
        setSelectedFile(result.assets[0]);
      }
    } catch (err) {
      console.error('Pick File Error:', err);
    }
  };

  const handleSend = async () => {
    if ((!inputText.trim() && !selectedFile) || isSending || isUploading) return;
    
    setIsSending(true);
    let attachments: any[] = [];

    if (selectedFile) {
      setIsUploading(true);
      const uploadRes = await useChatStore.getState().uploadMedia(selectedFile);
      if (uploadRes.success) {
        attachments.push(uploadRes.data);
      } else {
        console.error('Upload failed:', uploadRes.error);
        setIsUploading(false);
        setIsSending(false);
        return;
      }
      setIsUploading(false);
    }
    
    const result = await sendMessage(
      conversationId as string, 
      inputText.trim(),
      replyingTo?._id,
      attachments
    );
    if (result.success) {
      setInputText('');
      setReplyingTo(null);
      setSelectedFile(null);
    }
    setIsSending(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0F172A]" edges={['top', 'bottom']}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <View className="flex-1 bg-[#0F172A]">
          {/* Header */}
          <View className="px-6 flex-row items-center justify-between py-4 border-b border-white/5">
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
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <TouchableOpacity 
                onLongPress={() => setReplyingTo(item)}
                activeOpacity={0.9}
              >
                <MessageBubble 
                  text={item.text} 
                  attachments={item.attachments}
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

          {/* File Preview Bar */}
          {selectedFile && (
            <View className="px-4 py-3 bg-white/5 border-t border-white/10 flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <View className="h-10 w-10 bg-[#3B82F6]/20 rounded-xl items-center justify-center mr-3">
                  <Ionicons 
                    name={selectedFile.mimeType?.startsWith('image/') ? 'image' : 'document-text'} 
                    size={20} 
                    color="#3B82F6" 
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-white text-xs font-bold" numberOfLines={1}>
                    {selectedFile.name}
                  </Text>
                  <Text className="text-slate-500 text-[10px]">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • Ready to upload
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setSelectedFile(null)}>
                <Ionicons name="close-circle" size={24} color="#EF4444" />
              </TouchableOpacity>
            </View>
          )}

          {/* Input area */}
          <View 
            style={{ 
              paddingBottom: Platform.OS === 'ios' ? 10 : 20,
              paddingTop: 10,
              paddingHorizontal: 16,
              borderTopWidth: 1,
              borderTopColor: 'rgba(255,255,255,0.05)',
              backgroundColor: '#0F172A'
            }}
          >
            <View className="flex-row items-center bg-white/5 rounded-2xl border border-white/10 px-4 py-2">
              <TouchableOpacity 
                onPress={handlePickFile}
                className="h-10 w-10 items-center justify-center -ml-1"
              >
                <Ionicons name="add-circle-outline" size={26} color="#64748b" />
              </TouchableOpacity>

              <TextInput
                placeholder="Type a message..."
                placeholderTextColor="#64748b"
                className="flex-1 text-white py-2 max-h-24 px-2"
                value={inputText}
                onChangeText={setInputText}
                multiline
              />
              
              <TouchableOpacity 
                onPress={handleSend}
                disabled={(!inputText.trim() && !selectedFile) || isSending || isUploading}
                className={`h-10 w-10 rounded-full items-center justify-center ml-2 ${
                  (inputText.trim() || selectedFile) ? 'bg-[#3B82F6]' : 'bg-white/5'
                }`}
              >
                {isSending || isUploading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Ionicons name="send" size={18} color={(inputText.trim() || selectedFile) ? 'white' : '#475569'} />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
