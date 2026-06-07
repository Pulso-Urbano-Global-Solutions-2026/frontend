import { ApiPaths } from '@/constants/api.constants';
import api from '@/services/api';
import type { VulnerabilidadeZona } from '@/types/vulnerabilidade.types';

export const getZonasPorUrgencia = (): Promise<VulnerabilidadeZona[]> =>
  api.get<VulnerabilidadeZona[]>(ApiPaths.vulnerabilidade.zonas).then((r) => r.data);
