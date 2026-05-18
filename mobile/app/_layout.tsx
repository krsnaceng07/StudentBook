import '../global.css';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { View, ActivityIndicator, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useUIStore } from '../store/uiStore';
import { StatusBar } from 'expo-status-bar';

function NavigationGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isStoreInitializing, user } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isStoreInitializing) return;

    const inAuthGroup = segments[0] === '(auth)';
    const isPublicPage = segments[0] === 'forgot-password' || segments[0] === 'reset-password';

    const performNavigation = () => {
      if (!isAuthenticated && !inAuthGroup && !isPublicPage && segments[0] !== 'welcome') {
        router.replace('/welcome');
      } else if (isAuthenticated && user) {
        if (inAuthGroup || !segments.length || segments[0] === 'welcome') {
          if (user.role === 'college') {
            router.replace('/(college)/dashboard' as any);
          } else {
            router.replace('/(student)' as any);
          }
        }
      }
    };

    const timer = setTimeout(performNavigation, 0);
    return () => clearTimeout(timer);
  }, [isAuthenticated, isStoreInitializing, segments, user]);

  return <>{children}</>;
}

export default function RootLayout() {
  const { initializeAuth, isAuthenticated, user } = useAuthStore();
  const [isStoreInitializing, setIsStoreInitializing] = useState(true);
  const { toast, hideToast, isDarkMode } = useUIStore();

  useEffect(() => {
    const initApp = async () => {
      await initializeAuth();
      setIsStoreInitializing(false);
    };
    initApp();
  }, []);

  if (isStoreInitializing || (isAuthenticated && !user)) {
    return (
      <View className={`flex-1 justify-center items-center ${isDarkMode ? 'bg-[#0F172A]' : 'bg-white'}`}>
        <ActivityIndicator size="large" color={isDarkMode ? '#3B82F6' : '#000000'} />
        <Text className={`${isDarkMode ? 'text-slate-500' : 'text-slate-400'} mt-4 font-medium`}>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      <NavigationGuard>
        <Stack screenOptions={{ headerShown: false }} />
      </NavigationGuard>
    </SafeAreaProvider>
  );
}
