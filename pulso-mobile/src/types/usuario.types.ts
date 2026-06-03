export interface UsuarioCreate {
  nome: string; email: string; senha: string;
  fazExercicio: boolean; temCrianca: boolean; temProblemaResp: boolean;
}
export type UsuarioUpdate = Partial<Omit<UsuarioCreate, 'email'>>;
export interface UsuarioResponse {
  id: number; nome: string; email: string; role: string;
  fazExercicio: boolean; temCrianca: boolean; temProblemaResp: boolean;
  dtCriacao: string;
}
export interface AuthRequest { email: string; senha: string; }
export interface AuthResponse { token: string; tipo: string; expiraEmMs: number; }
// JWT real do backend: sub = EMAIL, o id numérico está no claim "usuarioId".
// Também vem "role". (confirmado em JwtConfig.java do backend)
export interface JwtPayload {
  sub: string; exp: number; iat?: number; usuarioId?: number; role?: string;
}
