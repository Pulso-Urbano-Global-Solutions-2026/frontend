import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Página não encontrada' }} />
      <View style={styles.container}>
        <Text style={styles.title}>Tela não encontrada</Text>
        <Link href="/" style={styles.link}><Text style={styles.linkText}>Voltar ao início</Text></Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg, alignItems: 'center', justifyContent: 'center', padding: 20 },
  title: { color: Colors.text, fontSize: 20, marginBottom: 16 },
  link: {},
  linkText: { color: Colors.bom, fontSize: 16 },
});
