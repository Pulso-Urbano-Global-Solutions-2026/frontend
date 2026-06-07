import axios from 'axios';
import { authEvents } from '@/services/authEvents';
import { getToken, removeToken } from '@/services/secureStore';

// FAIL-LOUD: sem fallback localhost. Em celular físico, "localhost" é o próprio
// celular, não a máquina de dev. Use IP de LAN (http://192.168.x.x:8080) ou prod URL.
const baseURL = process.env.EXPO_PUBLIC_API_URL;
if (!baseURL) {
  throw new Error(
    'EXPO_PUBLIC_API_URL não definida. Edite .env com o IP de LAN da máquina — NÃO localhost.'
  );
}

const api = axios.create({ baseURL, timeout: 10_000, headers: { 'Content-Type': 'application/json' } });

api.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (axios.isAxiosError(err) && err.response?.status === 401) {
      const url = err.config?.url ?? '';
      // Não disparar 'unauthorized' em endpoints de autenticação — 401 ali é
      // credencial inválida, não sessão expirada.
      const isAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/register');
      if (!isAuthEndpoint) {
        await removeToken();
        authEvents.emit('unauthorized');
      }
    }
    return Promise.reject(err);
  }
);

export default api;
