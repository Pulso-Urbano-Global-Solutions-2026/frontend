import { RefreshControl, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
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
import { formatDate } from '@/utils/dateUtils';

export default function HomeScreen() {
  const { userId } = useAuthContext();
  const { data, loading, error, refetch } = useScore();
  const rec = useRecomendacao(data?.scoreId ?? null, userId);
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refetch} tintColor={Colors.bom} />}
      >
        <Text style={styles.header}>Pulso Urbano · São Paulo</Text>

        {loading && !data && <LoadingSkeleton rows={5} />}
        {!loading && error && <ErrorState message={error} onRetry={refetch} />}

        {data && (
          <>
            <ScoreGauge score={data.score} classificacao={data.classificacao} />
            <ClassificacaoBadge classificacao={data.classificacao} size="md" />

            {/* Métricas brutas */}
            <View style={styles.metrics}>
              <View style={styles.metricItem}>
                <Text style={styles.metricValue}>{data.no2Ppb.toFixed(1)}</Text>
                <Text style={styles.metricLabel}>NO₂ (ppb)</Text>
              </View>
              <View style={styles.metricDivider} />
              <View style={styles.metricItem}>
                <Text style={styles.metricValue}>{data.tempSuperficieC.toFixed(1)}</Text>
                <Text style={styles.metricLabel}>Temp. sup. (°C)</Text>
              </View>
            </View>

            {rec.loading && <LoadingSkeleton rows={2} style={styles.recSkeleton} />}
            {rec.data && <RecomendacaoCard recomendacao={rec.data} />}
            {rec.error && <Text style={styles.recError}>{rec.error}</Text>}

            <Text style={styles.fonte}>
              Fonte: {data.fonteDadoNo2} · {formatDate(data.dtDadoOrbital)}
            </Text>

            <TouchableOpacity style={styles.detalhesBtn} onPress={() => router.push('/detalhes')}>
              <Text style={styles.detalhesBtnText}>Entender os dados</Text>
              <Ionicons name="information-circle-outline" size={16} color={Colors.textMuted} />
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  content: { flexGrow: 1, padding: 20, gap: 16, alignItems: 'center' },
  header: { color: Colors.textMuted, fontSize: Typography.size.sm, alignSelf: 'flex-start' },
  metrics: {
    flexDirection: 'row', width: '100%',
    backgroundColor: Colors.surface, borderRadius: 12, borderWidth: 1, borderColor: Colors.border,
  },
  metricItem: { flex: 1, alignItems: 'center', paddingVertical: 14 },
  metricDivider: { width: 1, backgroundColor: Colors.border, marginVertical: 10 },
  metricValue: { fontSize: Typography.size.lg, fontWeight: '700', color: Colors.text },
  metricLabel: { fontSize: Typography.size.xs, color: Colors.textMuted, marginTop: 2 },
  recSkeleton: { width: '100%' },
  recError: { color: Colors.textMuted, fontSize: Typography.size.sm, textAlign: 'center' },
  fonte: { color: Colors.textDim, fontSize: Typography.size.xs, textAlign: 'center', marginTop: 8 },
  detalhesBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 10, paddingHorizontal: 16,
    backgroundColor: Colors.surface, borderRadius: 8, borderWidth: 1, borderColor: Colors.border,
  },
  detalhesBtnText: { color: Colors.textMuted, fontSize: Typography.size.sm },
});
