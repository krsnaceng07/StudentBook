import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../../store/authStore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUIStore } from '../../../store/uiStore';

export default function CollegeSignupScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [collegeName, setCollegeName] = useState('');
  const [collegeType, setCollegeType] = useState('university');
  const [location, setLocation] = useState('');
  const [contactEmail, setContactEmail] = useState('');

  const { registerCollege, isLoading, error } = useAuthStore();
  const { isDarkMode } = useUIStore();
  const router = useRouter();

  const handleSignup = async () => {
    if (!collegeName || !email || !password || !location) {
      return Alert.alert('Required Fields', 'Please fill in the essential college details to register.');
    }
    
    const res = await registerCollege({
      email,
      password,
      college_name: collegeName,
      college_type: collegeType,
      location,
      contact_email: contactEmail || email
    });

    if (res.success) {
      Alert.alert(
        'Welcome onboard!', 
        'Your college profile has been initialized. Our team will verify your details soon.',
        [{ text: 'Login Now', onPress: () => router.replace('/(auth)/college/login') }]
      );
    } else {
      Alert.alert('Registration Failed', res.error || 'Something went wrong.');
    }
  };

  const InputField = ({ label, value, onChangeText, placeholder, ...props }) => (
    <View className={`rounded-xl border px-4 py-3 mb-4 ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
      <Text className={`text-xs uppercase mb-1 font-semibold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{label}</Text>
      <TextInput
        className={`text-base ${isDarkMode ? 'text-white' : 'text-slate-900'}`}
        placeholder={placeholder}
        placeholderTextColor={isDarkMode ? '#94A3B8' : '#64748B'}
        value={value}
        onChangeText={onChangeText}
        {...props}
      />
    </View>
  );

  return (
    <SafeAreaView className={`flex-1 ${isDarkMode ? 'bg-[#0F172A]' : 'bg-white'}`}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingTop: 40 }}>
          <View className="mb-10">
            <Text className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>College Registration</Text>
            <Text className={`mt-2 text-base ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Showcase your institution to the builder community</Text>
          </View>

          <View className="space-y-4">
            {error && <Text className="text-red-400 text-center mb-4">{error}</Text>}
            
            <InputField label="Institution Name" value={collegeName} onChangeText={setCollegeName} placeholder="Global Institute of Tech" />
            <InputField label="Admin Email" value={email} onChangeText={setEmail} placeholder="admin@institute.edu" keyboardType="email-address" autoCapitalize="none" />
            <InputField label="Password" value={password} onChangeText={setPassword} placeholder="••••••••" secureTextEntry />
            <InputField label="Location" value={location} onChangeText={setLocation} placeholder="City, Country" />
            <InputField label="Public Contact Email" value={contactEmail} onChangeText={setContactEmail} placeholder="info@institute.edu" keyboardType="email-address" />
            
            <View className={`rounded-xl border px-4 py-3 mb-4 ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
              <Text className={`text-xs uppercase mb-1 font-semibold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Institution Type</Text>
              <View className="flex-row flex-wrap mt-2">
                {['university', 'engineering', 'management', 'polytechnic'].map((t) => (
                  <TouchableOpacity 
                    key={t}
                    onPress={() => setCollegeType(t)}
                    className={`px-4 py-2 rounded-lg mr-2 mb-2 ${collegeType === t ? 'bg-indigo-600' : (isDarkMode ? 'bg-white/10' : 'bg-slate-200')}`}
                  >
                    <Text className={`text-xs font-bold capitalize ${collegeType === t ? 'text-white' : (isDarkMode ? 'text-slate-300' : 'text-slate-700')}`}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity onPress={handleSignup} disabled={isLoading} className="bg-indigo-600 rounded-xl py-4 mt-6 items-center shadow-lg shadow-indigo-600/30">
              {isLoading ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-lg">Register Institution</Text>}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.replace('/(auth)/college/login')} className="mt-6 mb-12">
              <Text className={`text-center text-base ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Already registered? <Text className="text-indigo-500 font-bold">Login</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
