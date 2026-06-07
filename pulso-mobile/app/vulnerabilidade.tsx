import { useCallback, useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
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

const EMOJI: Record<UrgenciaVulnerabilidade, string> = {
  CRITICA: '🔴', ALTA: '🟠', MODERADA: '🟡', BAIXA: '🟢',
};

function MetricItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.metricItem}>
      <Text style={s.metricValue}>{value}</Text>
      <Text style={s.metricLabel}>{label}</Text>
    </View>
  );
}

function ZonaCard({ zona }: { zona: VulnerabilidadeZona }) {
  const cfg = CFG[zona.urgencia];
  return (
    <View style={[s.card, { borderColor: cfg.cor, backgroundColor: cfg.fundo }]}>
      <View style={s.cardHeader}>
        <Text style={s.emoji}>{EMOJI[zona.urgencia]}</Text>
        <View style={s.cardTitulos}>
          <Text style={s.zonaNome}>{zona.zonaNome}</Text>
          <View style={[s.badge, { backgroundColor: cfg.cor + '22', borderColor: cfg.cor }]}>
            <Text style={[s.badgeText, { color: cfg.cor }]}>{cfg.label}</Text>
          </View>
        </View>
        <Text style={[s.indice, { color: cfg.cor }]}>{zona.indiceVulnerabilidade.toFixed(0)}</Text>
      </View>
      <Text style={s.descricao}>{zona.descricaoUrgencia}</Text>
      <View style={s.grid}>
        <MetricItem label="Score ambiental" value={`${zona.scoreAmbiental.toFixed(0)}/100`} />
        <MetricItem label="População" value={`${(zona.populacaoTotal / 1_000_000).toFixed(1)}M`} />
        <MetricItem label="Idosos (60+)" value={`${zona.percentualIdosos.toFixed(1)}%`} />
        <MetricItem label="Crianças" value={`${zona.percentualCriancas.toFixed(1)}%`} />
      </View>
    </View>
  );
}

export default function VulnerabilidadeScreen() {
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

        <View style={s.legenda}>
          {(['CRITICA','ALTA','MODERADA','BAIXA'] as UrgenciaVulnerabilidade[]).map((u) => (
            <View key={u} style={s.legendaItem}>
              <Text>{EMOJI[u]}</Text>
              <Text style={[s.legendaLabel, { color: CFG[u].cor }]}>{CFG[u].label}</Text>
            </View>
          ))}
        </View>

        {loading && <LoadingSkeleton rows={5} />}
        {!loading && error && <ErrorState message={error} onRetry={load} />}
        {!loading && !error && zonas.map((z) => <ZonaCard key={z.zonaId} zona={z} />)}

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
  titulo:      { fontSize: Typography.size.xl, fontWeight: '700', color: Colors.text },
  sub:         { fontSize: Typography.size.sm, color: Colors.textMuted, lineHeight: 20 },
  fonte:       { fontSize: Typography.size.xs, color: Colors.textDim },
  legenda:     { flexDirection: 'row', gap: 12, flexWrap: 'wrap',
                  paddingVertical: 8, borderTopWidth: 1, borderBottomWidth: 1, borderColor: Colors.border },
  legendaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendaLabel:{ fontSize: Typography.size.xs, fontWeight: '600' },
  card:        { borderWidth: 1, borderRadius: 12, padding: 14, gap: 10 },
  cardHeader:  { flexDirection: 'row', alignItems: 'center', gap: 10 },
  emoji:       { fontSize: 24 },
  cardTitulos: { flex: 1, gap: 4 },
  zonaNome:    { fontSize: Typography.size.md, fontWeight: '700', color: Colors.text },
  badge:       { alignSelf: 'flex-start', borderWidth: 1, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  badgeText:   { fontSize: Typography.size.xs, fontWeight: '700', letterSpacing: 0.5 },
  indice:      { fontSize: 28, fontWeight: '800', lineHeight: 32 },
  descricao:   { fontSize: Typography.size.sm, color: Colors.textMuted, lineHeight: 18 },
  grid:        { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  metricItem:  { flex: 1, minWidth: '40%', backgroundColor: Colors.surface,
                  borderRadius: 8, padding: 10, alignItems: 'center' },
  metricValue: { fontSize: Typography.size.md, fontWeight: '700', color: Colors.text },
  metricLabel: { fontSize: Typography.size.xs, color: Colors.textMuted, marginTop: 2, textAlign: 'center' },
  metodologia: { fontSize: Typography.size.xs, color: Colors.textDim, textAlign: 'center',
                  lineHeight: 18, borderTopWidth: 1, borderColor: Colors.border, paddingTop: 12 },
});
