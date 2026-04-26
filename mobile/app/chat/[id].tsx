import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator, Image, Modal, TouchableWithoutFeedback } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useChatStore } from '../../store/chatStore';
import { useAuthStore } from '../../store/authStore';
import MessageBubble from '../../components/MessageBubble';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import { useUIStore } from '../../store/uiStore';

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
    clearActiveChat,
    setTyping,
    stopTyping,
    typingUsers,
    onlineUsers,
    toggleReaction,
    markAsSeen,
    deleteMessage
  } = useChatStore();
  const { user } = useAuthStore();
  
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [replyingTo, setReplyingTo] = useState<any>(null);
  const [reactionTarget, setReactionTarget] = useState<any>(null);
  const flatListRef = useRef<FlatList>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { showToast } = useChatStore.getState() as any; // fallback

  // Find conversation details in either personal or team lists
  const conversation = 
    personalConversations.find((c: any) => c._id === conversationId) || 
    teamConversations.find((c: any) => c._id === conversationId);
    
  const otherUser = conversation?.otherUser;
  const isTeamChat = conversation?.type === 'team';
  const isOtherUserOnline = !isTeamChat && otherUser?._id && onlineUsers.has(otherUser._id);

  // Typing logic
  const handleInputChange = (text: string) => {
    setInputText(text);
    if (!conversationId) return;

    setTyping(conversationId as string);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping(conversationId as string);
    }, 2000);
  };

  useEffect(() => {
    fetchMessages(conversationId as string);
    markAsSeen(conversationId as string);
    
    return () => {
      clearActiveChat();
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [conversationId]);

  const handlePickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*', // Allow all file types
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
    
    // Lock sending/uploading immediately
    setIsSending(true);
    if (selectedFile) setIsUploading(true);

    if (typingTimeoutRef.current) {
       clearTimeout(typingTimeoutRef.current);
       stopTyping(conversationId as string);
    }

    try {
      let attachments: any[] = [];

      if (selectedFile) {
        const uploadRes = await useChatStore.getState().uploadMedia(selectedFile);
        if (uploadRes.success) {
          attachments.push(uploadRes.data);
        } else {
          console.log('[Upload Failed] Alerting user');
          setIsUploading(false);
          setIsSending(false);
          return;
        }
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
    } catch (err) {
      console.error('Handle Send Error:', err);
    } finally {
      setIsUploading(false);
      setIsSending(false);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    const res = await deleteMessage(messageId);
    if (res.success) {
      setReactionTarget(null);
    }
  };

  const handleDownload = async (url: string, fileName: string) => {
    try {
      useUIStore.getState().showToast('Downloading file...', 'info');
      
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      const downloadRes = await FileSystem.downloadAsync(url, fileUri);
      
      if (downloadRes.status === 200) {
        const isImage = fileName.match(/\.(jpeg|jpg|gif|png)$/i);
        const isVideo = fileName.match(/\.(mp4|mov|m4v)$/i);

        if (isImage || isVideo) {
          const { status } = await MediaLibrary.requestPermissionsAsync(true);
          if (status === 'granted') {
            await MediaLibrary.createAssetAsync(downloadRes.uri);
            useUIStore.getState().showToast('Saved to Gallery!', 'success');
          } else {
            await Sharing.shareAsync(downloadRes.uri);
          }
        } else {
          await Sharing.shareAsync(downloadRes.uri);
          useUIStore.getState().showToast('File downloaded!', 'success');
        }
      }
    } catch (error) {
      console.error('Download Error:', error);
      useUIStore.getState().showToast('Could not save file', 'error');
    }
    setReactionTarget(null);
  };

  const renderMessage = useCallback(({ item }: { item: any }) => {
    const isMe = item.sender?._id === (user?._id || user?.id) || item.sender === (user?._id || user?.id);
    return (
      <MessageBubble 
        id={item._id}
        text={item.text} 
        attachments={item.attachments}
        isMe={isMe} 
        timestamp={item.createdAt} 
        senderName={isTeamChat ? item.sender?.name : undefined}
        senderAvatar={isTeamChat ? item.sender?.avatar : undefined}
        senderId={item.sender?._id || item.sender}
        replyTo={item.replyTo}
        sending={item.sending}
        status={item.status}
        reactions={item.reactions}
        onLongPress={() => setReactionTarget(item)}
      />
    );
  }, [user?._id, user?.id, isTeamChat, setReactionTarget]);

  const getTypingText = () => {
    const typers = typingUsers[conversationId as string];
    if (!typers) return null;
    const typingList = Object.entries(typers)
      .filter(([uid]) => uid !== (user?._id || user?.id))
      .map(([_, name]) => name);
    
    if (typingList.length === 0) return null;
    if (typingList.length === 1) return `${typingList[0]} is typing...`;
    return `${typingList.length} people are typing...`;
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
                  <View className="flex-row items-center">
                    <Text className="text-white font-bold">{otherUser?.name || 'Loading...'}</Text>
                    {isOtherUserOnline && (
                      <View className="h-2 w-2 rounded-full bg-emerald-500 ml-2" />
                    )}
                  </View>
                  <View className="flex-row items-center">
                    {getTypingText() ? (
                       <Text className="text-[#3B82F6] text-[10px] font-bold animate-pulse">
                         {getTypingText()}
                       </Text>
                    ) : (
                      <>
                        <View className={`h-1.5 w-1.5 rounded-full mr-1.5 ${isTeamChat ? 'bg-purple-500' : isOtherUserOnline ? 'bg-emerald-500' : 'bg-slate-700'}`} />
                        <Text className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                          {isTeamChat ? 'Team Collaboration' : isOtherUserOnline ? 'Active Now' : 'Direct Message'}
                        </Text>
                      </>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Messages */}
          <FlatList
            ref={flatListRef}
            data={messages}
            inverted={true}
            keyExtractor={(item) => item._id}
            keyboardShouldPersistTaps="handled"
            renderItem={renderMessage}
            contentContainerStyle={{ padding: 20, paddingTop: 20 }}
            initialNumToRender={20}
            maxToRenderPerBatch={10}
            windowSize={10}
            ListEmptyComponent={() => (
              !isLoading && (
                <View className="items-center mt-10" style={{ transform: [{ scaleY: -1 }] }}>
                  <Text className="text-slate-600 text-sm">Send a message to start collaborating!</Text>
                </View>
              )
            )}
            ListFooterComponent={isLoading ? <ActivityIndicator color="#3B82F6" className="my-4" /> : null}
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
                onChangeText={handleInputChange}
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

      {/* Reaction & Action Modal */}
      <Modal
        visible={!!reactionTarget}
        transparent
        animationType="fade"
        onRequestClose={() => setReactionTarget(null)}
      >
        <TouchableWithoutFeedback onPress={() => setReactionTarget(null)}>
          <View className="flex-1 bg-black/60 justify-center items-center">
            <View className="bg-[#1E293B] p-4 rounded-3xl border border-white/10 flex-row shadow-2xl mb-4">
              {['👍', '❤️', '🔥', '😂', '😮', '😢'].map((emoji) => (
                <TouchableOpacity 
                  key={emoji} 
                  onPress={() => {
                    toggleReaction(reactionTarget._id, emoji);
                    setReactionTarget(null);
                  }}
                  className="mx-2 p-2 bg-white/5 rounded-full"
                >
                  <Text className="text-2xl">{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <View className="bg-[#1E293B] p-2 rounded-2xl border border-white/10 w-64">
              <TouchableOpacity 
                onPress={() => {
                  setReplyingTo(reactionTarget);
                  setReactionTarget(null);
                }}
                className="flex-row items-center p-3 border-b border-white/5"
              >
                <View className="h-8 w-8 bg-blue-500/10 rounded-lg items-center justify-center mr-3">
                  <Ionicons name="arrow-undo-outline" size={18} color="#3B82F6" />
                </View>
                <Text className="text-white font-medium">Reply</Text>
              </TouchableOpacity>

              {reactionTarget && !reactionTarget.status?.includes('deleted') && reactionTarget.attachments?.length > 0 && (
                <TouchableOpacity 
                  onPress={() => handleDownload(reactionTarget.attachments[0].url, reactionTarget.attachments[0].name)}
                  className="flex-row items-center p-3 border-b border-white/5"
                >
                  <View className="h-8 w-8 bg-emerald-500/10 rounded-lg items-center justify-center mr-3">
                    <Ionicons name="download-outline" size={18} color="#10B981" />
                  </View>
                  <Text className="text-white font-medium">Download to Gallery</Text>
                </TouchableOpacity>
              )}

              {reactionTarget && (reactionTarget.sender?._id === (user?._id || user?.id) || reactionTarget.sender === (user?._id || user?.id)) && (
                <TouchableOpacity 
                  onPress={() => handleDeleteMessage(reactionTarget._id)}
                  className="flex-row items-center p-3"
                >
                  <View className="h-8 w-8 bg-red-500/10 rounded-lg items-center justify-center mr-3">
                    <Ionicons name="trash-outline" size={18} color="#EF4444" />
                  </View>
                  <Text className="text-[#EF4444] font-medium">Delete for Everyone</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}
