import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import type { RecomendacaoResponse } from '@/types/api.types';
import { getRecomendacaoIcon } from '@/utils/scoreUtils';

const ICON_COLOR = { success: Colors.bom, warning: Colors.moderado, error: Colors.critico } as const;

interface Props { recomendacao: RecomendacaoResponse; }

export default function RecomendacaoCard({ recomendacao }: Props) {
  const iconColor = ICON_COLOR[recomendacao.icone];
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Ionicons name={getRecomendacaoIcon(recomendacao.icone)} size={24} color={iconColor} />
        <Text style={styles.text}>{recomendacao.texto}</Text>
      </View>
      {recomendacao.personalizadaPara.length > 0 && (
        <View style={styles.tags}>
          {recomendacao.personalizadaPara.map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag.replace(/_/g, ' ')}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: Colors.surface, borderColor: Colors.border, borderWidth: 1, borderRadius: 12, padding: 16 },
  row: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  text: { flex: 1, color: Colors.text, fontSize: Typography.size.md, lineHeight: 22 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  tag: { backgroundColor: Colors.surface2, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  tagText: { color: Colors.textMuted, fontSize: Typography.size.xs },
});
