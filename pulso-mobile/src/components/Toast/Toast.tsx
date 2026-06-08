import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';

type ToastVariant = 'success' | 'info' | 'warning' | 'error';

interface ToastProps {
  message: string;
  variant?: ToastVariant;
  visible: boolean;
  /** duração em ms antes de sumir automaticamente (default 2500) */
  duration?: number;
  onHide?: () => void;
}

const BORDER_COLOR: Record<ToastVariant, string> = {
  success: Colors.bom,
  info:    Colors.cyan,
  warning: Colors.moderado,
  error:   Colors.critico,
};
const TEXT_COLOR: Record<ToastVariant, string> = {
  success: Colors.bom,
  info:    Colors.cyan,
  warning: Colors.moderado,
  error:   Colors.critico,
};

export function Toast({ message, variant = 'info', visible, duration = 2500, onHide }: ToastProps) {
  const translateY = useRef(new Animated.Value(60)).current;
  const opacity    = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;

    // Slide-up + fade-in
    Animated.parallel([
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true, speed: 20, bounciness: 6 }),
      Animated.timing(opacity,    { toValue: 1, duration: 180, useNativeDriver: true }),
    ]).start();

    const timer = setTimeout(() => {
      // Fade-out + slide-down
      Animated.parallel([
        Animated.timing(translateY, { toValue: 60, duration: 220, useNativeDriver: true }),
        Animated.timing(opacity,    { toValue: 0,  duration: 220, useNativeDriver: true }),
      ]).start(() => onHide?.());
    }, duration);

    return () => clearTimeout(timer);
  }, [visible, duration, translateY, opacity, onHide]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        { borderColor: BORDER_COLOR[variant], opacity, transform: [{ translateY }] },
      ]}
      accessibilityLiveRegion="polite"
      accessibilityRole="alert"
    >
      <Text style={[styles.message, { color: TEXT_COLOR[variant] }]}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 32,
    left: 24,
    right: 24,
    backgroundColor: 'rgba(13,16,26,0.96)',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 18,
    alignItems: 'center',
    zIndex: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  message: {
    fontFamily: Typography.font.body,
    fontSize:   Typography.size.sm,
    textAlign:  'center',
    lineHeight: 20,
  },
});
