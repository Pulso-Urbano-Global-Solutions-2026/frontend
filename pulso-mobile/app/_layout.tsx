import { useEffect } from 'react';
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

  // Splash fica até auth E fontes estarem prontos.
  useEffect(() => {
    if (isLoaded && fontsReady) void SplashScreen.hideAsync();
  }, [isLoaded, fontsReady]);

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
    <Stack screenOptions={{ headerStyle: { backgroundColor: Colors.bg }, headerTintColor: Colors.text }}>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="perfil" options={{ title: 'Perfil' }} />
      <Stack.Screen name="detalhes" options={{ title: 'Detalhes' }} />
      <Stack.Screen name="vulnerabilidade" options={{ title: 'Vulnerabilidade' }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutInner />
    </AuthProvider>
  );
}
