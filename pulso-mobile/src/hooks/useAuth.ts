import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuthContext } from '@/contexts/AuthContext';

export { useAuthContext as useAuth };

// Garante que a tela só renderiza se o usuário estiver autenticado.
export function useRequireAuth() {
  const auth = useAuthContext();
  const router = useRouter();
  useEffect(() => {
    if (!auth.isAuthenticated) router.replace('/(auth)/login');
  }, [auth.isAuthenticated, router]);
  return auth;
}
