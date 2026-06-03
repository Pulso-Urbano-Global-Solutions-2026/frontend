import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';

interface Section { title: string; body: string; }

const SECTIONS: Section[] = [
  {
    title: 'O que é NO₂?',
    body: 'Dióxido de nitrogênio (NO₂) é um gás tóxico produzido principalmente por veículos e indústrias. O limite da OMS é 25 ppb. Exposição crônica causa irritação respiratória, piora da asma e risco cardiovascular. O Pulso Urbano mede o NO₂ pelo satélite Sentinel-5P (ESA), com cobertura diária e resolução de 3,5 km.',
  },
  {
    title: 'O que é temperatura de superfície?',
    body: 'A temperatura de superfície mede o calor do solo e do asfalto — não do ar. O asfalto urbano pode ser 10 a 20°C mais quente do que áreas verdes, criando ilhas de calor urbano. Medida pelo satélite ECOSTRESS (NASA/ISS) com resolução de 70 m, é um indicador de risco em ondas de calor.',
  },
  {
    title: 'Como calculamos o score?',
    body: 'score = (1 − NO₂ / 50) × 60 + (1 − max(0, Temp − 30) / 20) × 40\n\nFaixas:\n• 80–100: BOM — condições saudáveis\n• 60–79: MODERADO — atenção para grupos de risco\n• 40–59: RUIM — evite atividades ao ar livre prolongadas\n• 0–39: CRÍTICO — risco elevado para todos',
  },
  {
    title: 'Fontes de dados',
    body: '• Sentinel-5P (ESA/Copernicus): cobertura global diária, canal TROPOMI, dados abertos via API Copernicus.\n• ECOSTRESS (NASA/ISS): imageamento infravermelho termal de alta resolução, dados via AppEEARS.\n• Fallback: Open-Meteo (temperatura do ar, gratuito, sem autenticação) quando dados orbitais estão indisponíveis.',
  },
  {
    title: 'Sobre o projeto',
    body: 'Pulso Urbano foi desenvolvido como Global Solution 2026/1 da FIAP. O objetivo é democratizar o acesso a dados orbitais de qualidade do ar e temperatura, transformando informações científicas em recomendações práticas para cidadãos de São Paulo.',
  },
];

export default function DetalhesScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        {SECTIONS.map((s) => (
          <View key={s.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{s.title}</Text>
            <Text style={styles.sectionBody}>{s.body}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: 20, gap: 4 },
  section: { backgroundColor: Colors.surface, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: Colors.border, marginBottom: 12 },
  sectionTitle: { fontSize: Typography.size.lg, fontWeight: '700', color: Colors.text, marginBottom: 10 },
  sectionBody: { fontSize: Typography.size.md, color: Colors.textMuted, lineHeight: 24 },
});
