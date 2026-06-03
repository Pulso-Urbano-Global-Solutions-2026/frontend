import { ApiPaths } from '@/constants/api.constants';
import api from '@/services/api';
import { removeToken, storeToken } from '@/services/secureStore';
import type { AuthRequest, AuthResponse, UsuarioCreate, UsuarioResponse } from '@/types/usuario.types';

// POST /auth/login → salva token. Login NÃO devolve id (vem do JWT via tokenUtils).
export const login = async (credentials: AuthRequest): Promise<AuthResponse> => {
  const { data } = await api.post<AuthResponse>(ApiPaths.auth.login, credentials);
  await storeToken(data.token);
  return data;
};

// POST /auth/register → CREATE do CRUD (30pts GS).
export const register = (novo: UsuarioCreate): Promise<UsuarioResponse> =>
  api.post<UsuarioResponse>(ApiPaths.auth.register, novo).then((r) => r.data);

// Logout local: backend é stateless JWT, basta descartar o token.
export const logout = (): Promise<void> => removeToken();
