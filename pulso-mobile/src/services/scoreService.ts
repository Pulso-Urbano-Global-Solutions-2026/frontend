import { ApiPaths, SAO_PAULO } from '@/constants/api.constants';
import api from '@/services/api';
import type { ScoreAtual, ScoreHistorico, ZonasResponse } from '@/types/score.types';

// GET /score/current → READ do CRUD.
export const getCurrent = (
  lat: number = SAO_PAULO.lat,
  lon: number = SAO_PAULO.lon
): Promise<ScoreAtual> =>
  api.get<ScoreAtual>(ApiPaths.score.current, { params: { lat, lon } }).then((r) => r.data);

// GET /score/historico → READ do CRUD. Backend exige zonaId (não usuarioId).
export const getHistorico = (zonaId: number, dias = 7): Promise<ScoreHistorico> =>
  api.get<ScoreHistorico>(ApiPaths.score.historico, { params: { zonaId, dias } }).then((r) => r.data);

// GET /score/zonas (público).
export const getZonas = (): Promise<ZonasResponse> =>
  api.get<ZonasResponse>(ApiPaths.score.zonas).then((r) => r.data);
