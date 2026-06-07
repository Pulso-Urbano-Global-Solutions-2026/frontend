import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { getHistorico, getZonas } from '@/services/scoreService';
import type { ScoreHistoricoItem } from '@/types/score.types';

interface HistoricoState {
  historico: ScoreHistoricoItem[];
  loading: boolean;
  error: string | null;
}

export function useHistorico() {
  const [state, setState] = useState<HistoricoState>({ historico: [], loading: false, error: null });

  const fetch = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      // Usa a primeira zona disponível (SP tem uma única zona monitorada).
      const { zonas } = await getZonas();
      const zonaId = zonas[0]?.id ?? 1;
      const res = await getHistorico(zonaId, 7);
      setState({ historico: res.historico, loading: false, error: null });
    } catch (err) {
      const msg = axios.isAxiosError(err)
        ? (err.response?.data as { mensagem?: string; erro?: string })?.mensagem
          ?? (err.response?.data as { erro?: string })?.erro
          ?? err.message
        : 'Erro ao buscar histórico';
      setState({ historico: [], loading: false, error: msg });
    }
  }, []);

  useEffect(() => { void fetch(); }, [fetch]);

  return { ...state, refetch: fetch };
}
