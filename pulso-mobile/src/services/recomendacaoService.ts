import { ApiPaths } from '@/constants/api.constants';
import api from '@/services/api';
import type { RecomendacaoResponse } from '@/types/api.types';

// Contrato REAL: GET /recomendacao?scoreId=&usuarioId= (ambos obrigatórios).
// IMPORTANTE: NÃO seguir o _links.recomendacao.href do /score/current — o backend
// monta esse link com scoreId=0&usuarioId=0 (placeholders fixos, bug conhecido).
// Ver BLOQUEIO Q-01 no fim do backlog: o /current ainda não expõe o scoreId.
export const getRecomendacao = (
  scoreId: number,
  usuarioId: number
): Promise<RecomendacaoResponse> =>
  api
    .get<RecomendacaoResponse>(ApiPaths.recomendacao, { params: { scoreId, usuarioId } })
    .then((r) => r.data);
