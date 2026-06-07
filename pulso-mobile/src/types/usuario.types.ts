export interface UsuarioCreate {
  nome: string; email: string; senha: string;
  fazExercicio: boolean; temCrianca: boolean; temProblemaRespiratorio: boolean;
}
export type UsuarioUpdate = Partial<Omit<UsuarioCreate, 'email'>>;
export interface UsuarioResponse {
  id: number; nome: string; email: string; role: string;
  fazExercicio: boolean; temCrianca: boolean; temProblemaRespiratorio: boolean;
  ativo?: boolean;
  dtCriacao?: string;
  _links?: Record<string, { href: string }>;
}
export interface AuthRequest { email: string; senha: string; }
export interface AuthResponse { token: string; tipo: string; expiraEmMs: number; }
// JWT: sub = email, usuarioId = id numérico, role = "USER" | "ADMIN"
export interface JwtPayload {
  sub: string; exp: number; iat?: number; usuarioId?: number; role?: string;
}
