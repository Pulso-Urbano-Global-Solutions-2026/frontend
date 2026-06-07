import { FlatList, SafeAreaView, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import ClassificacaoBadge from '@/components/ClassificacaoBadge/ClassificacaoBadge';
import EmptyState from '@/components/EmptyState/EmptyState';
import ErrorState from '@/components/ErrorState/ErrorState';
import LoadingSkeleton from '@/components/LoadingSkeleton/LoadingSkeleton';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { useHistorico } from '@/hooks/useHistorico';
import type { ScoreHistoricoItem } from '@/types/score.types';
import { formatDate, formatDayLabel } from '@/utils/dateUtils';
import { getClassificacaoColor } from '@/utils/scoreUtils';

export default function HistoricoScreen() {
  const { historico, loading, error, refetch } = useHistorico();
  const { width: windowWidth } = useWindowDimensions();

  // Garante ordem cronológica (backend pode retornar em qualquer ordem).
  const sorted = [...historico].sort((a, b) => a.dt.localeCompare(b.dt));

  const chartWidth = windowWidth - 40; // 20px padding cada lado
  const spacing = sorted.length > 1
    ? Math.max(30, Math.floor((chartWidth - 30) / sorted.length))
    : 50;

  const chartData = sorted.map((h) => ({
    value: Math.round(h.score),
    label: formatDayLabel(h.dt),
    // Não usar dataPointColor aqui pois o gifted-charts v1 ignora quando
    // dataPointsColor está setado no componente — controlamos a cor da linha.
    dataPointLabelComponent: undefined,
  }));

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
        <Text style={styles.title}>Últimos 7 dias</Text>

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
                color={Colors.bom}
                thickness={2}
                maxValue={100}
                noOfSections={4}
                yAxisColor={Colors.border}
                xAxisColor={Colors.border}
                yAxisTextStyle={{ color: Colors.textMuted, fontSize: 10 }}
                xAxisLabelTextStyle={{ color: Colors.textMuted, fontSize: 10 }}
                backgroundColor={Colors.surface}
                dataPointsColor={Colors.bom}
                dataPointsRadius={5}
                curved
                hideRules={false}
                rulesColor={Colors.border}
                rulesType="solid"
                yAxisThickness={0}
                xAxisThickness={1}
              />
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
  safe: { flex: 1, backgroundColor: Colors.bg },
  content: { flexGrow: 1, padding: 20, gap: 16 },
  title: { fontSize: Typography.size.lg, fontWeight: '700', color: Colors.text },
  chart: { backgroundColor: Colors.surface, borderRadius: 12, paddingTop: 12, paddingBottom: 4, overflow: 'hidden' },
  card: { backgroundColor: Colors.surface, borderRadius: 8, padding: 12, marginBottom: 8, gap: 8 },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardDate: { color: Colors.textMuted, fontSize: Typography.size.sm },
  cardScore: { fontSize: Typography.size.lg, fontWeight: '700' },
});
