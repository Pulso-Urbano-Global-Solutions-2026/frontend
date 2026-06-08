import { useState } from 'react';
import { FlatList, SafeAreaView, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import ClassificacaoBadge from '@/components/ClassificacaoBadge/ClassificacaoBadge';
import EmptyState from '@/components/EmptyState/EmptyState';
import ErrorState from '@/components/ErrorState/ErrorState';
import LoadingSkeleton from '@/components/LoadingSkeleton/LoadingSkeleton';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { useHistorico } from '@/hooks/useHistorico';
import type { ClassificacaoScore, ScoreHistoricoItem } from '@/types/score.types';
import { formatDate, formatDayLabel } from '@/utils/dateUtils';
import { getClassificacaoColor } from '@/utils/scoreUtils';

// Interpreta os últimos 3 scores e retorna a tendência
function calcTendencia(scores: number[]): 'melhorando' | 'piorando' | null {
  if (scores.length < 3) return null;
  const last3 = scores.slice(-3);
  const diff = (last3[2] ?? 0) - (last3[0] ?? 0);
  if (diff > 3) return 'melhorando';
  if (diff < -3) return 'piorando';
  return null;
}

// Formata "2026-06-01" → "01/06"
function dtShort(dt: string) {
  const [, m, d] = dt.split('-');
  return `${d}/${m}`;
}

export default function HistoricoScreen() {
  const { historico, loading, error, refetch } = useHistorico();
  const { width: windowWidth } = useWindowDimensions();
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  const sorted = [...historico].sort((a, b) => a.dt.localeCompare(b.dt));

  const chartWidth = windowWidth - 40;
  const spacing    = sorted.length > 1
    ? Math.max(30, Math.floor((chartWidth - 30) / sorted.length))
    : 50;

  const chartData = sorted.map((h, i) => ({
    value:             Math.round(h.score),
    label:             formatDayLabel(h.dt),
    dataPointLabelComponent: undefined,
    onPress:           () => setSelectedIdx(i === selectedIdx ? null : i),
  }));

  const tendencia = calcTendencia(sorted.map((h) => h.score));

  const dateRange = sorted.length >= 2
    ? `${dtShort(sorted[0]?.dt ?? '')} – ${dtShort(sorted[sorted.length - 1]?.dt ?? '')}`
    : null;

  const selectedItem: ScoreHistoricoItem | null =
    selectedIdx !== null ? (sorted[selectedIdx] ?? null) : null;

  const renderItem = ({ item }: { item: ScoreHistoricoItem }) => (
    <View style={styles.card}>
      <View style={styles.cardRow}>
        <Text style={styles.cardDate}>{formatDate(item.dt)}</Text>
        <Text style={[styles.cardScore, { color: getClassificacaoColor(item.classificacao) }]}>
          {Math.round(item.score)}
        </Text>
      </View>
      <ClassificacaoBadge classificacao={item.classificacao} size="sm" />
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>

        {/* Cabeçalho com intervalo de datas e badge de tendência */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Últimos 7 dias</Text>
            {dateRange && <Text style={styles.dateRange}>{dateRange}</Text>}
          </View>
          {tendencia && (
            <View style={[
              styles.tendenciaBadge,
              { borderColor: tendencia === 'melhorando' ? Colors.bom : Colors.moderado },
            ]}>
              <Text style={[
                styles.tendenciaText,
                { color: tendencia === 'melhorando' ? Colors.bom : Colors.moderado },
              ]}>
                {tendencia === 'melhorando' ? '↗ melhorando' : '↘ piorando'}
              </Text>
            </View>
          )}
        </View>

        {loading && <LoadingSkeleton rows={5} />}
        {!loading && error && <ErrorState message={error} onRetry={refetch} />}
        {!loading && !error && historico.length === 0 && (
          <EmptyState icon="time-outline" message="Ainda sem histórico. Volte amanhã!" />
        )}

        {sorted.length > 0 && (
          <>
            <View style={styles.chart}>
              <LineChart
                data={chartData}
                width={chartWidth}
                height={180}
                spacing={spacing}
                initialSpacing={16}
                endSpacing={16}
                color={Colors.cyan}
                thickness={2}
                maxValue={100}
                noOfSections={4}
                yAxisColor={Colors.border}
                xAxisColor={Colors.border}
                yAxisTextStyle={{ color: Colors.textMuted, fontSize: 10 }}
                xAxisLabelTextStyle={{ color: Colors.textMuted, fontSize: 10 }}
                backgroundColor={Colors.surface}
                dataPointsColor={Colors.cyan}
                dataPointsRadius={5}
                curved
                hideRules={false}
                rulesColor={Colors.border}
                rulesType="solid"
                yAxisThickness={0}
                xAxisThickness={1}
              />
              {/* Tooltip do ponto selecionado */}
              {selectedItem && (
                <View style={[
                  styles.tooltip,
                  { borderColor: getClassificacaoColor(selectedItem.classificacao as ClassificacaoScore) },
                ]}>
                  <Text style={styles.tooltipDate}>{formatDate(selectedItem.dt)}</Text>
                  <Text style={[
                    styles.tooltipScore,
                    { color: getClassificacaoColor(selectedItem.classificacao as ClassificacaoScore) },
                  ]}>
                    {Math.round(selectedItem.score)} pts
                  </Text>
                  <ClassificacaoBadge classificacao={selectedItem.classificacao as ClassificacaoScore} size="sm" />
                </View>
              )}
            </View>

            <FlatList
              data={sorted}
              keyExtractor={(item) => item.dt}
              renderItem={renderItem}
              scrollEnabled={false}
            />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: Colors.bg },
  content: { flexGrow: 1, padding: 20, gap: 16 },

  header:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  title:         { fontFamily: Typography.font.heading, fontSize: Typography.size.lg, color: Colors.text },
  dateRange:     { fontFamily: Typography.font.mono, fontSize: Typography.size.xs, color: Colors.textDim, marginTop: 2 },
  tendenciaBadge:{
    borderWidth: 1, borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 4,
    alignSelf: 'flex-start', marginTop: 4,
  },
  tendenciaText: { fontFamily: Typography.font.subheading, fontSize: Typography.size.xs },

  chart: {
    backgroundColor: Colors.surface, borderRadius: 12,
    paddingTop: 12, paddingBottom: 4, overflow: 'hidden',
  },
  tooltip: {
    position: 'absolute', top: 8, right: 8,
    backgroundColor: Colors.surface2,
    borderWidth: 1, borderRadius: 8,
    padding: 8, gap: 4, alignItems: 'center', minWidth: 90,
  },
  tooltipDate:  { fontFamily: Typography.font.mono, fontSize: Typography.size.xs, color: Colors.textMuted },
  tooltipScore: { fontFamily: Typography.font.heading, fontSize: Typography.size.lg },

  card:     { backgroundColor: Colors.surface, borderRadius: 8, padding: 12, marginBottom: 8, gap: 8 },
  cardRow:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardDate: { fontFamily: Typography.font.body, color: Colors.textMuted, fontSize: Typography.size.sm },
  cardScore:{ fontFamily: Typography.font.mono, fontSize: Typography.size.lg },
});
