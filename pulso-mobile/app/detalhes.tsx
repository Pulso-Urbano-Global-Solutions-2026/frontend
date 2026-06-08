import { Linking, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';

// ─── DT-01: Score classifier visual ruler ────────────────────────────────────

const SCORE_RANGES = [
  { label: '0–39',   desc: 'CRÍTICO', color: Colors.critico,  flex: 40 },
  { label: '40–59',  desc: 'RUIM',    color: Colors.ruim,     flex: 20 },
  { label: '60–79',  desc: 'MODERADO',color: Colors.moderado, flex: 20 },
  { label: '80–100', desc: 'BOM',     color: Colors.bom,      flex: 21 },
];

function ScoreRuler() {
  return (
    <View style={styles.ruler}>
      <View style={styles.rulerBar}>
        {SCORE_RANGES.map((r) => (
          <View key={r.label} style={[styles.rulerSegment, { flex: r.flex, backgroundColor: r.color + '33', borderColor: r.color }]}>
            <View style={[styles.rulerFill, { backgroundColor: r.color }]} />
          </View>
        ))}
      </View>
      <View style={styles.rulerLabels}>
        {SCORE_RANGES.map((r) => (
          <View key={r.label} style={[styles.rulerLabelCol, { flex: r.flex }]}>
            <Text style={[styles.rulerRange, { color: r.color }]}>{r.label}</Text>
            <Text style={[styles.rulerDesc,  { color: r.color }]}>{r.desc}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ─── DT-02: Clickable data source cards ──────────────────────────────────────

const DATA_SOURCES = [
  {
    name: 'Sentinel-5P',
    org: 'ESA / Copernicus',
    desc: 'Cobertura global diária, canal TROPOMI, dados abertos.',
    url: 'https://www.esa.int/Applications/Observing_the_Earth/Copernicus/Sentinel-5P',
    icon: 'planet-outline' as const,
  },
  {
    name: 'ECOSTRESS',
    org: 'NASA / ISS',
    desc: 'Imageamento infravermelho termal de alta resolução (70 m), via AppEEARS.',
    url: 'https://ecostress.jpl.nasa.gov/',
    icon: 'thermometer-outline' as const,
  },
  {
    name: 'Open-Meteo',
    org: 'Open-Meteo.com',
    desc: 'Fallback de temperatura do ar, gratuito e sem autenticação.',
    url: 'https://open-meteo.com/',
    icon: 'cloud-outline' as const,
  },
];

function SourceCard({ name, org, desc, url, icon }: typeof DATA_SOURCES[number]) {
  return (
    <TouchableOpacity
      style={styles.sourceCard}
      onPress={() => void Linking.openURL(url)}
      accessibilityRole="link"
      accessibilityLabel={`Abrir ${name} em um navegador`}
    >
      <View style={styles.sourceIcon}>
        <Ionicons name={icon} size={22} color={Colors.cyan} />
      </View>
      <View style={styles.sourceBody}>
        <Text style={styles.sourceName}>{name}</Text>
        <Text style={styles.sourceOrg}>{org}</Text>
        <Text style={styles.sourceDesc}>{desc}</Text>
      </View>
      <Ionicons name="open-outline" size={16} color={Colors.textDim} />
    </TouchableOpacity>
  );
}

// ─── Main screen ─────────────────────────────────────────────────────────────

export default function DetalhesScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>O que é NO₂?</Text>
          <Text style={styles.sectionBody}>
            Dióxido de nitrogênio produzido por veículos e indústrias. Limite OMS: 25 ppb.
            Exposição crônica causa irritação respiratória, piora de asma e risco cardiovascular.
            Medido pelo satélite Sentinel-5P com cobertura diária e resolução de 3,5 km.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>O que é temperatura de superfície?</Text>
          <Text style={styles.sectionBody}>
            Mede o calor do solo e do asfalto — não do ar. O asfalto pode ser 10–20 °C mais quente
            que áreas verdes, criando ilhas de calor. Medido pelo satélite ECOSTRESS (70 m de resolução).
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Como calculamos o score?</Text>
          <Text style={styles.sectionBody}>
            Combinamos NO₂ (60% do peso) e temperatura de superfície (40%) em um índice de 0 a 100:
          </Text>
          {/* DC-05: fórmula em bloco de código estilizado */}
          <View style={styles.codeBlock}>
            <Text style={styles.codeComment}>{'// parcela ar'}</Text>
            <Text style={styles.codeLine}>
              ar{'  '}<Text style={styles.codeOp}>=</Text>{' (1 − NO₂ / 50) × 60'}
            </Text>
            <Text style={[styles.codeComment, { marginTop: 8 }]}>{'// parcela calor'}</Text>
            <Text style={styles.codeLine}>
              {'cal '}<Text style={styles.codeOp}>=</Text>{' (1 − max(0, Temp − 30) / 20) × 40'}
            </Text>
            <View style={styles.codeDivider} />
            <Text style={styles.codeLine}>
              <Text style={styles.codeKeyword}>score</Text>
              {'  '}<Text style={styles.codeOp}>=</Text>{' ar + cal'}
            </Text>
          </View>
          <Text style={[styles.sectionBody, { marginTop: 12, marginBottom: 8 }]}>
            Classificação visual:
          </Text>
          <ScoreRuler />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fontes de dados</Text>
          {DATA_SOURCES.map((s) => <SourceCard key={s.name} {...s} />)}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sobre o projeto</Text>
          <Text style={styles.sectionBody}>
            Pulso Urbano foi desenvolvido como Global Solution 2026/1 da FIAP. O objetivo é democratizar
            o acesso a dados orbitais de qualidade do ar e temperatura, transformando informações
            científicas em recomendações práticas para cidadãos de São Paulo.
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: Colors.bg },
  content: { padding: 20, gap: 12 },

  section:      {
    backgroundColor: Colors.surface, borderRadius: 12,
    padding: 16, borderWidth: 1, borderColor: Colors.border,
  },
  sectionTitle: { fontFamily: Typography.font.heading, fontSize: Typography.size.lg, color: Colors.text, marginBottom: 10 },
  sectionBody:  { fontFamily: Typography.font.body, fontSize: Typography.size.md, color: Colors.textMuted, lineHeight: 24 },

  // Score ruler
  ruler:         { gap: 8 },
  rulerBar:      { flexDirection: 'row', height: 8, borderRadius: 4, overflow: 'hidden', gap: 2 },
  rulerSegment:  { borderRadius: 4, overflow: 'hidden', borderWidth: 0 },
  rulerFill:     { flex: 1 },
  rulerLabels:   { flexDirection: 'row' },
  rulerLabelCol: { alignItems: 'center', paddingTop: 4 },
  rulerRange:    { fontFamily: Typography.font.mono, fontSize: 9, lineHeight: 12 },
  rulerDesc:     { fontFamily: Typography.font.subheading, fontSize: 9, lineHeight: 12 },

  // DC-05: code block
  codeBlock:   {
    backgroundColor: Colors.bg, borderRadius: 8,
    borderWidth: 1, borderColor: Colors.border,
    padding: 14, marginTop: 12, gap: 4,
  },
  codeComment: { fontFamily: Typography.font.mono, fontSize: 12, color: Colors.textDim },
  codeLine:    { fontFamily: Typography.font.mono, fontSize: 13, color: Colors.text, lineHeight: 20 },
  codeOp:      { color: Colors.cyan },
  codeKeyword: { color: Colors.bom },
  codeDivider: { height: 1, backgroundColor: Colors.border, marginVertical: 6 },

  // Source cards
  sourceCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 12,
    borderTopWidth: 1, borderTopColor: Colors.border,
  },
  sourceIcon: {
    width: 40, height: 40,
    backgroundColor: Colors.cyanDim,
    borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  sourceBody:  { flex: 1, gap: 2 },
  sourceName:  { fontFamily: Typography.font.subheading, fontSize: Typography.size.md, color: Colors.text },
  sourceOrg:   { fontFamily: Typography.font.mono, fontSize: Typography.size.xs, color: Colors.textDim },
  sourceDesc:  { fontFamily: Typography.font.body, fontSize: Typography.size.xs, color: Colors.textMuted, lineHeight: 16 },
});
