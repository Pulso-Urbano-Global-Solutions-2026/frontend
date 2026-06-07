export type UrgenciaVulnerabilidade = 'CRITICA' | 'ALTA' | 'MODERADA' | 'BAIXA';

export interface VulnerabilidadeZona {
  zonaId:                 number;
  zonaNome:               string;
  scoreAmbiental:         number;
  classificacaoAmbiental: string;
  populacaoTotal:         number;
  percentualIdosos:       number;
  percentualCriancas:     number;
  densidadeRelativa:      number;
  indiceVulnerabilidade:  number;
  urgencia:               UrgenciaVulnerabilidade;
  descricaoUrgencia:      string;
  lat:                    number;
  lon:                    number;
}
