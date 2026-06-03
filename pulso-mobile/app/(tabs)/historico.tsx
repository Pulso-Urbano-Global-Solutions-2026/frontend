import { FlatList, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
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

  const chartData = historico.map((h) => ({
    value: h.score,
    label: formatDayLabel(h.dt),
    dataPointColor: getClassificacaoColor(h.classificacao),
  }));

  const renderItem = ({ item }: { item: ScoreHistoricoItem }) => (
    <View style={styles.card}>
      <View style={styles.cardRow}>
        <Text style={styles.cardDate}>{formatDate(item.dt)}</Text>
        <Text style={styles.cardScore}>{Math.round(item.score)}</Text>
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

        {historico.length > 0 && (
          <>
            <View style={styles.chart}>
              <LineChart
                data={chartData}
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
                curved
              />
            </View>
            <FlatList
              data={historico}
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
  chart: { backgroundColor: Colors.surface, borderRadius: 12, padding: 12, overflow: 'hidden' },
  card: { backgroundColor: Colors.surface, borderRadius: 8, padding: 12, marginBottom: 8, gap: 8 },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardDate: { color: Colors.textMuted, fontSize: Typography.size.sm },
  cardScore: { color: Colors.text, fontSize: Typography.size.lg, fontWeight: '700' },
});
