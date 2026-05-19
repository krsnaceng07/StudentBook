import { Stack } from 'expo-router';

export default function SettingsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="password" />
      <Stack.Screen name="email" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="privacy" />
      <Stack.Screen name="appearance" />
      <Stack.Screen name="help" />
      <Stack.Screen name="feedback" />
    </Stack>
  );
}
