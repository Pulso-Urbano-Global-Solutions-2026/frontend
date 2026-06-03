import type { ClassificacaoScore } from '@/types/score.types';

export interface ApiError { status?: number; erro: string; mensagem?: string; timestamp?: string; }
export interface RecomendacaoResponse {
  texto: string;
  icone: 'success' | 'warning' | 'error';
  nivel: ClassificacaoScore;
  personalizadaPara: string[];
  dtGeracao: string;
}
export interface AsyncState<T> { data: T | null; loading: boolean; error: string | null; }
