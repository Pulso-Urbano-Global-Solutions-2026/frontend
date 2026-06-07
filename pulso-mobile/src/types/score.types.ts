export type ClassificacaoScore = 'BOM' | 'MODERADO' | 'RUIM' | 'CRITICO';

export interface ScoreAtual {
  scoreId: number;
  score: number;
  classificacao: ClassificacaoScore;
  no2Ppb: number;
  tempSuperficieC: number;
  fonteDadoNo2: string;
  fonteDadoTemp: string;
  dtDadoOrbital: string;
  zonaId: number;
  zonaNome: string;
  _links?: Record<string, { href: string }>;
}

export interface ScoreHistoricoItem {
  dt: string;
  score: number;
  classificacao: ClassificacaoScore;
}

export interface ScoreHistorico { zonaId?: number; historico: ScoreHistoricoItem[]; }

export interface ZonaScore { id: number; nome: string; score: number; lat: number; lon: number; }
export interface ZonasResponse { zonas: ZonaScore[]; }
