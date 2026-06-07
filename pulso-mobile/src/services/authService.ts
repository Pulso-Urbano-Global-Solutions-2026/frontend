import { ApiPaths } from '@/constants/api.constants';
import api from '@/services/api';
import { removeToken, storeToken } from '@/services/secureStore';
import type { AuthRequest, AuthResponse, UsuarioCreate } from '@/types/usuario.types';

// POST /auth/login → salva token. Login NÃO devolve id (vem do JWT via tokenUtils).
export const login = async (credentials: AuthRequest): Promise<AuthResponse> => {
  const { data } = await api.post<AuthResponse>(ApiPaths.auth.login, credentials);
  await storeToken(data.token);
  return data;
};

// POST /auth/register → retorna AuthResponse (token direto, 201).
export const register = async (novo: UsuarioCreate): Promise<AuthResponse> => {
  const { data } = await api.post<AuthResponse>(ApiPaths.auth.register, novo);
  await storeToken(data.token);
  return data;
};

// Logout local: backend é stateless JWT, basta descartar o token.
export const logout = (): Promise<void> => removeToken();
