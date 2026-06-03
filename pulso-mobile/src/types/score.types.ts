export type ClassificacaoScore = 'BOM' | 'MODERADO' | 'RUIM' | 'CRITICO';

// O backend envia _links (HATEOAS), mas o link de recomendação vem com
// scoreId=0&usuarioId=0 (placeholders) — NÃO seguir. Mantido opcional e ignorado.
export interface ScoreAtual {
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

export interface ScoreHistorico { historico: ScoreHistoricoItem[]; }

export interface ZonaScore { id: number; nome: string; score: number; lat: number; lon: number; }
export interface ZonasResponse { zonas: ZonaScore[]; }
