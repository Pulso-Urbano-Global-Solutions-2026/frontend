import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { SAO_PAULO } from '@/constants/api.constants';
import { getCurrent } from '@/services/scoreService';
import type { AsyncState } from '@/types/api.types';
import type { ScoreAtual } from '@/types/score.types';

export function useScore() {
  const [state, setState] = useState<AsyncState<ScoreAtual>>({ data: null, loading: true, error: null });

  const fetch = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await getCurrent(SAO_PAULO.lat, SAO_PAULO.lon);
      setState({ data, loading: false, error: null });
    } catch (err) {
      const msg = axios.isAxiosError(err)
        ? (err.response?.data as { erro?: string })?.erro ?? err.message
        : 'Erro ao buscar score';
      setState({ data: null, loading: false, error: msg });
    }
  }, []);

  useEffect(() => { void fetch(); }, [fetch]);

  return { ...state, refetch: fetch };
}
