import React, { createContext, useContext, useEffect, useState } from 'react';
import * as authService from '@/services/authService';
import { getToken, removeToken } from '@/services/secureStore';
import type { AuthRequest, UsuarioCreate } from '@/types/usuario.types';
import { getUserIdFromToken, isExpired } from '@/utils/tokenUtils';

interface AuthContextType {
  token: string | null;
  userId: number | null;
  isAuthenticated: boolean;
  login(credentials: AuthRequest): Promise<void>;
  register(data: UsuarioCreate): Promise<void>;
  logout(): Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      const saved = await getToken();
      if (saved && !isExpired(saved)) {
        setToken(saved);
        setUserId(getUserIdFromToken(saved));
      } else if (saved) {
        await removeToken();
      }
    })();
  }, []);

  const login = async (credentials: AuthRequest) => {
    const res = await authService.login(credentials);
    setToken(res.token);
    setUserId(getUserIdFromToken(res.token));
  };

  const register = async (data: UsuarioCreate) => {
    await authService.register(data);
    // auto-login após registro
    const res = await authService.login({ email: data.email, senha: data.senha });
    setToken(res.token);
    setUserId(getUserIdFromToken(res.token));
  };

  const logout = async () => {
    await authService.logout();
    setToken(null);
    setUserId(null);
  };

  return (
    <AuthContext.Provider value={{
      token, userId,
      isAuthenticated: token !== null && userId !== null,
      login, register, logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext deve ser usado dentro de <AuthProvider>');
  return ctx;
}
