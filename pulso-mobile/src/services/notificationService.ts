import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import type { ClassificacaoScore } from '@/types/score.types';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function requestPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
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

async function cancelarAnterior(): Promise<void> {
  const agendadas = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    agendadas
      .filter((n) => n.identifier.startsWith('pulso-diario'))
      .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier))
  );
}

export async function agendarNotificacaoDiaria(params: {
  score: number;
  classificacao: ClassificacaoScore;
  no2Ppb: number;
  tempSuperficieC: number;
}): Promise<void> {
  const ok = await requestPermissions();
  if (!ok) return;
  await cancelarAnterior();
  const proximas7h = new Date();
  proximas7h.setHours(7, 0, 0, 0);
  if (new Date() >= proximas7h) proximas7h.setDate(proximas7h.getDate() + 1);
  await Notifications.scheduleNotificationAsync({
    identifier: `pulso-diario-${proximas7h.toISOString().slice(0, 10)}`,
    content: {
      title: tituloFor(params.classificacao),
      body:  corpoFor(params.score, params.classificacao, params.no2Ppb, params.tempSuperficieC),
      data:  { type: 'score_diario' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: proximas7h,
    },
  });
}
