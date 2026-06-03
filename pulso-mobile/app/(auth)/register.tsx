import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthContext } from '@/contexts/AuthContext';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';

export default function RegisterScreen() {
  const { register } = useAuthContext();
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [fazExercicio, setFazExercicio] = useState(false);
  const [temCrianca, setTemCrianca] = useState(false);
  const [temProblema, setTemProblema] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async () => {
    if (!nome || !email || !senha) { setError('Preencha todos os campos obrigatórios'); return; }
    setLoading(true); setError(null);
    try {
      await register({ nome, email, senha, fazExercicio, temCrianca, temProblemaResp: temProblema });
      // AuthContext faz auto-login → auth guard redireciona para (tabs)
    } catch (err: any) {
      setError(err?.response?.data?.erro ?? err?.message ?? 'Erro ao cadastrar');
    } finally { setLoading(false); }
  };

  const Row = ({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) => (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Switch value={value} onValueChange={onChange} trackColor={{ true: Colors.bom, false: Colors.border }} />
    </View>
  );

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Criar conta</Text>

        <TextInput style={styles.input} placeholder="Nome" placeholderTextColor={Colors.textDim} value={nome} onChangeText={setNome} />
        <TextInput style={styles.input} placeholder="E-mail" placeholderTextColor={Colors.textDim} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
        <TextInput style={styles.input} placeholder="Senha" placeholderTextColor={Colors.textDim} value={senha} onChangeText={setSenha} secureTextEntry />

        <Row label="Pratico exercícios regularmente" value={fazExercicio} onChange={setFazExercicio} />
        <Row label="Tenho crianças em casa" value={temCrianca} onChange={setTemCrianca} />
        <Row label="Tenho problema respiratório" value={temProblema} onChange={setTemProblema} />

        {error && <Text style={styles.error}>{error}</Text>}

        <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
          {loading ? <ActivityIndicator color={Colors.bg} /> : <Text style={styles.buttonText}>Cadastrar</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.link}>Já tem conta? Entrar</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.bg },
  container: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  title: { fontSize: Typography.size.xl, fontWeight: '700', color: Colors.text, marginBottom: 24 },
  input: { backgroundColor: Colors.surface, borderColor: Colors.border, borderWidth: 1, borderRadius: 8, padding: 14, color: Colors.text, fontSize: Typography.size.md, marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.border },
  rowLabel: { flex: 1, color: Colors.text, fontSize: Typography.size.md, marginRight: 12 },
  error: { color: Colors.critico, fontSize: Typography.size.sm, marginVertical: 12, textAlign: 'center' },
  button: { backgroundColor: Colors.bom, borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 16, marginBottom: 16 },
  buttonText: { color: Colors.bg, fontWeight: '700', fontSize: Typography.size.md },
  link: { color: Colors.textMuted, fontSize: Typography.size.sm, textAlign: 'center' },
});
