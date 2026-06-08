import { useCallback, useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/Button/Button';
import ErrorState from '@/components/ErrorState/ErrorState';
import LoadingSkeleton from '@/components/LoadingSkeleton/LoadingSkeleton';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { getZonasPorUrgencia } from '@/services/vulnerabilidadeService';
import type { UrgenciaVulnerabilidade, VulnerabilidadeZona } from '@/types/vulnerabilidade.types';

const CFG: Record<UrgenciaVulnerabilidade, { cor: string; fundo: string; label: string }> = {
  CRITICA:  { cor: Colors.critico,  fundo: Colors.criticoDim,  label: 'CRÍTICA'  },
  ALTA:     { cor: Colors.ruim,     fundo: Colors.ruimDim,     label: 'ALTA'     },
  MODERADA: { cor: Colors.moderado, fundo: Colors.moderadoDim, label: 'MODERADA' },
  BAIXA:    { cor: Colors.bom,      fundo: Colors.bomDim,      label: 'BAIXA'    },
};

// Ionicons em vez de emojis — mais consistente com o restante do app
const ICON: Record<UrgenciaVulnerabilidade, keyof typeof Ionicons.glyphMap> = {
  CRITICA:  'warning',
  ALTA:     'alert-circle',
  MODERADA: 'information-circle',
  BAIXA:    'checkmark-circle',
};

function MetricItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.metricItem}>
      <Text style={s.metricValue}>{value}</Text>
      <Text style={s.metricLabel}>{label}</Text>
    </View>
  );
}

function ZonaCard({ zona, onVerMapa }: { zona: VulnerabilidadeZona; onVerMapa: () => void }) {
  const cfg    = CFG[zona.urgencia];
  const indice = zona.indiceVulnerabilidade;
  const popM   = (zona.populacaoTotal / 1_000_000).toFixed(1);

  return (
    <View style={[s.card, { borderColor: cfg.cor, backgroundColor: cfg.fundo }]}>
      <View style={s.cardHeader}>
        <Ionicons name={ICON[zona.urgencia]} size={22} color={cfg.cor} />
        <View style={s.cardTitulos}>
          <Text style={s.zonaNome}>{zona.zonaNome}</Text>
          <View style={[s.badge, { backgroundColor: cfg.cor + '22', borderColor: cfg.cor }]}>
            <Text style={[s.badgeText, { color: cfg.cor }]}>{cfg.label}</Text>
          </View>
        </View>
        {/* HV-03: chip de índice com cor + "/ 100" */}
        <View style={[s.scoreChip, { backgroundColor: cfg.cor + '1a', borderColor: cfg.cor }]}>
          <Text style={[s.scoreChipNum, { color: cfg.cor }]}>{indice.toFixed(0)}</Text>
          <Text style={[s.scoreChipSlash, { color: cfg.cor }]}>/100</Text>
        </View>
      </View>
      {/* HV-03: pessoas em risco */}
      <Text style={[s.pessoasRisco, { color: cfg.cor }]}>
        {popM}M pessoas em área de risco {cfg.label.toLowerCase()}
      </Text>

      {/* Barra de progresso do índice — torna o número comparável entre zonas */}
      <View style={s.progressTrack}>
        <View style={[s.progressBar, { width: `${Math.min(100, indice)}%` as unknown as number, backgroundColor: cfg.cor }]} />
      </View>

      <Text style={s.descricao}>{zona.descricaoUrgencia}</Text>

      <View style={s.grid}>
        <MetricItem label="Score ambiental" value={`${zona.scoreAmbiental.toFixed(0)}/100`} />
        <MetricItem label="População"       value={`${(zona.populacaoTotal / 1_000_000).toFixed(1)}M`} />
        <MetricItem label="Idosos (60+)"    value={`${zona.percentualIdosos.toFixed(1)}%`} />
        <MetricItem label="Crianças"        value={`${zona.percentualCriancas.toFixed(1)}%`} />
      </View>

      {/* Ação: ver zona no mapa */}
      <Button label="Ver no mapa" onPress={onVerMapa} variant="ghost" size="sm" />
    </View>
  );
}

