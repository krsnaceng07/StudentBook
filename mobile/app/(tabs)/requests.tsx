import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUIStore } from '../../store/uiStore';
import { Ionicons } from '@expo/vector-icons';
import client from '../../api/client';

export default function Requests() {
  const { isDarkMode } = useUIStore();
  const [activeTab, setActiveTab] = useState<'Incoming' | 'Outgoing'>('Incoming');
  const [loading, setLoading] = useState(false);
  const [incomingRequests, setIncomingRequests] = useState<any[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<any[]>([]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      // In a real environment, we'd query the backend connections API:
      // const response = await client.get('/connections/requests');
      // For now, we will leave the arrays empty to trigger the beautiful mock empty state from the screenshots
      setIncomingRequests([]);
      setOutgoingRequests([]);
    } catch (err) {
      console.warn('Error fetching requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [activeTab]);

  return (
    <SafeAreaView 
      className={`flex-1 ${isDarkMode ? 'bg-[#0F172A]' : 'bg-[#F8FAFC]'}`}
      edges={['top']}
    >
      {/* Top Header */}
      <View className={`px-6 pt-4 pb-4 ${isDarkMode ? 'bg-[#0F172A]' : 'bg-white border-b border-slate-100 shadow-sm'}`}>
        <Text className={`text-2xl font-bold tracking-tight mb-5 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          Requests
        </Text>

        {/* Custom Segmented Control */}
        <View className={`flex-row p-1 rounded-2xl ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
          <TouchableOpacity 
            onPress={() => setActiveTab('Incoming')}
            className={`flex-1 py-3 rounded-xl items-center justify-center ${
              activeTab === 'Incoming' 
                ? 'bg-blue-600 shadow-sm' 
                : 'bg-transparent'
            }`}
          >
            <Text className={`font-bold text-xs ${
              activeTab === 'Incoming' 
                ? 'text-white' 
                : isDarkMode ? 'text-slate-400' : 'text-slate-500'
            }`}>
              Incoming
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => setActiveTab('Outgoing')}
            className={`flex-1 py-3 rounded-xl items-center justify-center ${
              activeTab === 'Outgoing' 
                ? 'bg-blue-600 shadow-sm' 
                : 'bg-transparent'
            }`}
          >
            <Text className={`font-bold text-xs ${
              activeTab === 'Outgoing' 
                ? 'text-white' 
                : isDarkMode ? 'text-slate-400' : 'text-slate-500'
            }`}>
              Outgoing
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : (
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center' }}
          className="flex-1"
        >
          {activeTab === 'Incoming' && incomingRequests.length === 0 ? (
            <View className="items-center px-12 pb-16">
              {/* Mailbox Emoji/Graphics */}
              <View className={`w-24 h-24 rounded-full items-center justify-center mb-6 ${
                isDarkMode ? 'bg-slate-850' : 'bg-blue-50/50'
              }`}>
                <Text className="text-[52px] leading-[60px]">📬</Text>
              </View>

              <Text className={`text-[17px] font-bold text-center mb-2 ${isDarkMode ? 'text-white' : 'text-[#1E293B]'}`}>
                No incoming requests
              </Text>
              <Text className={`text-xs text-center leading-5 px-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                When someone sends you a request, it appears here
              </Text>
            </View>
          ) : activeTab === 'Outgoing' && outgoingRequests.length === 0 ? (
            <View className="items-center px-12 pb-16">
              <View className={`w-24 h-24 rounded-full items-center justify-center mb-6 ${
                isDarkMode ? 'bg-slate-850' : 'bg-blue-50/50'
              }`}>
                <Text className="text-[52px] leading-[60px]">📤</Text>
              </View>

              <Text className={`text-[17px] font-bold text-center mb-2 ${isDarkMode ? 'text-white' : 'text-[#1E293B]'}`}>
                No outgoing requests
              </Text>
              <Text className={`text-xs text-center leading-5 px-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Your pending sent invitations will be listed here
              </Text>
            </View>
          ) : (
            // If requests list is not empty, render cards
            <View className="w-full px-6 py-4 gap-4">
              {(activeTab === 'Incoming' ? incomingRequests : outgoingRequests).map((item) => (
                <View 
                  key={item.id}
                  className={`p-5 rounded-3xl border border-slate-100 ${
                    isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white shadow-sm'
                  }`}
                >
                  <Text className={`text-sm ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                    {item.message}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
