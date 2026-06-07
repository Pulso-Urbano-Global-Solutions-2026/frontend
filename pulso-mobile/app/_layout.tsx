import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider, useAuthContext } from '@/contexts/AuthContext';
import { authEvents } from '@/services/authEvents';
import { Colors } from '@/constants/colors';
import { requestPermissions } from '@/services/notificationService';

SplashScreen.preventAutoHideAsync();

function RootLayoutInner() {
  const { isAuthenticated, isLoaded } = useAuthContext();
  const router = useRouter();
  const segments = useSegments();

  // Esconde o splash apenas depois que o SecureStore resolver (evita flash de login).
  useEffect(() => {
    if (isLoaded) SplashScreen.hideAsync();
  }, [isLoaded]);

  // Listener do event bus: interceptor 401 em rota autenticada → login.
  useEffect(() => {
    return authEvents.on('unauthorized', () => router.replace('/(auth)/login'));
  }, [router]);

  // Auth guard bidirecional: aguarda isLoaded para não redirecionar antes da restauração do token.
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
