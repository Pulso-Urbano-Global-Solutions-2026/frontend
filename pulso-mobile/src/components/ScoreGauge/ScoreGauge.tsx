import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import type { ClassificacaoScore } from '@/types/score.types';
import { clampScore, getClassificacaoColor, getClassificacaoLabel } from '@/utils/scoreUtils';

interface Props { score: number; classificacao: ClassificacaoScore; size?: number; }

export default function ScoreGauge({ score, classificacao, size = 200 }: Props) {
  const clamped = clampScore(score);
  const color = getClassificacaoColor(classificacao);
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const animVal = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animVal, { toValue: clamped, duration: 800, useNativeDriver: false }).start();
  }, [clamped, animVal]);

  const strokeDashoffset = animVal.interpolate({
    inputRange: [0, 100],
    outputRange: [circumference, 0],
  });

  const AnimatedCircle = Animated.createAnimatedComponent(Circle);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <Circle cx={size / 2} cy={size / 2} r={radius} stroke={Colors.surface2} strokeWidth={12} fill="none" />
        <AnimatedCircle
          cx={size / 2} cy={size / 2} r={radius}
          stroke={color} strokeWidth={12} fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90" originX={size / 2} originY={size / 2}
        />
      </Svg>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <View style={styles.center}>
          <Text style={[styles.score, { color }]}>{Math.round(clamped)}</Text>
          <Text style={styles.label}>{getClassificacaoLabel(classificacao)}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  score: { fontSize: Typography.size.xxl, fontWeight: Typography.weight.bold },
  label: { fontSize: Typography.size.sm, color: Colors.textMuted, marginTop: 4 },
});
