import '../global.css';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useProfileStore } from '../store/profileStore';
import { useChatStore } from '../store/chatStore';
import { View, ActivityIndicator, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from '../components/Toast';
import { useUIStore } from '../store/uiStore';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  const { initializeAuth, isAuthenticated, token, user, isLoading: isAuthLoading } = useAuthStore();
  const { fetchProfile, profile, isProfileLoaded } = useProfileStore();
  const { initSocket, disconnectSocket } = useChatStore();
  const [isStoreInitializing, setIsStoreInitializing] = useState(true);
  const segments = useSegments();
  const router = useRouter();
  const { toast, hideToast, isDarkMode } = useUIStore();

  // 1. Initial State Load (Token & User)
  useEffect(() => {
    const initApp = async () => {
      await initializeAuth();
      setIsStoreInitializing(false);
    };
    initApp();
  }, []);

  // 2. Profile Load (Dependent on Auth)
  useEffect(() => {
    if (isStoreInitializing) return;

    if (isAuthenticated && !isProfileLoaded) {
      fetchProfile();
    }
  }, [isAuthenticated, isStoreInitializing, isProfileLoaded]);

  // 3. Socket Lifecycle
  useEffect(() => {
    const userId = user?._id || user?.id;
    if (isAuthenticated && userId) {
      initSocket(userId);
    } else if (!isAuthenticated) {
      disconnectSocket();
    }
  }, [isAuthenticated, user?._id, user?.id]);

  // 4. Navigation Decision Engine
  useEffect(() => {
    // Wait until the stores have finished their initial local storage / profile checks
    if (isStoreInitializing) return;
    if (isAuthenticated && !isProfileLoaded) return;

    const inAuthGroup = segments[0] === '(auth)';
    const isPublicPage = segments[0] === 'forgot-password' || segments[0] === 'reset-password';
    const inProfileGroup = segments[0] === 'profile';

    if (!isAuthenticated && !inAuthGroup && !isPublicPage && segments[0] !== 'welcome') {
      // Not logged in and not on a public page, go to welcome
      router.replace('/welcome');
    } else if (isAuthenticated && isProfileLoaded) {
      if (!profile && !inProfileGroup) {
        // Server says no profile, go to setup
        router.replace('/profile/setup');
      } else if (profile && (inAuthGroup || !segments.length || segments[0] === 'profile')) {
        // Server says profile exists, ensure we are in tabs
        if (inAuthGroup || !segments.length) {
          router.replace('/(tabs)');
        }
      }
    }
  }, [isAuthenticated, profile, isProfileLoaded, isStoreInitializing, segments]);

  // Global Loading State
  if (isStoreInitializing || (isAuthenticated && !isProfileLoaded)) {
    return (
      <View className={`flex-1 justify-center items-center ${isDarkMode ? 'bg-[#0F172A]' : 'bg-white'}`}>
        <ActivityIndicator size="large" color={isDarkMode ? '#3B82F6' : '#000000'} />
        <Text className={`${isDarkMode ? 'text-slate-500' : 'text-slate-400'} mt-4 font-medium`}>Synchronizing Secure Session...</Text>
      </View>
    );
  }

  // Global Auth Guard: Prevent rendering protected Slot if not authenticated
  // and not in an auth route. This stops 401s from background fetches.
  const inAuthGroup = segments[0] === '(auth)';
  const isPublicPage = segments[0] === 'forgot-password' || segments[0] === 'reset-password';
  
  if (!isAuthenticated && !inAuthGroup && !isPublicPage) {
    return <View className={`flex-1 ${isDarkMode ? 'bg-[#0F172A]' : 'bg-white'}`} />;
  }


  return (
    <SafeAreaProvider>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }} />
      <Toast 
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onHide={hideToast}
      />
    </SafeAreaProvider>
  );
}
