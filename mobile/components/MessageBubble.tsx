import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

interface MessageBubbleProps {
  text: string;
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
}

export default function MessageBubble({ 
  text, 
  isMe, 
  timestamp, 
  senderName, 
  senderAvatar, 
  senderId,
  replyTo 
}: MessageBubbleProps) {
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
          className={`px-4 py-3 rounded-2xl ${
            isMe 
              ? 'bg-[#3B82F6] rounded-tr-none' 
              : 'bg-white/10 rounded-tl-none border border-white/5'
          }`}
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

          <Text className="text-white leading-5">{text}</Text>
          <Text 
            className={`text-[9px] mt-1 ${isMe ? 'text-white/70 text-right' : 'text-slate-500'}`}
          >
            {time}
          </Text>
        </View>
      </View>
    </View>
  );
}
