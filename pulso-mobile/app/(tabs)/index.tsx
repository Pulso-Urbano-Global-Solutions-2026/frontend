import { RefreshControl, SafeAreaView, ScrollView, StyleSheet, Text } from 'react-native';
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

            {rec.loading && <LoadingSkeleton rows={2} style={styles.recSkeleton} />}
            {rec.data && <RecomendacaoCard recomendacao={rec.data} />}
            {rec.error && <Text style={styles.recError}>{rec.error}</Text>}

            <Text style={styles.fonte}>
              Fonte: {data.fonteDadoNo2} · {formatDate(data.dtDadoOrbital)}
            </Text>
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
  recSkeleton: { width: '100%' },
  recError: { color: Colors.textMuted, fontSize: Typography.size.sm, textAlign: 'center' },
  fonte: { color: Colors.textDim, fontSize: Typography.size.xs, textAlign: 'center', marginTop: 8 },
});
