// Único lugar que toca o SecureStore. tokenUtils.ts fica puro (sem I/O).
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'pulso_jwt_token';

export const storeToken = (token: string): Promise<void> =>
  SecureStore.setItemAsync(TOKEN_KEY, token);

export const getToken = (): Promise<string | null> =>
  SecureStore.getItemAsync(TOKEN_KEY);

export const removeToken = (): Promise<void> =>
  SecureStore.deleteItemAsync(TOKEN_KEY);
