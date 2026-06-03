// Event bus: o interceptor do api.ts (módulo plano, sem router) emite
// 'unauthorized' → o root layout escuta e navega para /login.
type AuthEvent = 'unauthorized';
type Listener = () => void;

const listeners: Record<AuthEvent, Set<Listener>> = { unauthorized: new Set() };

export const authEvents = {
  on(event: AuthEvent, fn: Listener): () => void {
    listeners[event].add(fn);
    return () => { listeners[event].delete(fn); };
  },
  emit(event: AuthEvent): void {
    listeners[event].forEach((fn) => fn());
  },
};
