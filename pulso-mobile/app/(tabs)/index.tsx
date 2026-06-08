import { useEffect, useState } from 'react';
import { RefreshControl, SafeAreaView, ScrollView, StyleSheet,
         Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { agendarNotificacaoDiaria } from '@/services/notificationService';
import { LogoWordmark } from '@/components/Logo/Logo';
import ScoreGauge from '@/components/ScoreGauge/ScoreGauge';
import ClassificacaoBadge from '@/components/ClassificacaoBadge/ClassificacaoBadge';
import RecomendacaoCard from '@/components/RecomendacaoCard/RecomendacaoCard';
import ErrorState from '@/components/ErrorState/ErrorState';
import LoadingSkeleton from '@/components/LoadingSkeleton/LoadingSkeleton';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { useAuthContext } from '@/contexts/AuthContext';
import { useRecomendacao } from '@/hooks/useRecomendacao';
import { useScore } from '@/hooks/useScore';
import { useHistorico } from '@/hooks/useHistorico';
import { formatDate } from '@/utils/dateUtils';

const TEMP_LIMITE_PET = 35;
const petKey = (id: number) => `pulso_tem_pet_${id}`;

// Faixas de risco para NO₂ (ppb) e temperatura de superfície (°C)
function no2Color(v: number): string {
  if (v >= 40) return Colors.critico;
  if (v >= 25) return Colors.moderado;
  if (v >= 15) return Colors.ruim;
  return Colors.bom;
}
function tempColor(v: number): string {
  if (v >= 38) return Colors.critico;
  if (v >= 33) return Colors.moderado;
  if (v >= 29) return Colors.ruim;
  return Colors.bom;
}

// ── DC-01: MetricCard com barra de progresso e limite de referência ────────────
function MetricCard({
  icon, label, value, unit, reference, progressValue, color,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  unit: string;
  reference: string;
  progressValue: number;
  color: string;
}) {
  return (
    <View style={styles.metricCard}>
      <View style={styles.metricLabelRow}>
        <Ionicons name={icon} size={13} color={Colors.textDim} />
        <Text style={styles.metricLabelText}>{label}</Text>
      </View>
      <View style={styles.metricValueRow}>
        <Text style={[styles.metricNum, { color }]}>{value}</Text>
        <Text style={styles.metricUnit}>{unit}</Text>
      </View>
      <Text style={styles.metricRef}>{reference}</Text>
      <View style={styles.progTrack}>
        <View style={[styles.progFill, { width: `${Math.min(1, progressValue) * 100}%` as unknown as number, backgroundColor: color }]} />
      </View>
    </View>
  );
}

// ── HV-02: Régua visual de score com marcador de posição ──────────────────────
const SCORE_RANGES = [
  { flex: 40, color: Colors.critico,  label: 'CRÍTICO' },
  { flex: 20, color: Colors.ruim,     label: 'RUIM'    },
  { flex: 20, color: Colors.moderado, label: 'MOD.'    },
  { flex: 21, color: Colors.bom,      label: 'BOM'     },
] as const;

function ScoreRulerInline({ score }: { score: number }) {
  const clampedScore = Math.min(100, Math.max(0, score));
  return (
    <View style={styles.rulerWrap}>
      <View style={styles.rulerBar}>
        {SCORE_RANGES.map((r) => (
          <View key={r.label} style={[styles.rulerSeg, { flex: r.flex, backgroundColor: r.color + '99' }]} />
        ))}
      </View>
      {/* marcador triângulo na posição do score */}
      <View style={styles.rulerMarkerRow}>
        <View style={{ flex: clampedScore }} />
        <Text style={styles.rulerMarker}>▲</Text>
        <View style={{ flex: 100 - clampedScore }} />
      </View>
      <View style={styles.rulerLabels}>
        {SCORE_RANGES.map((r) => (
          <Text key={r.label} style={[styles.rulerLabel, { flex: r.flex, color: r.color }]}>{r.label}</Text>
        ))}
      </View>
    </View>
  );
}

// ── ND-01: Card de ação rápida ─────────────────────────────────────────────────
function QuickActionCard({
  icon, label, onPress,
}: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.quickCard} onPress={onPress} activeOpacity={0.7}>
      <Ionicons name={icon} size={18} color={Colors.cyan} />
      <Text style={styles.quickLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={16} color={Colors.textDim} />
    </TouchableOpacity>
  );
}

