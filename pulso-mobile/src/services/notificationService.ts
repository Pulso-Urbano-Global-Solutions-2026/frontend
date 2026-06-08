import type * as NotificationsModule from 'expo-notifications';
import { Platform } from 'react-native';
import type { ClassificacaoScore } from '@/types/score.types';

// expo-notifications auto-registers for push tokens at import time, which throws in
// Expo Go since SDK 53. Lazy-require inside try-catch so the module still loads.
// All functions become no-ops when N is null (Expo Go). Scheduled local
// notifications won't fire in Expo Go — acceptable for this environment.
let N: typeof NotificationsModule | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  N = require('expo-notifications') as typeof NotificationsModule;
  N.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
} catch {
  // Expo Go: push token auto-registration throws — notifications silently disabled
}

export async function requestPermissions(): Promise<boolean> {
  if (Platform.OS === 'web' || !N) return false;
  const { status: existing } = await N.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await N.requestPermissionsAsync();
  return status === 'granted';
}

function tituloFor(c: ClassificacaoScore): string {
  const m: Record<ClassificacaoScore, string> = {
    BOM:      'Boa manhã! Ar limpo hoje ✓',
    MODERADO: 'Atenção ao ar hoje',
    RUIM:     'Qualidade do ar ruim hoje',
    CRITICO:  'Ar crítico — veja antes de sair',
  };
  return m[c];
}

function corpoFor(score: number, c: ClassificacaoScore, no2: number, temp: number): string {
  const emoji: Record<ClassificacaoScore, string> = {
    BOM: '🟢', MODERADO: '🟡', RUIM: '🟠', CRITICO: '🔴',
  };
  const dica: Record<ClassificacaoScore, string> = {
    BOM:      'Ótimo para atividades ao ar livre.',
    MODERADO: 'Prefira sair antes das 10h ou após as 17h.',
    RUIM:     'Evite esforço físico prolongado ao ar livre.',
    CRITICO:  'Recomendamos permanecer em ambientes fechados.',
  };
  return `${emoji[c]} Score: ${score.toFixed(0)}/100 · NO₂: ${no2.toFixed(1)} ppb · ${temp.toFixed(0)}°C
${dica[c]}`;
}

async function cancelarAnterior(n: typeof NotificationsModule): Promise<void> {
  const agendadas = await n.getAllScheduledNotificationsAsync();
  await Promise.all(
    agendadas
      .filter((item) => item.identifier.startsWith('pulso-diario'))
      .map((item) => n.cancelScheduledNotificationAsync(item.identifier))
  );
}

export async function agendarNotificacaoDiaria(params: {
  score: number;
  classificacao: ClassificacaoScore;
  no2Ppb: number;
  tempSuperficieC: number;
}): Promise<void> {
  if (!N) return;
  const ok = await requestPermissions();
  if (!ok) return;
  await cancelarAnterior(N);
  const proximas7h = new Date();
  proximas7h.setHours(7, 0, 0, 0);
  if (new Date() >= proximas7h) proximas7h.setDate(proximas7h.getDate() + 1);
  await N.scheduleNotificationAsync({
    identifier: `pulso-diario-${proximas7h.toISOString().slice(0, 10)}`,
    content: {
      title: tituloFor(params.classificacao),
      body:  corpoFor(params.score, params.classificacao, params.no2Ppb, params.tempSuperficieC),
      data:  { type: 'score_diario' },
    },
    trigger: {
      type: N.SchedulableTriggerInputTypes.DATE,
      date: proximas7h,
    },
  });
}
