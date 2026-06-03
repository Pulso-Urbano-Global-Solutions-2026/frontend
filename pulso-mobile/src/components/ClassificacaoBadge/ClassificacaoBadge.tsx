import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import type { ClassificacaoScore } from '@/types/score.types';
import { getClassificacaoColor, getClassificacaoIcon, getClassificacaoLabel } from '@/utils/scoreUtils';

const DIM: Record<ClassificacaoScore, string> = {
  BOM: Colors.bomDim, MODERADO: Colors.moderadoDim, RUIM: Colors.ruimDim, CRITICO: Colors.criticoDim,
};

interface Props { classificacao: ClassificacaoScore; size?: 'sm' | 'md'; }

export default function ClassificacaoBadge({ classificacao, size = 'md' }: Props) {
  const color = getClassificacaoColor(classificacao);
  const iconSize = size === 'sm' ? 14 : 16;
  const fontSize = size === 'sm' ? 12 : 14;
  return (
    <View style={[styles.pill, { backgroundColor: DIM[classificacao] }]}>
      <Ionicons name={getClassificacaoIcon(classificacao)} size={iconSize} color={color} />
      <Text style={[styles.label, { color, fontSize }]}>{getClassificacaoLabel(classificacao)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  label: { fontWeight: '600' },
});
