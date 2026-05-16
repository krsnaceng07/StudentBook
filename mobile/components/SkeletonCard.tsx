import React from 'react';
import { View, Animated } from 'react-native';
import useUIStore from '../store/uiStore';

export default function SkeletonCard() {
  const animatedValue = new Animated.Value(0);

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  const { isDarkMode } = useUIStore();
  
  const baseColor = isDarkMode ? 'bg-white/10' : 'bg-slate-700';
  const darkerColor = isDarkMode ? 'bg-white/5' : 'bg-slate-800';

  return (
    <View className={`${isDarkMode ? 'bg-white/5' : 'bg-white/5'} rounded-2xl border border-white/10 p-5 mb-4 overflow-hidden`}>
      <View className="flex-row items-center mb-4">
        {/* Avatar Skeleton */}
        <Animated.View style={{ opacity }} className={`h-16 w-16 ${baseColor} rounded-full`} />
        <View className="ml-4 flex-1">
          {/* Name Skeleton */}
          <Animated.View style={{ opacity }} className={`h-5 w-32 ${baseColor} rounded-md mb-2`} />
          {/* Field Skeleton */}
          <Animated.View style={{ opacity }} className={`h-4 w-48 ${darkerColor} rounded-md`} />
        </View>
      </View>

      {/* Bio Skeleton */}
      <Animated.View style={{ opacity }} className={`h-3 w-full ${darkerColor} rounded-md mb-2`} />
      <Animated.View style={{ opacity }} className={`h-3 w-2/3 ${darkerColor} rounded-md mb-6`} />

      {/* Tags Skeleton */}
      <View className="flex-row gap-2 mb-6">
        <Animated.View style={{ opacity }} className={`h-6 w-16 ${darkerColor} rounded-full`} />
        <Animated.View style={{ opacity }} className={`h-6 w-20 ${darkerColor} rounded-full`} />
        <Animated.View style={{ opacity }} className={`h-6 w-14 ${darkerColor} rounded-full`} />
      </View>

      {/* Button Skeleton */}
      <Animated.View style={{ opacity }} className={`h-12 w-full ${baseColor} rounded-xl`} />
    </View>
  );
}
