import type { JwtPayload } from '@/types/usuario.types';

const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

const base64UrlDecode = (input: string): string => {
  const b64 = input.replace(/-/g, '+').replace(/_/g, '/');
  let output = ''; let buffer = 0; let bits = 0;
  for (const ch of b64) {
    const val = B64.indexOf(ch);
    if (val === -1) continue;
    buffer = (buffer << 6) | val; bits += 6;
    if (bits >= 8) { bits -= 8; output += String.fromCharCode((buffer >> bits) & 0xff); }
  }
  try { return decodeURIComponent(escape(output)); } catch { return output; }
};

export const decodeJWT = (token: string): JwtPayload | null => {
  const parts = token.split('.');
  const seg = parts[1];
  if (parts.length !== 3 || !seg) return null;
  try { return JSON.parse(base64UrlDecode(seg)) as JwtPayload; } catch { return null; }
};

export const isExpired = (token: string): boolean => {
  const p = decodeJWT(token);
  if (!p?.exp) return true;
  return Date.now() >= p.exp * 1000;
};

export const getUserIdFromToken = (token: string): number | null => {
  const p = decodeJWT(token);
  // sub é o EMAIL neste backend; o id vem no claim usuarioId. Não usar sub aqui.
  return typeof p?.usuarioId === 'number' ? p.usuarioId : null;
};
