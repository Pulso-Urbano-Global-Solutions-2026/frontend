import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';

interface Props { message: string; onRetry: () => void; style?: ViewStyle; }

export default function ErrorState({ message, onRetry, style }: Props) {
  return (
    <View style={[styles.container, style]}>
      <Ionicons name="cloud-offline-outline" size={48} color={Colors.critico} />
      <Text style={styles.message}>{message}</Text>
      <TouchableOpacity style={styles.button} onPress={onRetry}>
        <Text style={styles.buttonText}>Tentar novamente</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  message: { color: Colors.textMuted, fontSize: Typography.size.md, textAlign: 'center', marginTop: 12, maxWidth: 260 },
  button: { backgroundColor: Colors.surface2, borderRadius: 8, paddingHorizontal: 20, paddingVertical: 10, marginTop: 16 },
  buttonText: { color: Colors.text, fontSize: Typography.size.md },
});
