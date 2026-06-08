import { useEffect, useState } from 'react';
import { RefreshControl, SafeAreaView, ScrollView, StyleSheet,
         Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
import { formatDate } from '@/utils/dateUtils';

// Temperatura de superfície acima deste limite → alerta de pet
const TEMP_LIMITE_PET = 35;

// Chave SecureStore — deve ser idêntica à usada em perfil.tsx
const petKey = (id: number) => `pulso_tem_pet_${id}`;

export default function HomeScreen() {
  const { userId } = useAuthContext();
  const { data, loading, error, refetch } = useScore();
  const rec = useRecomendacao(data?.scoreId ?? null, userId);
  const router = useRouter();

  const [temPet, setTemPet] = useState(false);

  // Lê a preferência de pet do SecureStore (mesma chave que perfil.tsx salva)
  useEffect(() => {
    if (!userId) return;
    SecureStore.getItemAsync(petKey(userId))
      .then((val) => setTemPet(val === 'true'))
      .catch(() => {}); // silencia — não quebra a home se falhar
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

  // Alerta de pet ativo: usuário tem pet + temperatura acima do limite
  const petAlertaAtivo =
    temPet &&
    data !== null &&
    data.tempSuperficieC >= TEMP_LIMITE_PET;

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
          <Text style={styles.headerCity}>São Paulo</Text>
        </View>

        {loading && !data && <LoadingSkeleton rows={5} />}
        {!loading && error && <ErrorState message={error} onRetry={refetch} />}

        {data && (
          <>
            <ScoreGauge score={data.score} classificacao={data.classificacao} />
            <ClassificacaoBadge classificacao={data.classificacao} size="md" />

            {/* Métricas brutas */}
            <LinearGradient
              colors={[Colors.surface, Colors.bg]}
              style={styles.metrics}
            >
              <View style={styles.metricItem}>
                <Ionicons name="cloud-outline" size={16} color={Colors.textDim} style={styles.metricIcon} />
                <Text style={styles.metricValue}>{data.no2Ppb.toFixed(1)}</Text>
                <Text style={styles.metricLabel}>NO₂ (ppb)</Text>
              </View>
              <View style={styles.metricDivider} />
              <View style={styles.metricItem}>
                <Ionicons name="thermometer-outline" size={16} color={Colors.textDim} style={styles.metricIcon} />
                <Text style={styles.metricValue}>{data.tempSuperficieC.toFixed(1)}</Text>
                <Text style={styles.metricLabel}>Temp. sup. (°C)</Text>
              </View>
            </LinearGradient>

            {/* ── Alerta de pet ─────────────────────────────────── */}
            {petAlertaAtivo && (
              <View style={styles.petAlerta}>
                <Text style={styles.petAlertaIcon}>🐾</Text>
                <View style={styles.petAlertaBody}>
                  <Text style={styles.petAlertaTitulo}>Atenção com seu pet</Text>
                  <Text style={styles.petAlertaTexto}>
                    A temperatura do asfalto está em{' '}
                    <Text style={styles.petAlertaTemp}>
                      {data.tempSuperficieC.toFixed(0)}°C
                    </Text>
                    . Patas queimam em superfícies acima de 35°C.{'\n'}
                    Prefira passeios antes das 10h ou após as 18h.
                  </Text>
                </View>
              </View>
            )}
            {/* ───────────────────────────────────────────────────── */}

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
  safe:        { flex: 1, backgroundColor: Colors.bg },
  content:     { flexGrow: 1, padding: 20, gap: 16, alignItems: 'center' },
  headerRow:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' },
  headerCity:  { fontFamily: Typography.font.mono, fontSize: Typography.size.xs, color: Colors.textDim, letterSpacing: 2 },
  metrics:      {
    flexDirection: 'row', width: '100%',
    borderRadius: 12, borderWidth: 1, borderColor: Colors.border,
    overflow: 'hidden',
  },
  metricItem:   { flex: 1, alignItems: 'center', paddingVertical: 14 },
  metricIcon:   { marginBottom: 4 },
  metricDivider:{ width: 1, backgroundColor: Colors.border, marginVertical: 10 },
  metricValue:  {
    fontFamily: Typography.font.mono,
    fontSize: Typography.size.lg,
    color: Colors.text,
  },
  metricLabel:  {
    fontFamily: Typography.font.body,
    fontSize: Typography.size.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  recSkeleton:  { width: '100%' },
  recError:     { color: Colors.textMuted, fontSize: Typography.size.sm, textAlign: 'center' },
  fonte:        { color: Colors.textDim, fontSize: Typography.size.xs, textAlign: 'center', marginTop: 8 },
  detalhesBtn:  {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 10, paddingHorizontal: 16,
    backgroundColor: Colors.surface, borderRadius: 8, borderWidth: 1, borderColor: Colors.border,
  },
  detalhesBtnText: { color: Colors.textMuted, fontSize: Typography.size.sm },

  // ── Pet alert card ────────────────────────────────────────────────
  petAlerta: {
    width: '100%', flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    backgroundColor: '#1a1600',          // fundo âmbar escuro
    borderWidth: 1, borderColor: Colors.moderado,
    borderRadius: 12, padding: 14,
  },
  petAlertaIcon:   { fontSize: 26, lineHeight: 32 },
  petAlertaBody:   { flex: 1, gap: 4 },
  petAlertaTitulo: { color: Colors.moderado, fontWeight: '700', fontSize: Typography.size.md },
  petAlertaTexto:  { color: Colors.textMuted, fontSize: Typography.size.sm, lineHeight: 20 },
  petAlertaTemp:   { color: Colors.moderado, fontWeight: '700' },
});
