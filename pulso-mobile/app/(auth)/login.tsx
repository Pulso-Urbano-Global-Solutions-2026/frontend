import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthContext } from '@/contexts/AuthContext';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';

export default function LoginScreen() {
  const { login } = useAuthContext();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email || !senha) { setError('Preencha e-mail e senha'); return; }
    setLoading(true); setError(null);
    try {
      await login({ email, senha });
      // auth guard do root layout redireciona para (tabs)
    } catch (err: any) {
      setError(err?.response?.data?.erro ?? err?.message ?? 'Erro ao fazer login');
    } finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Pulso Urbano</Text>
        <Text style={styles.subtitle}>Saúde ambiental em tempo real</Text>

        <TextInput style={styles.input} placeholder="E-mail" placeholderTextColor={Colors.textDim}
          value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
        <TextInput style={styles.input} placeholder="Senha" placeholderTextColor={Colors.textDim}
          value={senha} onChangeText={setSenha} secureTextEntry />

        {error && <Text style={styles.error}>{error}</Text>}

        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
          {loading ? <ActivityIndicator color={Colors.bg} /> : <Text style={styles.buttonText}>Entrar</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
          <Text style={styles.link}>Não tem conta? Cadastre-se</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.bg },
  container: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  title: { fontSize: Typography.size.xxl, fontWeight: '700', color: Colors.text, textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: Typography.size.sm, color: Colors.textMuted, textAlign: 'center', marginBottom: 40 },
  input: { backgroundColor: Colors.surface, borderColor: Colors.border, borderWidth: 1, borderRadius: 8, padding: 14, color: Colors.text, fontSize: Typography.size.md, marginBottom: 12 },
  error: { color: Colors.critico, fontSize: Typography.size.sm, marginBottom: 12, textAlign: 'center' },
  button: { backgroundColor: Colors.bom, borderRadius: 8, padding: 14, alignItems: 'center', marginBottom: 16 },
  buttonText: { color: Colors.bg, fontWeight: '700', fontSize: Typography.size.md },
  link: { color: Colors.textMuted, fontSize: Typography.size.sm, textAlign: 'center' },
});