export default function VulnerabilidadeScreen() {
  const router = useRouter();
  const [zonas, setZonas]     = useState<VulnerabilidadeZona[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try { setZonas(await getZonasPorUrgencia()); }
    catch (e: unknown) {
      const err = e as { response?: { data?: { erro?: string } }; message?: string };
      setError(err?.response?.data?.erro ?? err?.message ?? 'Erro ao carregar');
    }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.content}>
        <Text style={s.titulo}>Vulnerabilidade por Bairro</Text>
        <Text style={s.sub}>
          Score ambiental (Sentinel-5P) + dados demográficos IBGE Censo 2022.{'\n'}
          Mostra onde o ar ruim afeta mais pessoas vulneráveis.
        </Text>
        <Text style={s.fonte}>Fonte: ESA Copernicus · IBGE 2022</Text>

        {/* Legenda com ícones Ionicons */}
        <View style={s.legenda}>
          {(['CRITICA','ALTA','MODERADA','BAIXA'] as UrgenciaVulnerabilidade[]).map((u) => (
            <View key={u} style={s.legendaItem}>
              <Ionicons name={ICON[u]} size={16} color={CFG[u].cor} />
              <Text style={[s.legendaLabel, { color: CFG[u].cor }]}>{CFG[u].label}</Text>
            </View>
          ))}
        </View>

        {loading && <LoadingSkeleton rows={5} />}
        {!loading && error && <ErrorState message={error} onRetry={load} />}
        {!loading && !error && zonas.map((z) => (
          <ZonaCard
            key={z.zonaId}
            zona={z}
            onVerMapa={() => router.push('/(tabs)/mapa')}
          />
        ))}

        {!loading && !error && zonas.length > 0 && (
          <Text style={s.metodologia}>
            Índice = risco ambiental (60%) + peso demográfico (40%).{'\n'}
            % idosos × 0.40 + % crianças × 0.35 + densidade × 0.25.
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: Colors.bg },
  content:     { padding: 16, gap: 12 },
  titulo:      { fontFamily: Typography.font.heading, fontSize: Typography.size.xl, color: Colors.text },
  sub:         { fontFamily: Typography.font.body, fontSize: Typography.size.sm, color: Colors.textMuted, lineHeight: 20 },
  fonte:       { fontFamily: Typography.font.mono, fontSize: Typography.size.xs, color: Colors.textDim },
  legenda:     {
    flexDirection: 'row', gap: 12, flexWrap: 'wrap',
    paddingVertical: 8, borderTopWidth: 1, borderBottomWidth: 1, borderColor: Colors.border,
  },
  legendaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendaLabel:{ fontFamily: Typography.font.subheading, fontSize: Typography.size.xs },
  card:        { borderWidth: 1, borderRadius: 12, padding: 14, gap: 10 },
  cardHeader:  { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cardTitulos: { flex: 1, gap: 4 },
  zonaNome:    { fontFamily: Typography.font.heading, fontSize: Typography.size.md, color: Colors.text },
  badge:       { alignSelf: 'flex-start', borderWidth: 1, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  badgeText:   { fontFamily: Typography.font.subheading, fontSize: Typography.size.xs, letterSpacing: 0.5 },
  // HV-03: score chip
  scoreChip:      {
    alignItems: 'center', justifyContent: 'center',
    borderRadius: 10, borderWidth: 1, padding: 8, minWidth: 56,
  },
  scoreChipNum:   { fontFamily: Typography.font.mono, fontSize: 22, lineHeight: 24, fontWeight: '700' },
  scoreChipSlash: { fontFamily: Typography.font.mono, fontSize: 10, opacity: 0.7 },
  pessoasRisco:   { fontFamily: Typography.font.body, fontSize: Typography.size.xs, opacity: 0.85 },
  progressTrack:{ height: 4, borderRadius: 2, backgroundColor: Colors.surface2, overflow: 'hidden' },
  progressBar: { height: 4, borderRadius: 2 },
  descricao:   { fontFamily: Typography.font.body, fontSize: Typography.size.sm, color: Colors.textMuted, lineHeight: 18 },
  grid:        { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  metricItem:  {
    flex: 1, minWidth: '40%', backgroundColor: Colors.surface,
    borderRadius: 8, padding: 10, alignItems: 'center',
  },
  metricValue: { fontFamily: Typography.font.mono, fontSize: Typography.size.md, color: Colors.text },
  metricLabel: { fontFamily: Typography.font.body, fontSize: Typography.size.xs, color: Colors.textMuted, marginTop: 2, textAlign: 'center' },
  metodologia: {
    fontFamily: Typography.font.body,
    fontSize: Typography.size.xs, color: Colors.textDim,
    textAlign: 'center', lineHeight: 18,
    borderTopWidth: 1, borderColor: Colors.border, paddingTop: 12,
  },
});

