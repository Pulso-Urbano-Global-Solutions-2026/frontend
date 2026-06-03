import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider, useAuthContext } from '@/contexts/AuthContext';
import { authEvents } from '@/services/authEvents';
import { Colors } from '@/constants/colors';

SplashScreen.preventAutoHideAsync();

function RootLayoutInner() {
  const { isAuthenticated } = useAuthContext();
  const router = useRouter();
  const segments = useSegments();

  // Listener do event bus: interceptor 401 → navegar para login.
  useEffect(() => {
    return authEvents.on('unauthorized', () => router.replace('/(auth)/login'));
  }, [router]);

  // Auth guard: se não autenticado e fora da rota auth, redirecionar.
  useEffect(() => {
    const inAuth = segments[0] === '(auth)';
    if (!isAuthenticated && !inAuth) router.replace('/(auth)/login');
  }, [isAuthenticated, segments, router]);

  useEffect(() => { SplashScreen.hideAsync(); }, []);

  return (
    <Stack screenOptions={{ headerStyle: { backgroundColor: Colors.bg }, headerTintColor: Colors.text }}>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="perfil" options={{ title: 'Perfil' }} />
      <Stack.Screen name="detalhes" options={{ title: 'Detalhes' }} />
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
