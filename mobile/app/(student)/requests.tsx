import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUIStore } from '../../store/uiStore';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import client from '../../api/client';

export default function Requests() {
  const { isDarkMode } = useUIStore();
  const [activeTab, setActiveTab] = useState<'Incoming' | 'Outgoing'>('Incoming');
  const [loading, setLoading] = useState(false);
  const [incomingRequests, setIncomingRequests] = useState<any[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<any[]>([]);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      if (activeTab === 'Incoming') {
        const response = await client.get('/student/connections/incoming');
        if (response.data && response.data.success) {
          setIncomingRequests(response.data.data);
        }
      } else {
        const response = await client.get('/student/connections/outgoing');
        if (response.data && response.data.success) {
          setOutgoingRequests(response.data.data);
        }
      }
    } catch (err) {
      console.warn('Error fetching requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (requestId: string, status: 'accepted' | 'declined') => {
    setActionLoadingId(requestId);
    try {
      const response = await client.put('/student/connections/respond', { requestId, status });
      if (response.data && response.data.success) {
        Alert.alert("Success", `Collaboration request successfully ${status}!`);
        fetchRequests();
      } else {
        Alert.alert("Error", response.data.error || "Failed to respond to request.");
      }
    } catch (err: any) {
      console.error(err);
      const errMsg = err.response?.data?.error || "Failed to process request.";
      Alert.alert("Error", errMsg);
    } finally {
      setActionLoadingId(null);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchRequests();
    }, [activeTab])
  );

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
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-start', alignItems: 'center' }}
          className="flex-1"
        >
          {activeTab === 'Incoming' && incomingRequests.length === 0 ? (
            <View style={{ alignItems: 'center', paddingHorizontal: 48, paddingBottom: 64, paddingTop: 80 }}>
              {/* Mailbox Emoji/Graphics */}
              <View style={{
                width: 96,
                height: 96,
                borderRadius: 48,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 24,
                backgroundColor: isDarkMode ? '#1E293B' : '#EFF6FF'
              }}>
                <Text style={{ fontSize: 48, textAlign: 'center' }}>📬</Text>
              </View>

              <Text style={{
                fontSize: 17,
                fontWeight: 'bold',
                textAlign: 'center',
                marginBottom: 8,
                color: isDarkMode ? '#FFFFFF' : '#1E293B'
              }}>
                No incoming requests
              </Text>
              <Text style={{
                fontSize: 12,
                textAlign: 'center',
                lineHeight: 20,
                paddingHorizontal: 16,
                color: isDarkMode ? '#94A3B8' : '#64748B'
              }}>
                When someone sends you a request, it appears here
              </Text>
            </View>
          ) : activeTab === 'Outgoing' && outgoingRequests.length === 0 ? (
            <View style={{ alignItems: 'center', paddingHorizontal: 48, paddingBottom: 64, paddingTop: 80 }}>
              <View style={{
                width: 96,
                height: 96,
                borderRadius: 48,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 24,
                backgroundColor: isDarkMode ? '#1E293B' : '#EFF6FF'
              }}>
                <Text style={{ fontSize: 48, textAlign: 'center' }}>📤</Text>
              </View>

              <Text style={{
                fontSize: 17,
                fontWeight: 'bold',
                textAlign: 'center',
                marginBottom: 8,
                color: isDarkMode ? '#FFFFFF' : '#1E293B'
              }}>
                No outgoing requests
              </Text>
              <Text style={{
                fontSize: 12,
                textAlign: 'center',
                lineHeight: 20,
                paddingHorizontal: 16,
                color: isDarkMode ? '#94A3B8' : '#64748B'
              }}>
                Your pending sent invitations will be listed here
              </Text>
            </View>
          ) : (
            // If requests list is not empty, render cards
            <View className="w-full px-6 py-4 gap-4">
              {(activeTab === 'Incoming' ? incomingRequests : outgoingRequests).map((item) => {
                const userObj = (activeTab === 'Incoming' ? item.sender : item.receiver) || {};
                const fullName = userObj.full_name || 'Anonymous Student';
                const initials = userObj.initials || fullName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() || '??';
                const university = userObj.university || 'StudentBook University';
                return (
                  <View 
                    key={item.id}
                    className={`p-5 rounded-3xl border border-slate-100 ${
                      isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white shadow-sm'
                    }`}
                  >
                    <View className="flex-row items-center mb-3">
                      {/* Avatar */}
                      <View className="w-12 h-12 rounded-full bg-blue-600 items-center justify-center mr-3">
                        <Text className="text-white font-bold text-base">{initials}</Text>
                      </View>

                      {/* Info */}
                      <View className="flex-1">
                        <Text className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                          {fullName}
                        </Text>
                        <Text className={`text-[11px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                          {university}
                        </Text>
                      </View>
                    </View>

                    {/* Action buttons for Incoming requests */}
                    {activeTab === 'Incoming' && (
                      <View className="flex-row gap-2 mt-4">
                        <TouchableOpacity
                          onPress={() => handleRespond(item.id, 'accepted')}
                          disabled={actionLoadingId !== null}
                          className="flex-1 bg-blue-600 py-2.5 rounded-xl items-center justify-center"
                        >
                          {actionLoadingId === item.id ? (
                            <ActivityIndicator size="small" color="#fff" />
                          ) : (
                            <Text className="text-white font-bold text-xs">Accept</Text>
                          )}
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() => handleRespond(item.id, 'declined')}
                          disabled={actionLoadingId !== null}
                          className={`flex-1 py-2.5 rounded-xl items-center justify-center ${
                            isDarkMode ? 'bg-slate-700' : 'bg-slate-200'
                          }`}
                        >
                          <Text className={`font-bold text-xs ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Decline</Text>
                        </TouchableOpacity>
                      </View>
                    )}

                    {/* Pending label for Outgoing requests */}
                    {activeTab === 'Outgoing' && (
                      <View className="mt-2 flex-row justify-end">
                        <View className={`px-3 py-1.5 rounded-full ${
                          isDarkMode ? 'bg-amber-950/40' : 'bg-amber-100'
                        }`}>
                          <Text className={`font-bold text-[10px] ${
                            isDarkMode ? 'text-amber-400' : 'text-amber-600'
                          }`}>
                            Pending Response
                          </Text>
                        </View>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
