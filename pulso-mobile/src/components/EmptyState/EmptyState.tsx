import React from 'react';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';

interface Props { icon: string; message: string; style?: ViewStyle; }

export default function EmptyState({ icon, message, style }: Props) {
  return (
    <View style={[styles.container, style]}>
      <Ionicons name={icon as any} size={48} color={Colors.textDim} />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  message: { color: Colors.textMuted, fontSize: Typography.size.md, textAlign: 'center', marginTop: 12 },
});
