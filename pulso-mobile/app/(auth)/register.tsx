import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/Button/Button';
import { LogoWordmark } from '@/components/Logo/Logo';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { useAuthContext } from '@/contexts/AuthContext';

const TOGGLES = [
  {
    key: 'fazExercicio' as const,
    label: 'Pratico exercícios regularmente',
    hint: 'Personaliza recomendações de horários seguros para atividade física ao ar livre.',
  },
  {
    key: 'temCrianca' as const,
    label: 'Tenho crianças em casa',
    hint: 'Crianças são mais sensíveis à poluição — alertas mais cedo e limites mais conservadores.',
  },
  {
    key: 'temProblema' as const,
    label: 'Tenho problema respiratório',
    hint: 'Asma, DPOC e similares. Receba alertas preventivos antes do índice piorar.',
  },
];

function ToggleRow({
  label, hint, value, onChange,
}: { label: string; hint: string; value: boolean; onChange: (v: boolean) => void }) {
  const checkOpacity = useRef(new Animated.Value(0)).current;

  const handleChange = (v: boolean) => {
    onChange(v);
    if (v) {
      Animated.sequence([
        Animated.timing(checkOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.delay(800),
        Animated.timing(checkOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  };

  return (
    <View style={styles.toggleRow}>
      <View style={styles.toggleLabels}>
        <View style={styles.toggleLabelRow}>
          <Text style={styles.toggleLabel}>{label}</Text>
          <Animated.View style={{ opacity: checkOpacity }}>
            <Ionicons name="checkmark-circle" size={16} color={Colors.bom} />
          </Animated.View>
        </View>
        <Text style={styles.toggleHint}>{hint}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={handleChange}
        trackColor={{ true: Colors.bom, false: Colors.border }}
      />
    </View>
  );
}

export default function RegisterScreen() {
  const { register } = useAuthContext();
  const router = useRouter();

  const [nome, setNome]             = useState('');
  const [email, setEmail]           = useState('');
  const [senha, setSenha]           = useState('');
  const [senhaVisivel, setSenhaVisivel] = useState(false);
  const [fazExercicio, setFazExercicio] = useState(false);
  const [temCrianca, setTemCrianca]     = useState(false);
  const [temProblema, setTemProblema]   = useState(false);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const fadeIn = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fadeIn, { toValue: 1, duration: 450, useNativeDriver: true }).start();
  }, [fadeIn]);

  const handleRegister = async () => {
    if (!nome || !email || !senha) { setError('Preencha todos os campos obrigatórios'); return; }
    setLoading(true); setError(null);
    try {
      await register({ nome, email, senha, fazExercicio, temCrianca, temProblemaRespiratorio: temProblema });
    } catch (err: unknown) {
      const e = err as { response?: { data?: { mensagem?: string; erro?: string } }; message?: string };
      setError(e?.response?.data?.mensagem ?? e?.response?.data?.erro ?? e?.message ?? 'Erro ao cadastrar');
    } finally { setLoading(false); }
  };

  const borderColor = (field: string) =>
    focusedField === field ? Colors.cyan : Colors.border;

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Animated.View style={{ opacity: fadeIn }}>

          {/* Header */}
          <View style={styles.header}>
            <LogoWordmark size={36} />
            <Text style={styles.title}>Criar conta</Text>
          </View>

          {/* Campos de identidade */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Dados de acesso</Text>
            <TextInput
              style={[styles.input, { borderColor: borderColor('nome') }]}
              placeholder="Nome"
              placeholderTextColor={Colors.textDim}
              value={nome}
              onChangeText={setNome}
              onFocus={() => setFocusedField('nome')}
              onBlur={() => setFocusedField(null)}
            />
            <TextInput
              style={[styles.input, { borderColor: borderColor('email') }]}
              placeholder="E-mail"
              placeholderTextColor={Colors.textDim}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
            />
            <View style={styles.passwordWrap}>
              <TextInput
                style={[styles.input, styles.passwordInput, { borderColor: borderColor('senha') }]}
                placeholder="Senha"
                placeholderTextColor={Colors.textDim}
                value={senha}
                onChangeText={setSenha}
                secureTextEntry={!senhaVisivel}
                onFocus={() => setFocusedField('senha')}
                onBlur={() => setFocusedField(null)}
              />
              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setSenhaVisivel((v) => !v)}
                accessibilityLabel={senhaVisivel ? 'Ocultar senha' : 'Mostrar senha'}
              >
                <Ionicons
                  name={senhaVisivel ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={Colors.textMuted}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Separador */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Perfil de saúde</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Toggles com contexto */}
          <Text style={styles.profileHint}>
            Essas informações personalizam seus alertas e recomendações ambientais.
          </Text>
          {TOGGLES.map(({ key, label, hint }) => (
            <ToggleRow
              key={key}
              label={label}
              hint={hint}
              value={key === 'fazExercicio' ? fazExercicio : key === 'temCrianca' ? temCrianca : temProblema}
              onChange={key === 'fazExercicio' ? setFazExercicio : key === 'temCrianca' ? setTemCrianca : setTemProblema}
            />
          ))}

          {/* Erro */}
          {error && (
            <View style={styles.errorCard}>
              <Ionicons name="alert-circle-outline" size={16} color={Colors.critico} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Ações */}
          <View style={styles.actions}>
            <Button label="Criar conta" onPress={() => void handleRegister()} loading={loading} variant="primary" />
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.link}>Já tem conta? <Text style={styles.linkAccent}>Entrar</Text></Text>
            </TouchableOpacity>
          </View>

        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex:      { flex: 1, backgroundColor: Colors.bg },
  container: { flexGrow: 1, padding: 24, paddingTop: 40 },

  header:    { alignItems: 'center', marginBottom: 28, gap: 10 },
  title:     { fontFamily: Typography.font.heading, fontSize: Typography.size.xl, color: Colors.text },

  section:   { gap: 12, marginBottom: 8 },
  sectionLabel: {
    fontFamily: Typography.font.subheading,
    fontSize: Typography.size.xs,
    color: Colors.textDim,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  input:     {
    fontFamily: Typography.font.body,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderRadius: 10,
    padding: 14,
    color: Colors.text,
    fontSize: Typography.size.md,
  },
  passwordWrap:  { position: 'relative' },
  passwordInput: { paddingRight: 48 },
  eyeBtn:        {
    position: 'absolute', right: 14, top: 0, bottom: 0,
    justifyContent: 'center', alignItems: 'center',
  },

  divider:    { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 20 },
  dividerLine:{ flex: 1, height: 1, backgroundColor: Colors.border },
  dividerText:{ fontFamily: Typography.font.mono, fontSize: Typography.size.xs, color: Colors.textDim },

  profileHint:{
    fontFamily: Typography.font.body,
    fontSize: Typography.size.xs, color: Colors.textDim, lineHeight: 18, marginBottom: 12,
  },

  toggleRow:      {
    paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
  },
  toggleLabels:   { flex: 1 },
  toggleLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  toggleLabel:    { fontFamily: Typography.font.body, color: Colors.text, fontSize: Typography.size.md, flex: 1 },
  toggleHint:     { fontFamily: Typography.font.body, fontSize: Typography.size.xs, color: Colors.textDim, lineHeight: 16 },

  errorCard:  {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.criticoDim,
    borderWidth: 1, borderColor: Colors.critico,
    borderRadius: 8, padding: 10, marginTop: 12,
  },
  errorText:  { fontFamily: Typography.font.body, flex: 1, color: Colors.critico, fontSize: Typography.size.sm },

  actions:    { gap: 12, marginTop: 20 },
  link:       { fontFamily: Typography.font.body, color: Colors.textMuted, fontSize: Typography.size.sm, textAlign: 'center' },
  linkAccent: { color: Colors.cyan },
});
