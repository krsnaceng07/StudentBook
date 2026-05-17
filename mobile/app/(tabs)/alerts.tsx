import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUIStore } from '../../store/uiStore';

const MOCK_NOTIFICATIONS = {
  new: [
    {
      id: '1',
      type: 'connection_accepted',
      initials: 'PR',
      color: 'bg-purple-100 text-purple-700',
      message: 'Priya Rana accepted your connection request',
      time: '2 minutes ago',
    },
    {
      id: '2',
      type: 'team_invite',
      initials: 'AK',
      color: 'bg-amber-100 text-amber-700',
      message: 'Aakash KC sent you a team invite for Nepal Tech Hackathon 2025',
      time: '1 hour ago',
    },
  ],
  earlier: [
    {
      id: '3',
      type: 'event_post',
      initials: '',
      color: 'bg-green-100',
      message: 'New event: AI Workshop by Tech Community',
      time: '5 hours ago',
    },
    {
      id: '4',
      type: 'connection_request',
      initials: 'RB',
      color: 'bg-blue-100 text-blue-700',
      message: 'Roshan Bhandari sent you a connection request',
      time: 'Yesterday',
    },
  ],
};

export default function Alerts() {
  const { isDarkMode } = useUIStore();

  const renderNotification = (item: any, isNew: boolean) => {
    const isInviteOrRequest = item.type === 'team_invite' || item.type === 'connection_request';

    return (
      <View 
        key={item.id} 
        className={`flex-row px-4 py-4 border-b ${
          isNew 
            ? isDarkMode ? 'bg-blue-900/20 border-slate-800' : 'bg-blue-50/50 border-blue-100' 
            : isDarkMode ? 'bg-[#0F172A] border-slate-800' : 'bg-white border-slate-100'
        }`}
      >
        <View className={`w-12 h-12 rounded-full items-center justify-center mr-3 mt-1 ${item.color}`}>
          <Text className={`font-bold text-base ${item.color.split(' ')[1] || ''}`}>{item.initials}</Text>
        </View>
        <View className="flex-1">
          <Text className={`text-[15px] leading-5 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
            {item.message}
          </Text>
          <Text className={`text-xs mt-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
            {item.time}
          </Text>

          {isInviteOrRequest && (
            <View className="flex-row gap-3 mt-3">
              <TouchableOpacity className={`px-5 py-1.5 rounded-full ${isDarkMode ? 'bg-blue-600' : 'bg-blue-600'}`}>
                <Text className="text-white font-medium text-sm">Accept</Text>
              </TouchableOpacity>
              <TouchableOpacity className={`px-5 py-1.5 rounded-full border ${isDarkMode ? 'border-slate-600' : 'border-slate-300'}`}>
                <Text className={`font-medium text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Decline</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className={`flex-1 ${isDarkMode ? 'bg-[#0F172A]' : 'bg-white'}`}>
      <View className={`px-4 py-3 flex-row items-center justify-between border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
        <Text className={`text-2xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          Notifications
        </Text>
        <TouchableOpacity>
          <Text className="text-blue-500 font-medium">Mark all read</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1">
        <View className={`py-3 px-4 ${isDarkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
          <Text className={`text-sm font-semibold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>New</Text>
        </View>
        {MOCK_NOTIFICATIONS.new.map((item) => renderNotification(item, true))}

        <View className={`py-3 px-4 mt-2 ${isDarkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
          <Text className={`text-sm font-semibold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Earlier</Text>
        </View>
        {MOCK_NOTIFICATIONS.earlier.map((item) => renderNotification(item, false))}
      </ScrollView>
    </SafeAreaView>
  );
}
