import { View, Text, TouchableOpacity } from 'react-native';
import { useAuthStore } from '../../store/authStore';

export default function Profile() { 
  const { logout } = useAuthStore();
  return (
    <View className="flex-1 justify-center items-center">
      <Text className="mb-4">Profile</Text>
      <TouchableOpacity onPress={logout} className="bg-red-500 py-3 px-8 rounded-full">
        <Text className="text-white font-semibold">Logout</Text>
      </TouchableOpacity>
    </View>
  ); 
}
