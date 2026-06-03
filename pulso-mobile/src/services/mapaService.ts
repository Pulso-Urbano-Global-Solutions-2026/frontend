import { ApiPaths } from '@/constants/api.constants';
import api from '@/services/api';
import type { MapaCamada, TipoCamada } from '@/types/mapa.types';

export const getCamadas = (tipo: TipoCamada, cidade = 'sao_paulo'): Promise<MapaCamada> =>
  api.get<MapaCamada>(ApiPaths.mapa.camadas, { params: { tipo, cidade } }).then((r) => r.data);
