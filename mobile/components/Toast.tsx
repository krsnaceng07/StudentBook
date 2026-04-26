import React, { useEffect, useState } from 'react';
import { View, Text, Animated, StyleSheet, Dimensions, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  visible: boolean;
  onHide: () => void;
  duration?: number;
}

const { width } = Dimensions.get('window');

const Toast = ({ message, type = 'info', visible, onHide, duration = 4000 }: ToastProps) => {
  const [animation] = useState(new Animated.Value(-100));

  useEffect(() => {
    if (visible) {
      Animated.spring(animation, {
        toValue: Platform.OS === 'ios' ? 50 : 20,
        useNativeDriver: true,
        bounciness: 10,
      }).start();

      const timer = setTimeout(() => {
        hideToast();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const hideToast = () => {
    Animated.timing(animation, {
      toValue: -150,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onHide();
    });
  };

  if (!visible && animation._value === -150) return null;

  const getBackgroundColor = () => {
    switch (type) {
      case 'success': return '#10B981';
      case 'error': return '#EF4444';
      case 'warning': return '#F59E0B';
      default: return '#3B82F6';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success': return 'checkmark-circle';
      case 'error': return 'alert-circle';
      case 'warning': return 'warning';
      default: return 'information-circle';
    }
  };

  return (
    <Animated.View 
      style={[
        styles.container, 
        { 
          backgroundColor: getBackgroundColor(),
          transform: [{ translateY: animation }]
        }
      ]}
    >
      <View className="flex-row items-center px-4 py-3">
        <Ionicons name={getIcon()} size={24} color="white" />
        <View className="ml-3 flex-1">
          <Text className="text-white font-bold text-sm">{message}</Text>
        </View>
        <TouchableOpacity onPress={hideToast}>
          <Ionicons name="close" size={20} color="white" opacity={0.7} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

import { TouchableOpacity } from 'react-native';

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    zIndex: 9999,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
});

export default Toast;
