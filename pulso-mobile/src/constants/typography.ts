export const Typography = {
  size: { xs: 12, sm: 14, md: 16, lg: 20, xl: 28, xxl: 40, display: 64 },
  weight: { regular: '400', medium: '500', semibold: '600', bold: '700' },
  lineHeight: { tight: 1.1, normal: 1.4, relaxed: 1.6 },
  // Brand fonts (loaded via @expo-google-fonts in _layout.tsx)
  font: {
    heading: 'SpaceGrotesk_700Bold',
    subheading: 'SpaceGrotesk_600SemiBold',
    body: 'SpaceGrotesk_400Regular',
    mono: 'JetBrainsMono_500Medium',
    monoRegular: 'JetBrainsMono_400Regular',
  },
} as const;
