import { useEffect, useRef } from 'react';
import { Animated, Text, View } from 'react-native';
import Svg, {
  Circle,
  ClipPath,
  Defs,
  FeGaussianBlur,
  FeMerge,
  FeMergeNode,
  Filter,
  G,
  LinearGradient,
  Path,
  Rect,
  Stop,
} from 'react-native-svg';
import { Typography } from '@/constants/typography';

// Criado fora do componente para evitar recriação a cada render
const AnimatedPath = Animated.createAnimatedComponent(Path);

interface LogoProps {
  size?: number;
  animated?: boolean;
}

// SVG logo: coração com ECG trace e skyline — baseado em logo.svg
function LogoSvg({ size, pulseOpacity }: { size: number; pulseOpacity: Animated.Value | null }) {

  return (
    <Svg viewBox="0 0 200 200" width={size} height={size}>
      <Defs>
        {/* Glow suave no ECG trace */}
        <Filter id="ga" x="-40%" y="-40%" width="180%" height="180%">
          <FeGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="b" />
          <FeMerge>
            <FeMergeNode in="b" />
            <FeMergeNode in="SourceGraphic" />
          </FeMerge>
        </Filter>
        {/* Glow forte no outline do coração */}
        <Filter id="gb" x="-50%" y="-50%" width="200%" height="200%">
          <FeGaussianBlur in="SourceGraphic" stdDeviation="5" result="b" />
          <FeMerge>
            <FeMergeNode in="b" />
            <FeMergeNode in="SourceGraphic" />
          </FeMerge>
        </Filter>
        {/* Clip: formato coração */}
        <ClipPath id="hc">
          <Path d="M100 168C62 144 24 114 24 80C24 50 44 32 68 32C81 32 93 39 100 50C107 39 119 32 132 32C156 32 176 50 176 80C176 114 138 144 100 168Z" />
        </ClipPath>
        {/* Gradiente skyline (verde) */}
        <LinearGradient id="bgr" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#3ddc84" stopOpacity={0.9} />
          <Stop offset="60%" stopColor="#3ddc84" stopOpacity={0.5} />
          <Stop offset="100%" stopColor="#3ddc84" stopOpacity={0.12} />
        </LinearGradient>
        {/* Gradiente outline coração cyan→green */}
        <LinearGradient id="sgr" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="#22d3ee" />
          <Stop offset="100%" stopColor="#3ddc84" />
        </LinearGradient>
        {/* Gradiente céu dentro do coração */}
        <LinearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#22d3ee" stopOpacity={0.1} />
          <Stop offset="100%" stopColor="#0a0e1a" stopOpacity={0} />
        </LinearGradient>
      </Defs>

      {/* Fundo quadrado com cantos arredondados */}
      <Rect width="200" height="200" rx="32" fill="#0a0e1a" />

      {/* Conteúdo clippado no coração */}
      <G clipPath="url(#hc)">
        <Rect width="200" height="200" fill="#0c1220" />
        <Rect width="200" height="200" fill="url(#sky)" />
        {/* Skyline */}
        <Rect x="26"  y="122" width="12" height="50" rx="1" fill="url(#bgr)" />
        <Rect x="40"  y="104" width="10" height="68" rx="1" fill="url(#bgr)" />
        <Rect x="52"  y="114" width="11" height="58" rx="1" fill="url(#bgr)" />
        <Rect x="65"  y="96"  width="11" height="76" rx="1" fill="url(#bgr)" />
        <Rect x="78"  y="108" width="13" height="64" rx="1" fill="url(#bgr)" />
        <Rect x="93"  y="100" width="11" height="72" rx="1" fill="url(#bgr)" />
        <Rect x="106" y="88"  width="12" height="84" rx="1" fill="url(#bgr)" />
        <Rect x="120" y="102" width="10" height="70" rx="1" fill="url(#bgr)" />
        <Rect x="132" y="110" width="12" height="62" rx="1" fill="url(#bgr)" />
        <Rect x="146" y="98"  width="11" height="74" rx="1" fill="url(#bgr)" />
        <Rect x="159" y="118" width="13" height="54" rx="1" fill="url(#bgr)" />
        {/* ECG trace com glow */}
        <Path
          d="M24 97 L50 97 L58 117 L75 53 L83 97 L100 97 L109 117 L126 53 L134 97 L176 97"
          stroke="#22d3ee"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#ga)"
        />
        {/* Picos do ECG */}
        <Circle cx="75"  cy="53" r="3" fill="#22d3ee" filter="url(#ga)" />
        <Circle cx="126" cy="53" r="3" fill="#22d3ee" filter="url(#ga)" />
      </G>

      {/* Outline do coração com glow — animado quando animated=true */}
      {pulseOpacity ? (
        <AnimatedPath
          d="M100 168C62 144 24 114 24 80C24 50 44 32 68 32C81 32 93 39 100 50C107 39 119 32 132 32C156 32 176 50 176 80C176 114 138 144 100 168Z"
          fill="none"
          stroke="url(#sgr)"
          strokeWidth="2.5"
          filter="url(#gb)"
          opacity={pulseOpacity}
        />
      ) : (
        <Path
          d="M100 168C62 144 24 114 24 80C24 50 44 32 68 32C81 32 93 39 100 50C107 39 119 32 132 32C156 32 176 50 176 80C176 114 138 144 100 168Z"
          fill="none"
          stroke="url(#sgr)"
          strokeWidth="2.5"
          filter="url(#gb)"
        />
      )}
    </Svg>
  );
}

export function Logo({ size = 48, animated = false }: LogoProps) {
  const pulseOpacity = useRef(new Animated.Value(0.75)).current;

  useEffect(() => {
    if (!animated) return;
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseOpacity, { toValue: 1, duration: 1100, useNativeDriver: true }),
        Animated.timing(pulseOpacity, { toValue: 0.75, duration: 1100, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [animated, pulseOpacity]);

  return <LogoSvg size={size} pulseOpacity={animated ? pulseOpacity : null} />;
}

// Wordmark: ícone + "PULSO" / "URBANO" alinhados verticalmente
export function LogoWordmark({ size = 48, animated = false }: LogoProps) {
  const textSize = size * 0.38;
  const subSize  = size * 0.32;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: size * 0.18 }}>
      <Logo size={size} animated={animated} />
      <View style={{ flexDirection: 'column', justifyContent: 'center' }}>
        <Text
          style={{
            fontFamily: Typography.font.heading,
            fontSize: textSize,
            color: '#f0f0ed',
            letterSpacing: textSize * 0.09,
            lineHeight: textSize * 1.1,
          }}
        >
          PULSO
        </Text>
        <Text
          style={{
            fontFamily: Typography.font.body,
            fontSize: subSize,
            color: '#22d3ee',
            letterSpacing: subSize * 0.22,
            lineHeight: subSize * 1.1,
          }}
        >
          URBANO
        </Text>
      </View>
    </View>
  );
}
