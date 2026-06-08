import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, FeGaussianBlur, FeMerge, FeMergeNode, Filter } from 'react-native-svg';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import type { ClassificacaoScore } from '@/types/score.types';
import { clampScore, getClassificacaoColor, getClassificacaoLabel } from '@/utils/scoreUtils';

// Criados fora do componente — createAnimatedComponent não pode ser chamado durante render
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface Props { score: number; classificacao: ClassificacaoScore; size?: number; }

export default function ScoreGauge({ score, classificacao, size = 200 }: Props) {
  const clamped   = clampScore(score);
  const color     = getClassificacaoColor(classificacao);
  const radius    = (size - 24) / 2;
  const circumference = 2 * Math.PI * radius;

  // Animação de entrada: 0 → score atual
  const animVal = useRef(new Animated.Value(0)).current;
  // Animação de pulse (batida) contínua após a entrada
  const pulseOpacity = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    Animated.timing(animVal, { toValue: clamped, duration: 800, useNativeDriver: false }).start(() => {
      // Inicia o pulse só após a entrada terminar
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseOpacity, { toValue: 1,    duration: 1100, useNativeDriver: true }),
          Animated.timing(pulseOpacity, { toValue: 0.85, duration: 1100, useNativeDriver: true }),
        ])
      ).start();
    });
  }, [clamped, animVal, pulseOpacity]);

  const strokeDashoffset = animVal.interpolate({
    inputRange:  [0, 100],
    outputRange: [circumference, 0],
  });

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <Defs>
          {/* Glow suave no arco colorido — mesmo efeito do logo no ECG trace */}
          <Filter id="arcGlow" x="-30%" y="-30%" width="160%" height="160%">
            <FeGaussianBlur in="SourceGraphic" stdDeviation="3" result="b" />
            <FeMerge>
              <FeMergeNode in="b" />
              <FeMergeNode in="SourceGraphic" />
            </FeMerge>
          </Filter>
        </Defs>
        {/* Track (fundo do arco) */}
        <Circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke={Colors.surface2} strokeWidth={12} fill="none"
        />
        {/* Arco animado com glow */}
        <AnimatedCircle
          cx={size / 2} cy={size / 2} r={radius}
          stroke={color} strokeWidth={12} fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90" originX={size / 2} originY={size / 2}
          filter="url(#arcGlow)"
          opacity={pulseOpacity}
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
  center:    { flex: 1, alignItems: 'center', justifyContent: 'center' },
  score:     {
    fontFamily: Typography.font.heading,
    fontSize:   Typography.size.xxl,
  },
  label:     {
    fontFamily: Typography.font.body,
    fontSize:   Typography.size.sm,
    color:      Colors.textMuted,
    marginTop:  4,
  },
});
