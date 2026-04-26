import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, Alert, ActivityIndicator, TextInput, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSettingsStore } from '../store/settingsStore';
import { useAuthStore } from '../store/authStore';

export default function SettingsScreen() {
  const router = useRouter();
  const { settings, isLoading, fetchSettings, updateSettings, changePassword, updateEmail, deleteAccount } = useSettingsStore();
  const { logout, user } = useAuthStore();
  
  const [passwordModal, setPasswordModal] = useState(false);
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  
  const [emailModal, setEmailModal] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [emailPass, setEmailPass] = useState('');

  const [deleteModal, setDeleteModal] = useState(false);
  const [deletePass, setDeletePass] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleToggle = (key: string, subKey?: string) => {
    if (subKey) {
      updateSettings({
        notifications: {
          ...settings?.notifications,
          [subKey]: !settings?.notifications?.[subKey as keyof typeof settings.notifications]
        }
      });
    } else {
      updateSettings({ [key]: !settings?.[key as keyof typeof settings] });
    }
  };

  const handlePasswordChange = async () => {
    if (newPass !== confirmPass) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    const res = await changePassword(currentPass, newPass);
    if (res.success) {
      Alert.alert('Success', 'Password updated successfully');
      setPasswordModal(false);
      setCurrentPass('');
      setNewPass('');
      setConfirmPass('');
    } else {
      Alert.alert('Error', res.error);
    }
  };

  const handleEmailUpdate = async () => {
    const res = await updateEmail(newEmail, emailPass);
    if (res.success) {
      Alert.alert('Success', 'Email updated successfully');
      setEmailModal(false);
      setNewEmail('');
      setEmailPass('');
    } else {
      Alert.alert('Error', res.error);
    }
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      'Delete Account',
      'Are you absolutely sure? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            const res = await deleteAccount(deletePass);
            if (!res.success) Alert.alert('Error', res.error);
          }
        }
      ]
    );
  };

  if (isLoading && !settings) {
    return (
      <View className="flex-1 bg-[#0F172A] items-center justify-center">
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  const SettingItem = ({ icon, title, subtitle, value, onToggle, type = 'switch', onPress, color = '#3B82F6' }: any) => {
    const content = (
      <View className="flex-row items-center justify-between py-4 border-b border-white/5">
        <View className="flex-row items-center flex-1">
          <View className="w-10 h-10 rounded-xl items-center justify-center" style={{ backgroundColor: `${color}15` }}>
            <Ionicons name={icon} size={20} color={color} />
          </View>
          <View className="ml-4 flex-1">
            <Text className="text-white text-base font-medium">{title}</Text>
            {subtitle && <Text className="text-slate-500 text-xs mt-0.5">{subtitle}</Text>}
          </View>
        </View>
        {type === 'switch' ? (
          <Switch 
            value={value} 
            onValueChange={onToggle}
            trackColor={{ false: '#1E293B', true: color }}
            thumbColor={value ? '#FFFFFF' : '#94A3B8'}
          />
        ) : (
          <Ionicons name="chevron-forward" size={20} color="#475569" />
        )}
      </View>
    );

    if (type === 'link') {
      return <TouchableOpacity onPress={onPress}>{content}</TouchableOpacity>;
    }
    return content;
  };

  const SectionTitle = ({ title }: { title: string }) => (
    <Text className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-8 mb-4 px-1">{title}</Text>
  );

  return (
    <ScrollView className="flex-1 bg-[#0F172A]">
      <View className="px-6 pt-16 pb-20">
        <View className="flex-row items-center justify-between mb-8">
          <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-2xl font-bold">Settings</Text>
          <View className="w-10" />
        </View>

        {/* Account Section */}
        <SectionTitle title="Account" />
        <View className="bg-white/5 rounded-3xl p-4 border border-white/10">
          <SettingItem 
            icon="mail-outline" 
            title="Update Email" 
            subtitle={user?.email}
            type="link" 
            onPress={() => setEmailModal(true)}
            color="#3B82F6"
          />
          <SettingItem 
            icon="lock-closed-outline" 
            title="Change Password" 
            type="link" 
            onPress={() => setPasswordModal(true)}
            color="#8B5CF6"
          />
        </View>

        {/* Privacy Section */}
        <SectionTitle title="Privacy & Security" />
        <View className="bg-white/5 rounded-3xl p-4 border border-white/10">
          <SettingItem 
            icon="eye-off-outline" 
            title="Private Account" 
            subtitle="Only connections can see your activity"
            value={settings?.isPrivate} 
            onToggle={() => handleToggle('isPrivate')}
            color="#10B981"
          />
          <SettingItem 
            icon="at-outline" 
            title="Show Email on Profile" 
            value={settings?.showEmail} 
            onToggle={() => handleToggle('showEmail')}
            color="#F59E0B"
          />
          <SettingItem 
            icon="radio-outline" 
            title="Show Online Status" 
            subtitle="Others can see when you are active"
            value={settings?.showOnlineStatus} 
            onToggle={() => handleToggle('showOnlineStatus')}
            color="#10B981"
          />
          <SettingItem 
            icon="people-circle-outline" 
            title="Show Mutuals" 
            subtitle="Show common connections to others"
            value={settings?.showMutualConnections} 
            onToggle={() => handleToggle('showMutualConnections')}
            color="#3B82F6"
          />
        </View>

        {/* Networking Strategy Section */}
        <SectionTitle title="Networking Strategy" />
        <View className="bg-white/5 rounded-3xl p-4 border border-white/10">
          <SettingItem 
            icon="compass-outline" 
            title="Smart Discovery" 
            subtitle={settings?.discoveryFieldFilter === 'same_field' ? 'Matches from my field only' : 'Matches from all fields'}
            value={settings?.discoveryFieldFilter === 'same_field'} 
            onToggle={() => {
              updateSettings({ 
                discoveryFieldFilter: settings?.discoveryFieldFilter === 'same_field' ? 'all' : 'same_field' 
              });
            }}
            color="#3B82F6"
          />
          <SettingItem 
            icon="chatbubbles-outline" 
            title="Messages" 
            subtitle={settings?.allowMessagesFrom === 'everyone' ? 'Everyone can message me' : 'Only connections can message'}
            value={settings?.allowMessagesFrom === 'everyone'} 
            onToggle={() => {
              updateSettings({ 
                allowMessagesFrom: settings?.allowMessagesFrom === 'everyone' ? 'connections' : 'everyone' 
              });
            }}
            color="#8B5CF6"
          />
        </View>

        {/* Notifications Section */}
        <SectionTitle title="Notification Center" />
        <View className="bg-white/5 rounded-3xl p-4 border border-white/10">
          <SettingItem 
            icon="chatbubble-outline" 
            title="Direct Messages" 
            value={settings?.notifications?.messages} 
            onToggle={() => handleToggle('notifications', 'messages')}
            color="#DB2777"
          />
          <SettingItem 
            icon="people-outline" 
            title="Connection Requests" 
            value={settings?.notifications?.connections} 
            onToggle={() => handleToggle('notifications', 'connections')}
            color="#3B82F6"
          />
          <SettingItem 
            icon="briefcase-outline" 
            title="Team Activity" 
            subtitle="Requests and approvals"
            value={settings?.notifications?.teamRequests} 
            onToggle={() => handleToggle('notifications', 'teamRequests')}
            color="#A855F7"
          />
          <SettingItem 
            icon="at-circle-outline" 
            title="Mentions & Tags" 
            value={settings?.notifications?.mentions} 
            onToggle={() => handleToggle('notifications', 'mentions')}
            color="#10B981"
          />
          <SettingItem 
            icon="newspaper-outline" 
            title="New Feed Posts" 
            value={settings?.notifications?.posts} 
            onToggle={() => handleToggle('notifications', 'posts')}
            color="#8B5CF6"
          />
        </View>

        {/* Support Section */}
        <SectionTitle title="Support" />
        <View className="bg-white/5 rounded-3xl p-4 border border-white/10">
          <SettingItem 
            icon="help-circle-outline" 
            title="Help Center" 
            type="link" 
            onPress={() => router.push('/help')}
            color="#64748B" 
          />
          <SettingItem 
            icon="document-text-outline" 
            title="Privacy Policy" 
            type="link" 
            onPress={() => router.push('/privacy')}
            color="#64748B" 
          />
        </View>

        {/* Danger Zone */}
        <SectionTitle title="Danger Zone" />
        <View className="bg-white/5 rounded-3xl p-4 border border-white/10">
          <TouchableOpacity 
            onPress={logout}
            className="flex-row items-center py-4 border-b border-white/5"
          >
            <View className="w-10 h-10 rounded-xl bg-orange-500/10 items-center justify-center">
              <Ionicons name="log-out-outline" size={20} color="#F97316" />
            </View>
            <Text className="text-white text-base ml-4 font-medium">Logout</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => setDeleteModal(true)}
            className="flex-row items-center py-4"
          >
            <View className="w-10 h-10 rounded-xl bg-red-500/10 items-center justify-center">
              <Ionicons name="trash-outline" size={20} color="#EF4444" />
            </View>
            <Text className="text-red-500 text-base ml-4 font-medium">Delete Account</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Password Modal */}
      <Modal visible={passwordModal} transparent animationType="slide">
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-[#1E293B] rounded-t-[40px] p-8">
            <View className="flex-row justify-between items-center mb-8">
              <Text className="text-white text-xl font-bold">Change Password</Text>
              <TouchableOpacity onPress={() => setPasswordModal(false)}>
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
            </View>
            <TextInput 
              placeholder="Current Password"
              placeholderTextColor="#64748B"
              secureTextEntry
              value={currentPass}
              onChangeText={setCurrentPass}
              className="bg-white/5 border border-white/10 p-4 rounded-2xl text-white mb-4"
            />
            <TextInput 
              placeholder="New Password"
              placeholderTextColor="#64748B"
              secureTextEntry
              value={newPass}
              onChangeText={setNewPass}
              className="bg-white/5 border border-white/10 p-4 rounded-2xl text-white mb-4"
            />
            <TextInput 
              placeholder="Confirm New Password"
              placeholderTextColor="#64748B"
              secureTextEntry
              value={confirmPass}
              onChangeText={setConfirmPass}
              className="bg-white/5 border border-white/10 p-4 rounded-2xl text-white mb-8"
            />
            <TouchableOpacity 
              onPress={handlePasswordChange}
              className="bg-[#3B82F6] p-4 rounded-2xl items-center"
            >
              <Text className="text-white font-bold">Update Password</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Email Modal */}
      <Modal visible={emailModal} transparent animationType="slide">
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-[#1E293B] rounded-t-[40px] p-8">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-white text-xl font-bold">Update Email</Text>
              <TouchableOpacity onPress={() => setEmailModal(false)}>
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
            </View>
            <View className="mb-6 bg-white/5 p-4 rounded-2xl border border-white/5">
              <Text className="text-slate-500 text-xs font-bold uppercase mb-1">Current Email</Text>
              <Text className="text-white text-base">{user?.email}</Text>
            </View>
            <TextInput 
              placeholder="New Email"
              placeholderTextColor="#64748B"
              value={newEmail}
              onChangeText={setNewEmail}
              className="bg-white/5 border border-white/10 p-4 rounded-2xl text-white mb-4"
            />
            <TextInput 
              placeholder="Confirm with Password"
              placeholderTextColor="#64748B"
              secureTextEntry
              value={emailPass}
              onChangeText={setEmailPass}
              className="bg-white/5 border border-white/10 p-4 rounded-2xl text-white mb-8"
            />
            <TouchableOpacity 
              onPress={handleEmailUpdate}
              className="bg-[#3B82F6] p-4 rounded-2xl items-center"
            >
              <Text className="text-white font-bold">Update Email</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Delete Account Modal */}
      <Modal visible={deleteModal} transparent animationType="slide">
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-[#1E293B] rounded-t-[40px] p-8">
            <View className="flex-row justify-between items-center mb-8">
              <Text className="text-red-500 text-xl font-bold">Delete Account</Text>
              <TouchableOpacity onPress={() => setDeleteModal(false)}>
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
            </View>
            <Text className="text-slate-400 mb-6">To delete your account, please enter your password to confirm.</Text>
            <TextInput 
              placeholder="Your Password"
              placeholderTextColor="#64748B"
              secureTextEntry
              value={deletePass}
              onChangeText={setDeletePass}
              className="bg-white/5 border border-white/10 p-4 rounded-2xl text-white mb-8"
            />
            <TouchableOpacity 
              onPress={handleDeleteAccount}
              className="bg-red-500 p-4 rounded-2xl items-center"
            >
              <Text className="text-white font-bold">Confirm Deletion</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
