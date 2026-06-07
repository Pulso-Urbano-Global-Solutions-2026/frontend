import type { ClassificacaoScore } from '@/types/score.types';

export interface ApiError { status?: number; erro: string; mensagem?: string; timestamp?: string; }

// icone values from backend: check_circle | warning | error | dangerous
export type RecomendacaoIcone = 'check_circle' | 'warning' | 'error' | 'dangerous';

export interface RecomendacaoResponse {
  texto: string;
  icone: RecomendacaoIcone;
  nivel: ClassificacaoScore;
  personalizadaPara: string[];
  dtGeracao: string;
}
export interface AsyncState<T> { data: T | null; loading: boolean; error: string | null; }
