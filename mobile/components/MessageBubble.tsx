import React, { memo } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import { useUIStore } from '../store/uiStore';

interface Attachment {
  url: string;
  type: string;
  name: string;
  size?: number;
}

interface MessageBubbleProps {
  id: string;
  text?: string;
  attachments?: Attachment[];
  isMe: boolean;
  timestamp: string;
  senderName?: string;
  senderAvatar?: string;
  senderId?: string;
  replyTo?: {
    _id: string;
    text: string;
    sender: {
      _id: string;
      name: string;
    };
  };
  sending?: boolean;
  status?: 'sent' | 'delivered' | 'seen' | 'deleted';
  reactions?: { user: any; emoji: string }[];
  onLongPress?: () => void;
}


const MessageBubble = ({ 
  id,
  text, 
  attachments,
  isMe, 
  timestamp, 
  senderName, 
  senderAvatar, 
  senderId,
  replyTo,
  sending,
  status,
  reactions,
  onLongPress
}: MessageBubbleProps) => {
  const router = useRouter();
  const { showToast } = useUIStore();
  const date = new Date(timestamp);
  const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const isDeleted = status === 'deleted';

  const handleDownload = async (url: string, fileName: string) => {
    try {
      showToast('Downloading file...', 'info');
      
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      const downloadRes = await FileSystem.downloadAsync(url, fileUri);
      
      if (downloadRes.status === 200) {
        // If it's an image or video, save to gallery
        const isImage = fileName.match(/\.(jpeg|jpg|gif|png)$/i);
        const isVideo = fileName.match(/\.(mp4|mov|m4v)$/i);

        if (isImage || isVideo) {
          const { status } = await MediaLibrary.requestPermissionsAsync(true); // true for writeOnly
          if (status === 'granted') {
            await MediaLibrary.createAssetAsync(downloadRes.uri);
            showToast('Saved to Gallery!', 'success');
          } else {
            // Fallback to sharing if permission denied
            await Sharing.shareAsync(downloadRes.uri);
            showToast('Permission denied, use share to save', 'info');
          }
        } else {
          // For documents, use sharing sheet (standard on Android/iOS)
          await Sharing.shareAsync(downloadRes.uri);
          showToast('File downloaded!', 'success');
        }
      } else {
        showToast('Download failed', 'error');
      }
    } catch (error) {
      console.error('Download Error:', error);
      showToast('Could not save file', 'error');
    }
  };

  const handleProfilePress = () => {
    if (senderId) {
      router.push(`/profile/${senderId}`);
    }
  };

  // Group reactions by emoji type
  const reactionGroups = reactions?.reduce((acc: any, curr) => {
    acc[curr.emoji] = (acc[curr.emoji] || 0) + 1;
    return acc;
  }, {});

  return (
    <View className={`flex-row mb-4 ${isMe ? 'justify-end' : 'justify-start'}`}>
      {/* Avatar for others in team chat */}
      {!isMe && (
        <TouchableOpacity onPress={handleProfilePress} activeOpacity={0.8}>
          <View className="h-8 w-8 rounded-full bg-white/10 mr-2 items-center justify-center border border-white/5 overflow-hidden">
            {senderAvatar ? (
              <Image source={{ uri: senderAvatar }} className="h-full w-full" />
            ) : (
              <Text className="text-white text-[10px] font-bold">{senderName?.charAt(0)}</Text>
            )}
          </View>
        </TouchableOpacity>
      )}

      <View className="max-w-[80%]">
        {!isMe && senderName && (
          <TouchableOpacity onPress={handleProfilePress}>
            <Text className="text-slate-500 text-[10px] mb-1 ml-1 font-bold uppercase tracking-wider">
              {senderName}
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity 
          activeOpacity={0.9}
          onLongPress={onLongPress}
          className={`px-3 py-2.5 rounded-2xl ${
            isMe 
              ? 'bg-[#3B82F6] rounded-tr-none' 
              : 'bg-white/10 rounded-tl-none border border-white/5'
          } ${sending ? 'opacity-70' : 'opacity-100'} ${isDeleted ? 'bg-slate-800/50 opacity-60' : ''}`}
        >
          {/* Reply Context */}
          {replyTo && !isDeleted && (
            <View className="bg-black/20 rounded-lg p-2 mb-2 border-l-2 border-[#3B82F6]/50">
              <Text className="text-[#3B82F6] text-[10px] font-bold mb-1">
                Replying to {replyTo.sender?.name}
              </Text>
              <Text className="text-slate-400 text-[11px]" numberOfLines={1}>
                {replyTo.text}
              </Text>
            </View>
          )}

          {/* Render Attachments */}
          {!isDeleted && attachments && attachments.length > 0 && (
            <View className="mb-1">
              {attachments.map((att, idx) => (
                (att.type === 'image' || att.url.match(/\.(jpeg|jpg|gif|png)$/i)) ? (
                  <View key={idx} className="mb-1.5">
                    <Image 
                      source={{ uri: att.url }} 
                      className="w-64 h-64 rounded-xl border border-white/10" 
                      resizeMode="cover" 
                    />
                    {/* Timestamp Overlay for Images like WhatsApp */}
                    <View className="absolute bottom-2 right-2 bg-black/40 px-1.5 py-0.5 rounded-full flex-row items-center">
                       <Text className="text-white text-[9px]">{time}</Text>
                       {isMe && (
                        <Ionicons 
                          name={sending ? "time-outline" : "checkmark-done"} 
                          size={10} 
                          color={status === 'seen' ? "#10B981" : "white"} 
                          style={{ marginLeft: 3 }} 
                        />
                      )}
                    </View>
                  </View>
                ) : (
                  <View 
                    key={idx} 
                    className="flex-row items-center bg-black/20 p-3 rounded-xl mb-1.5 min-w-[220px]"
                  >
                    <View className="bg-white/10 p-2 rounded-lg">
                       <Ionicons 
                         name={
                           att.type === 'video' ? "videocam" :
                           att.type.includes('pdf') ? "document-text" :
                           (att.type === 'zip' || att.url.match(/\.(zip|rar|7z)$/i)) ? "archive" :
                           "document"
                         } 
                         size={24} 
                         color={isMe ? 'white' : '#3B82F6'} 
                       />
                    </View>
                    <View className="ml-3 flex-1">
                      <Text className="text-white font-bold text-xs" numberOfLines={1}>{att.name}</Text>
                      {att.size && (
                        <Text className="text-slate-400 text-[9px] mt-0.5">
                          {(att.size / 1024).toFixed(1)} KB • FILE
                        </Text>
                      )}
                    </View>
                  </View>
                )
              ))}
            </View>
          )}

          {isDeleted ? (
            <View className="flex-row items-center py-0.5">
              <Ionicons name="ban-outline" size={14} color="#94A3B8" />
              <Text className="text-slate-400 italic ml-1.5 text-[13px]">This message was deleted</Text>
            </View>
          ) : (
            text ? <Text className="text-white leading-5 text-[15px]">{text}</Text> : null
          )}
          
          {/* Bottom Info (only if not image-only message which has overlay) */}
          {(!attachments?.length || (attachments[0].type !== 'image' && !attachments[0].url.match(/\.(jpeg|jpg|gif|png)$/i))) && !isDeleted && (
            <View className="flex-row items-center justify-end mt-1">
              <Text 
                className={`text-[9px] ${isMe ? 'text-white/70' : 'text-slate-500'}`}
              >
                {time}
              </Text>
              {isMe && (
                <Ionicons 
                  name={sending ? "time-outline" : "checkmark-done"} 
                  size={12} 
                  color={status === 'seen' ? "#10B981" : "white"} 
                  style={{ marginLeft: 4, opacity: status === 'seen' ? 1 : 0.7 }} 
                />
              )}
            </View>
          )}

          {/* Reactions Overlay */}
          {!isDeleted && reactionGroups && Object.keys(reactionGroups).length > 0 && (
            <View className={`absolute -bottom-3 ${isMe ? 'right-0' : 'left-0'} flex-row bg-[#1E293B] border border-white/10 rounded-full px-1.5 py-0.5 shadow-lg`}>
              {Object.entries(reactionGroups).map(([emoji, count]: any) => (
                <View key={emoji} className="flex-row items-center mx-0.5">
                  <Text className="text-[10px]">{emoji}</Text>
                  {count > 1 && <Text className="text-white text-[8px] ml-0.5 font-bold">{count}</Text>}
                </View>
              ))}
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default memo(MessageBubble);
