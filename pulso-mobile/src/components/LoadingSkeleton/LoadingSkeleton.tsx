import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, type ViewStyle } from 'react-native';
import { Colors } from '@/constants/colors';

interface Props { rows?: number; style?: ViewStyle; }

export default function LoadingSkeleton({ rows = 3, style }: Props) {
  const anim = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0.4, duration: 500, useNativeDriver: true }),
      ])
    ).start();
  }, [anim]);
  return (
    <View style={style}>
      {Array.from({ length: rows }).map((_, i) => (
        <Animated.View key={i} style={[styles.row, { opacity: anim, width: i % 2 === 0 ? '100%' : '70%' }]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { height: 20, backgroundColor: Colors.surface2, borderRadius: 6, marginBottom: 12 },
});