// ── DC-06: Delta vs ontem ──────────────────────────────────────────────────────
function DeltaBadge({ delta }: { delta: number | null }) {
  if (delta === null) return null;
  const up      = delta >= 0;
  const color   = up ? Colors.bom : Colors.critico;
  const bgColor = up ? Colors.bomDim : Colors.criticoDim;
  const arrow   = up ? '↗' : '↘';
  const sign    = up ? '+' : '';
  return (
    <View style={[styles.deltaBadge, { backgroundColor: bgColor, borderColor: color }]}>
      <Text style={[styles.deltaText, { color }]}>{arrow} {sign}{delta} desde ontem</Text>
    </View>
  );
}

export default function HomeScreen() {
  const { userId } = useAuthContext();
  const { data, loading, error, refetch } = useScore();
  const rec = useRecomendacao(data?.scoreId ?? null, userId);
  const { historico } = useHistorico();
  const router = useRouter();
  const [temPet, setTemPet] = useState(false);

  useEffect(() => {
    if (!userId) return;
    SecureStore.getItemAsync(petKey(userId))
      .then((val) => setTemPet(val === 'true'))
      .catch(() => {});
  }, [userId]);

  useEffect(() => {
    if (!data) return;
    void agendarNotificacaoDiaria({
      score:           data.score,
      classificacao:   data.classificacao,
      no2Ppb:          data.no2Ppb,
      tempSuperficieC: data.tempSuperficieC,
    });
  }, [data]);

  // DC-06: calcula delta do score vs ontem
  const delta: number | null = (() => {
    const sorted = [...historico].sort((a, b) => a.dt.localeCompare(b.dt));
    if (sorted.length < 2 || !data) return null;
    const ontem = sorted[sorted.length - 2];
    if (!ontem) return null;
    return Math.round(data.score - ontem.score);
  })();

  const petAlertaAtivo = temPet && data !== null && data.tempSuperficieC >= TEMP_LIMITE_PET;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refetch} tintColor={Colors.bom} />
        }
      >
        <View style={styles.headerRow}>
          <LogoWordmark size={32} />
          <Text style={styles.headerCity}>São Paulo · SP</Text>
        </View>

        {loading && !data && <LoadingSkeleton rows={5} />}
        {!loading && error && <ErrorState message={error} onRetry={refetch} />}

        {data && (
          <>
            {/* Gauge + delta + régua */}
            <View style={styles.gaugeCard}>
              <ScoreGauge score={data.score} classificacao={data.classificacao} />
              <View style={styles.badgeDeltaRow}>
                <ClassificacaoBadge classificacao={data.classificacao} size="md" />
                <DeltaBadge delta={delta} />
              </View>
              {/* DC-04: timestamp + fonte */}
              <Text style={styles.fonte}>
                Atualizado {formatDate(data.dtDadoOrbital)} · {data.fonteDadoNo2}
              </Text>
              {/* HV-02: régua de score */}
              <ScoreRulerInline score={data.score} />
            </View>

            {/* DC-01: métricas com barra de progresso e limite OMS */}
            <View style={styles.metricsRow}>
              <MetricCard
                icon="cloud-outline"
                label="NO₂"
                value={data.no2Ppb.toFixed(1)}
                unit="ppb"
                reference="Limite OMS: 25 ppb"
                progressValue={data.no2Ppb / 50}
                color={no2Color(data.no2Ppb)}
              />
              <MetricCard
                icon="thermometer-outline"
                label="Superfície"
                value={data.tempSuperficieC.toFixed(1)}
                unit="°C"
                reference={`Ilha de calor +${Math.max(0, data.tempSuperficieC - 28).toFixed(1)}°C`}
                progressValue={Math.max(0, data.tempSuperficieC - 28) / 20}
                color={tempColor(data.tempSuperficieC)}
              />
            </View>

            {/* Alerta de pet */}
            {petAlertaAtivo && (
              <View style={styles.petAlerta}>
                <Text style={styles.petAlertaIcon}>🐾</Text>
                <View style={styles.petAlertaBody}>
                  <Text style={styles.petAlertaTitulo}>Atenção com seu pet</Text>
                  <Text style={styles.petAlertaTexto}>
                    A temperatura do asfalto está em{' '}
                    <Text style={styles.petAlertaTemp}>{data.tempSuperficieC.toFixed(0)}°C</Text>
                    . Patas queimam acima de 35°C.{'\n'}
                    Prefira passeios antes das 10h ou após as 18h.
                  </Text>
                </View>
              </View>
            )}

            {rec.loading && <LoadingSkeleton rows={2} style={styles.recSkeleton} />}
            {rec.data && <RecomendacaoCard recomendacao={rec.data} />}
            {rec.error && <Text style={styles.recError}>{rec.error}</Text>}

            {/* ND-01: ações rápidas */}
            <View style={styles.quickSection}>
              <QuickActionCard
                icon="map-outline"
                label="Ver mapa de calor por bairro"
                onPress={() => router.push('/(tabs)/mapa')}
              />
              <QuickActionCard
                icon="warning-outline"
                label="Zonas de vulnerabilidade"
                onPress={() => router.push('/vulnerabilidade')}
              />
              <QuickActionCard
                icon="information-circle-outline"
                label="Entender os dados"
                onPress={() => router.push('/detalhes')}
              />
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: Colors.bg },
  content: { flexGrow: 1, padding: 20, gap: 14, alignItems: 'center' },

  headerRow:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' },
  headerCity: { fontFamily: Typography.font.mono, fontSize: Typography.size.xs, color: Colors.textDim, letterSpacing: 2 },

  // Gauge card
  gaugeCard: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: 16, borderWidth: 1, borderColor: Colors.border,
    paddingVertical: 12, paddingHorizontal: 16, gap: 8, alignItems: 'center',
  },
  badgeDeltaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap', justifyContent: 'center' },
  fonte: { fontFamily: Typography.font.mono, fontSize: Typography.size.xs, color: Colors.textDim },

  // DC-06: delta badge
  deltaBadge: { borderRadius: 100, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 3 },
  deltaText:  { fontFamily: Typography.font.mono, fontSize: Typography.size.xs },

  // HV-02: score ruler
  rulerWrap:      { width: '100%', marginTop: 4 },
  rulerBar:       { flexDirection: 'row', height: 7, borderRadius: 4, overflow: 'hidden', gap: 2 },
  rulerSeg:       { borderRadius: 3 },
  rulerMarkerRow: { flexDirection: 'row', alignItems: 'flex-start', height: 14 },
  rulerMarker:    { fontSize: 10, lineHeight: 14, color: Colors.textMuted },
  rulerLabels:    { flexDirection: 'row', marginTop: 1 },
  rulerLabel:     { fontFamily: Typography.font.mono, fontSize: 8, color: Colors.textDim, textAlign: 'center' },

  // DC-01: metric cards
  metricsRow: { flexDirection: 'row', width: '100%', gap: 10 },
  metricCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 14, borderWidth: 1, borderColor: Colors.border,
    padding: 12, gap: 3,
  },
  metricLabelRow:  { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 2 },
  metricLabelText: { fontFamily: Typography.font.mono, fontSize: Typography.size.xs, color: Colors.textDim },
  metricValueRow:  { flexDirection: 'row', alignItems: 'baseline', gap: 2 },
  metricNum:       { fontFamily: Typography.font.mono, fontSize: 22, fontWeight: '500', lineHeight: 26 },
  metricUnit:      { fontFamily: Typography.font.mono, fontSize: Typography.size.xs, color: Colors.textMuted },
  metricRef:       { fontFamily: Typography.font.body, fontSize: 11, color: Colors.textDim },
  progTrack:       { height: 4, borderRadius: 2, backgroundColor: Colors.surface2, marginTop: 4, overflow: 'hidden' },
  progFill:        { height: 4, borderRadius: 2 },

  recSkeleton: { width: '100%' },
  recError:    { color: Colors.textMuted, fontSize: Typography.size.sm, textAlign: 'center' },

  // ND-01: quick actions
  quickSection: { width: '100%', gap: 8 },
  quickCard: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.surface, borderRadius: 12,
    borderWidth: 1, borderColor: Colors.border,
    paddingVertical: 13, paddingHorizontal: 14,
  },
  quickLabel: { flex: 1, fontFamily: Typography.font.body, fontSize: Typography.size.sm, color: Colors.text },

  // Pet alert
  petAlerta: {
    width: '100%', flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    backgroundColor: '#1a1600',
    borderWidth: 1, borderColor: Colors.moderado,
    borderRadius: 12, padding: 14,
  },
  petAlertaIcon:   { fontSize: 26, lineHeight: 32 },
  petAlertaBody:   { flex: 1, gap: 4 },
  petAlertaTitulo: { color: Colors.moderado, fontWeight: '700', fontSize: Typography.size.md },
  petAlertaTexto:  { color: Colors.textMuted, fontSize: Typography.size.sm, lineHeight: 20 },
  petAlertaTemp:   { color: Colors.moderado, fontWeight: '700' },
});
