import type { ComponentProps } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import type { ClassificacaoScore } from '@/types/score.types';
import type { RecomendacaoIcone } from '@/types/api.types';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

const COLOR_BY_CLASSIFICACAO: Record<ClassificacaoScore, string> = {
  BOM: Colors.bom, MODERADO: Colors.moderado, RUIM: Colors.ruim, CRITICO: Colors.critico,
};
const LABEL_BY_CLASSIFICACAO: Record<ClassificacaoScore, string> = {
  BOM: 'Boas condições', MODERADO: 'Moderado', RUIM: 'Ruim', CRITICO: 'Crítico',
};
const ICON_BY_CLASSIFICACAO: Record<ClassificacaoScore, IoniconName> = {
  BOM: 'checkmark-circle', MODERADO: 'alert-circle', RUIM: 'warning', CRITICO: 'close-circle',
};
const ICON_BY_RECOMENDACAO: Record<RecomendacaoIcone, IoniconName> = {
  check_circle: 'checkmark-circle',
  warning: 'alert-circle',
  error: 'close-circle',
  dangerous: 'nuclear',
};
const COLOR_BY_RECOMENDACAO: Record<RecomendacaoIcone, string> = {
  check_circle: Colors.bom,
  warning: Colors.moderado,
  error: Colors.ruim,
  dangerous: Colors.critico,
};

export const getClassificacaoColor = (c: ClassificacaoScore): string => COLOR_BY_CLASSIFICACAO[c];
export const getClassificacaoLabel = (c: ClassificacaoScore): string => LABEL_BY_CLASSIFICACAO[c];
export const getClassificacaoIcon = (c: ClassificacaoScore): IoniconName => ICON_BY_CLASSIFICACAO[c];
export const getRecomendacaoIcon = (i: RecomendacaoIcone): IoniconName => ICON_BY_RECOMENDACAO[i];
export const getRecomendacaoColor = (i: RecomendacaoIcone): string => COLOR_BY_RECOMENDACAO[i];
export const clampScore = (score: number): number => Math.min(100, Math.max(0, score));
