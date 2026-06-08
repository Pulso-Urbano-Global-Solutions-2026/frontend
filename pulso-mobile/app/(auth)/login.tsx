import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
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

export default function LoginScreen() {
  const { login } = useAuthContext();
  const router = useRouter();
  const [email, setEmail]           = useState('');
  const [senha, setSenha]           = useState('');
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [senhaVisivel, setSenhaVisivel] = useState(false);
  const [focusedField, setFocusedField] = useState<'email' | 'senha' | null>(null);

  // Animações de entrada em cascata
  const logoOpacity  = useRef(new Animated.Value(0)).current;
  const field1Opacity = useRef(new Animated.Value(0)).current;
  const field2Opacity = useRef(new Animated.Value(0)).current;
  const btnOpacity   = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(80, [
      Animated.timing(logoOpacity,   { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(field1Opacity, { toValue: 1, duration: 350, useNativeDriver: true }),
      Animated.timing(field2Opacity, { toValue: 1, duration: 350, useNativeDriver: true }),
      Animated.timing(btnOpacity,    { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
  }, [logoOpacity, field1Opacity, field2Opacity, btnOpacity]);

  const handleLogin = async () => {
    if (!email || !senha) { setError('Preencha e-mail e senha'); return; }
    setLoading(true); setError(null);
    try {
      await login({ email, senha });
    } catch (err: unknown) {
      const e = err as { response?: { data?: { mensagem?: string; erro?: string } }; message?: string };
      setError(e?.response?.data?.mensagem ?? e?.response?.data?.erro ?? e?.message ?? 'Erro ao fazer login');
    } finally { setLoading(false); }
  };

  const borderColor = (field: 'email' | 'senha') =>
    focusedField === field ? Colors.cyan : Colors.border;

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">

        {/* Logo animado */}
        <Animated.View style={[styles.logoWrap, { opacity: logoOpacity }]}>
          <LogoWordmark size={52} animated />
          <Text style={styles.subtitle}>Saúde ambiental em tempo real</Text>
        </Animated.View>

        {/* Campo e-mail */}
        <Animated.View style={{ opacity: field1Opacity, width: '100%' }}>
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
        </Animated.View>

        {/* Campo senha com toggle de visibilidade */}
        <Animated.View style={[styles.passwordWrap, { opacity: field2Opacity }]}>
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
        </Animated.View>

        {/* Erro */}
        {error && (
          <View style={styles.errorCard}>
            <Ionicons name="alert-circle-outline" size={16} color={Colors.critico} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Botão */}
        <Animated.View style={{ opacity: btnOpacity, width: '100%', gap: 12 }}>
          <Button label="Entrar" onPress={() => void handleLogin()} loading={loading} variant="primary" />
          <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
            <Text style={styles.link}>Não tem conta? <Text style={styles.linkAccent}>Cadastre-se</Text></Text>
          </TouchableOpacity>
        </Animated.View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex:         { flex: 1, backgroundColor: Colors.bg },
  container:    { flexGrow: 1, justifyContent: 'center', padding: 24, gap: 12 },
  logoWrap:     { alignItems: 'center', marginBottom: 24, gap: 10 },
  subtitle:     {
    fontFamily: Typography.font.mono,
    fontSize: Typography.size.xs,
    color: Colors.textDim,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  input:        {
    fontFamily: Typography.font.body,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderRadius: 10,
    padding: 14,
    color: Colors.text,
    fontSize: Typography.size.md,
  },
  passwordWrap: { width: '100%', position: 'relative' },
  passwordInput:{ paddingRight: 48 },
  eyeBtn:       {
    position: 'absolute', right: 14, top: 0, bottom: 0,
    justifyContent: 'center', alignItems: 'center',
  },
  errorCard:    {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.criticoDim,
    borderWidth: 1, borderColor: Colors.critico,
    borderRadius: 8, padding: 10,
  },
  errorText:    { fontFamily: Typography.font.body, flex: 1, color: Colors.critico, fontSize: Typography.size.sm },
  link:         { fontFamily: Typography.font.body, color: Colors.textMuted, fontSize: Typography.size.sm, textAlign: 'center' },
  linkAccent:   { color: Colors.cyan },
});
