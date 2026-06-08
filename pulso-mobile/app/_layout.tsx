import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import {
  SpaceGrotesk_400Regular,
  SpaceGrotesk_600SemiBold,
  SpaceGrotesk_700Bold,
  useFonts as useSpaceFonts,
} from '@expo-google-fonts/space-grotesk';
import {
  JetBrainsMono_400Regular,
  JetBrainsMono_500Medium,
  useFonts as useMonoFonts,
} from '@expo-google-fonts/jetbrains-mono';
import { AuthProvider, useAuthContext } from '@/contexts/AuthContext';
import { authEvents } from '@/services/authEvents';
import { Colors } from '@/constants/colors';
import { Logo } from '@/components/Logo/Logo';
import { requestPermissions } from '@/services/notificationService';

SplashScreen.preventAutoHideAsync();

function RootLayoutInner() {
  const { isAuthenticated, isLoaded } = useAuthContext();
  const router = useRouter();
  const segments = useSegments();

  const [spaceLoaded] = useSpaceFonts({
    SpaceGrotesk_400Regular,
    SpaceGrotesk_600SemiBold,
    SpaceGrotesk_700Bold,
  });
  const [monoLoaded] = useMonoFonts({
    JetBrainsMono_400Regular,
    JetBrainsMono_500Medium,
  });

  const fontsReady = spaceLoaded && monoLoaded;

  // Animated intro overlay: native splash → 1.2s logo animation → content
  const [introVisible, setIntroVisible] = useState(true);
  const introOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!isLoaded || !fontsReady) return;
    // Show RN content, hide native splash, then fade out our logo overlay
    void SplashScreen.hideAsync();
    const timer = setTimeout(() => {
      Animated.timing(introOpacity, {
        toValue: 0, duration: 400, useNativeDriver: true,
      }).start(() => setIntroVisible(false));
    }, 1200);
    return () => clearTimeout(timer);
  }, [isLoaded, fontsReady, introOpacity]);

  useEffect(() => {
    return authEvents.on('unauthorized', () => router.replace('/(auth)/login'));
  }, [router]);

  useEffect(() => {
    if (!isLoaded) return;
    const inAuth = segments[0] === '(auth)';
    if (!isAuthenticated && !inAuth) router.replace('/(auth)/login');
    if (isAuthenticated && inAuth) router.replace('/(tabs)');
  }, [isAuthenticated, isLoaded, segments, router]);

  useEffect(() => {
    void requestPermissions();
  }, []);

  return (
    <View style={styles.root}>
      <Stack screenOptions={{ headerStyle: { backgroundColor: Colors.bg }, headerTintColor: Colors.text }}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="perfil" options={{ title: 'Perfil' }} />
        <Stack.Screen name="detalhes" options={{ title: 'Detalhes' }} />
        <Stack.Screen name="vulnerabilidade" options={{ title: 'Vulnerabilidade' }} />
      </Stack>

      {/* Animated logo overlay: bridges native splash to live content */}
      {introVisible && (
        <Animated.View style={[styles.intro, { opacity: introOpacity }]} pointerEvents="none">
          <Logo animated size={72} />
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root:  { flex: 1 },
  intro: {
    ...StyleSheet.absoluteFill,
    backgroundColor: Colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutInner />
    </AuthProvider>
  );
}
