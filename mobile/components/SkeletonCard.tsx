import React from 'react';
import { View, Animated } from 'react-native';

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

  return (
    <View className="bg-white/5 rounded-2xl border border-white/10 p-5 mb-4 overflow-hidden">
      <View className="flex-row items-center mb-4">
        {/* Avatar Skeleton */}
        <Animated.View style={{ opacity }} className="h-16 w-16 bg-slate-700 rounded-full" />
        <View className="ml-4 flex-1">
          {/* Name Skeleton */}
          <Animated.View style={{ opacity }} className="h-5 w-32 bg-slate-700 rounded-md mb-2" />
          {/* Field Skeleton */}
          <Animated.View style={{ opacity }} className="h-4 w-48 bg-slate-800 rounded-md" />
        </View>
      </View>

      {/* Bio Skeleton */}
      <Animated.View style={{ opacity }} className="h-3 w-full bg-slate-800 rounded-md mb-2" />
      <Animated.View style={{ opacity }} className="h-3 w-2/3 bg-slate-800 rounded-md mb-6" />

      {/* Tags Skeleton */}
      <View className="flex-row gap-2 mb-6">
        <Animated.View style={{ opacity }} className="h-6 w-16 bg-slate-800 rounded-full" />
        <Animated.View style={{ opacity }} className="h-6 w-20 bg-slate-800 rounded-full" />
        <Animated.View style={{ opacity }} className="h-6 w-14 bg-slate-800 rounded-full" />
      </View>

      {/* Button Skeleton */}
      <Animated.View style={{ opacity }} className="h-12 w-full bg-slate-700 rounded-xl" />
    </View>
  );
}
