import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { getCamadas } from '@/services/mapaService';
import type { MapaCamada, TipoCamada } from '@/types/mapa.types';

interface MapaState { data: MapaCamada | null; loading: boolean; error: string | null; }

export function useMapa() {
  const [camada, setCamada] = useState<TipoCamada>('no2');
  const [state, setState] = useState<MapaState>({ data: null, loading: true, error: null });

  const fetch = useCallback(async (tipo: TipoCamada) => {
    setState({ data: null, loading: true, error: null });
    try {
      const data = await getCamadas(tipo);
      setState({ data, loading: false, error: null });
    } catch (err) {
      const msg = axios.isAxiosError(err)
        ? (err.response?.data as { erro?: string })?.erro ?? err.message
        : 'Erro ao buscar camada do mapa';
      setState({ data: null, loading: false, error: msg });
    }
  }, []);

  useEffect(() => { void fetch(camada); }, [camada, fetch]);

  const toggleCamada = () => setCamada((c) => (c === 'no2' ? 'temperatura' : 'no2'));

  return { ...state, camada, toggleCamada, refetch: () => fetch(camada) };
}
