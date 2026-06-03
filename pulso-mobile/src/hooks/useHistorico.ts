import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { useAuthContext } from '@/contexts/AuthContext';
import { getHistorico } from '@/services/scoreService';
import type { ScoreHistoricoItem } from '@/types/score.types';

interface HistoricoState {
  historico: ScoreHistoricoItem[];
  loading: boolean;
  error: string | null;
}

export function useHistorico() {
  const { userId } = useAuthContext();
  const [state, setState] = useState<HistoricoState>({ historico: [], loading: false, error: null });

  const fetch = useCallback(async () => {
    if (!userId) { setState({ historico: [], loading: false, error: 'Usuário não autenticado' }); return; }
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const res = await getHistorico(userId, 7);
      setState({ historico: res.historico, loading: false, error: null });
    } catch (err) {
      const msg = axios.isAxiosError(err)
        ? (err.response?.data as { erro?: string })?.erro ?? err.message
        : 'Erro ao buscar histórico';
      setState({ historico: [], loading: false, error: msg });
    }
  }, [userId]);

  useEffect(() => { void fetch(); }, [fetch]);

  return { ...state, refetch: fetch };
}
