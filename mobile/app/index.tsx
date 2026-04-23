import { Redirect } from 'expo-router';

export default function Index() {
  // Navigation handles where this goes based on _layout.tsx context listeners.
  // We simply put a placeholder redirect so the router has a valid index.
  return <Redirect href="/(tabs)" />;
}
