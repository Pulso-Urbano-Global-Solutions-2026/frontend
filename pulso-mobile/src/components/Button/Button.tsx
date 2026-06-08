import { useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  Pressable,
  StyleSheet,
  Text,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';
type Size    = 'sm' | 'md' | 'lg';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
}

const BG: Record<Variant, string> = {
  primary:   Colors.cyan,
  secondary: Colors.surface,
  danger:    Colors.criticoDim,
  ghost:     'transparent',
};
const BORDER: Record<Variant, string> = {
  primary:   Colors.cyan,
  secondary: Colors.border,
  danger:    Colors.critico,
  ghost:     'transparent',
};
const TEXT_COLOR: Record<Variant, string> = {
  primary:   '#041e26',   // escuro sobre cyan
  secondary: Colors.text,
  danger:    Colors.critico,
  ghost:     Colors.cyan,
};
const INDICATOR_COLOR: Record<Variant, string> = {
  primary:   '#041e26',
  secondary: Colors.text,
  danger:    Colors.critico,
  ghost:     Colors.cyan,
};

const PADDING_V: Record<Size, number> = { sm: 8, md: 13, lg: 16 };
const FONT_SIZE: Record<Size, number>  = {
  sm: Typography.size.sm,
  md: Typography.size.sm,
  lg: Typography.size.md,
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
}: ButtonProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () =>
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 50 }).start();

  const onPressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 50 }).start();

  const containerStyle: ViewStyle = {
    backgroundColor: BG[variant],
    borderColor:     BORDER[variant],
    borderWidth:     1,
    borderRadius:    12,
    paddingVertical: PADDING_V[size],
    paddingHorizontal: size === 'sm' ? 14 : 22,
    alignItems:      'center',
    justifyContent:  'center',
    opacity:         disabled ? 0.4 : 1,
  };
  const labelStyle: TextStyle = {
    fontFamily: Typography.font.subheading,
    fontSize:   FONT_SIZE[size],
    color:      TEXT_COLOR[variant],
    letterSpacing: 0.3,
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        style={[styles.base, containerStyle]}
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        disabled={disabled || loading}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled: disabled || loading, busy: loading }}
      >
        {loading
          ? <ActivityIndicator size="small" color={INDICATOR_COLOR[variant]} />
          : <Text style={labelStyle}>{label}</Text>
        }
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: { flexDirection: 'row' },
});
