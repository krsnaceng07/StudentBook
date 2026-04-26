import React, { memo } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface Attachment {
  url: string;
  type: 'image' | 'pdf' | 'doc';
  name: string;
  size?: number;
}

interface MessageBubbleProps {
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
}

const MessageBubble = ({ 
  text, 
  attachments,
  isMe, 
  timestamp, 
  senderName, 
  senderAvatar, 
  senderId,
  replyTo,
  sending
}: MessageBubbleProps) => {
  const router = useRouter();
  const date = new Date(timestamp);
  const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const handleProfilePress = () => {
    if (senderId) {
      router.push(`/profile/${senderId}`);
    }
  };

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

      <View className="max-w-[75%]">
        {!isMe && senderName && (
          <TouchableOpacity onPress={handleProfilePress}>
            <Text className="text-slate-500 text-[10px] mb-1 ml-1 font-bold uppercase tracking-wider">
              {senderName}
            </Text>
          </TouchableOpacity>
        )}

        <View 
          className={`px-3 py-2.5 rounded-2xl ${
            isMe 
              ? 'bg-[#3B82F6] rounded-tr-none' 
              : 'bg-white/10 rounded-tl-none border border-white/5'
          } ${sending ? 'opacity-70' : 'opacity-100'}`}
        >
          {/* Reply Context */}
          {replyTo && (
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
          {attachments && attachments.length > 0 && (
            <View className="mb-2">
              {attachments.map((att, idx) => (
                att.type === 'image' ? (
                  <TouchableOpacity key={idx} activeOpacity={0.9}>
                    <Image 
                      source={{ uri: att.url }} 
                      className="w-60 h-60 rounded-xl mb-1.5" 
                      resizeMode="cover" 
                    />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity 
                    key={idx} 
                    className="flex-row items-center bg-black/20 p-3 rounded-xl mb-1.5 min-w-[200px]"
                  >
                    <View className="bg-white/10 p-2 rounded-lg">
                       <Ionicons name="document-text" size={24} color={isMe ? 'white' : '#3B82F6'} />
                    </View>
                    <View className="ml-3 flex-1">
                      <Text className="text-white font-bold text-xs" numberOfLines={1}>{att.name}</Text>
                      {att.size && (
                        <Text className="text-slate-400 text-[9px] mt-0.5">
                          {(att.size / 1024).toFixed(1)} KB • PDF
                        </Text>
                      )}
                    </View>
                    <Ionicons name="download-outline" size={18} color="white" opacity={0.5} />
                  </TouchableOpacity>
                )
              ))}
            </View>
          )}

          {text ? <Text className="text-white leading-5">{text}</Text> : null}
          <View className="flex-row items-center justify-end mt-1">
            <Text 
              className={`text-[9px] ${isMe ? 'text-white/70' : 'text-slate-500'}`}
            >
              {time}
            </Text>
            {isMe && (
              <Ionicons 
                name={sending ? "time-outline" : "checkmark-done"} 
                size={10} 
                color="white" 
                style={{ marginLeft: 4, opacity: 0.7 }} 
              />
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

export default memo(MessageBubble);
