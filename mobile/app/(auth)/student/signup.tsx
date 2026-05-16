import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../../store/authStore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUIStore } from '../../../store/uiStore';

export default function StudentSignupScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [collegeName, setCollegeName] = useState('');
  const [department, setDepartment] = useState('');
  const [year, setYear] = useState('1st');

  const { registerStudent, isLoading, error } = useAuthStore();
  const { isDarkMode } = useUIStore();
  const router = useRouter();

  const handleSignup = async () => {
    if (!fullName || !email || !password || !collegeName) {
      return Alert.alert('Required Fields', 'Please fill in all essential fields to continue.');
    }
    
    const res = await registerStudent({
      email,
      password,
      full_name: fullName,
      college_name: collegeName,
      department,
      year
    });

    if (res.success) {
      Alert.alert(
        'Welcome!', 
        'Your student account has been created successfully.',
        [{ text: 'Login Now', onPress: () => router.replace('/(auth)/student/login') }]
      );
    } else {
      Alert.alert('Signup Failed', res.error || 'Something went wrong.');
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
            <Text className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Student Signup</Text>
            <Text className={`mt-2 text-base ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Start your builder journey today</Text>
          </View>

          <View className="space-y-4">
            {error && <Text className="text-red-400 text-center mb-4">{error}</Text>}
            
            <InputField label="Full Name" value={fullName} onChangeText={setFullName} placeholder="John Doe" />
            <InputField label="Email" value={email} onChangeText={setEmail} placeholder="john@university.edu" keyboardType="email-address" autoCapitalize="none" />
            <InputField label="Password" value={password} onChangeText={setPassword} placeholder="••••••••" secureTextEntry />
            <InputField label="College Name" value={collegeName} onChangeText={setCollegeName} placeholder="University of Technology" />
            <InputField label="Department" value={department} onChangeText={setDepartment} placeholder="Computer Science" />
            
            <View className={`rounded-xl border px-4 py-3 mb-4 ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
              <Text className={`text-xs uppercase mb-1 font-semibold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Year of Study</Text>
              <View className="flex-row justify-between mt-2">
                {['1st', '2nd', '3rd', '4th', 'Graduate'].map((y) => (
                  <TouchableOpacity 
                    key={y}
                    onPress={() => setYear(y)}
                    className={`px-3 py-2 rounded-lg ${year === y ? 'bg-blue-600' : (isDarkMode ? 'bg-white/10' : 'bg-slate-200')}`}
                  >
                    <Text className={`text-xs font-bold ${year === y ? 'text-white' : (isDarkMode ? 'text-slate-300' : 'text-slate-700')}`}>{y}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity onPress={handleSignup} disabled={isLoading} className="bg-blue-600 rounded-xl py-4 mt-6 items-center shadow-lg shadow-blue-600/30">
              {isLoading ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-lg">Create Student Account</Text>}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.replace('/(auth)/student/login')} className="mt-6 mb-12">
              <Text className={`text-center text-base ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Already a student? <Text className="text-blue-500 font-bold">Login</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
