import { useEffect, useState } from 'react';
import axios from 'axios';
import { getRecomendacao } from '@/services/recomendacaoService';
import type { RecomendacaoResponse, AsyncState } from '@/types/api.types';

// BLOQUEIO Q-01: a /recomendacao exige scoreId + usuarioId, mas o /score/current
// ainda NÃO expõe o scoreId (e o _links vem com 0,0 hardcoded). Enquanto o Felipe
// não expuser o scoreId no payload do /current, este hook recebe scoreId|null e
// só busca quando os dois ids existem. Passe usuarioId do AuthContext na tela.
export function useRecomendacao(scoreId: number | null, usuarioId: number | null) {
  const [state, setState] = useState<AsyncState<RecomendacaoResponse>>({ data: null, loading: false, error: null });

  useEffect(() => {
    if (scoreId == null || usuarioId == null) {
      setState({ data: null, loading: false, error: null });
      return;
    }
    setState({ data: null, loading: true, error: null });
    getRecomendacao(scoreId, usuarioId)
      .then((data) => setState({ data, loading: false, error: null }))
      .catch((err) => {
        const msg = axios.isAxiosError(err)
          ? (err.response?.data as { erro?: string })?.erro ?? err.message
          : 'Erro ao buscar recomendação';
        setState({ data: null, loading: false, error: msg });
      });
  }, [scoreId, usuarioId]);

  return state;
}
