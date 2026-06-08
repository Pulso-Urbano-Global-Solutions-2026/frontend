import { useEffect, useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StyleSheet,
         Switch, Text, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { Button } from '@/components/Button/Button';
import ErrorState from '@/components/ErrorState/ErrorState';
import LoadingSkeleton from '@/components/LoadingSkeleton/LoadingSkeleton';
import { Toast } from '@/components/Toast/Toast';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { useAuthContext } from '@/contexts/AuthContext';
import * as usuarioService from '@/services/usuarioService';
import type { UsuarioResponse } from '@/types/usuario.types';

const petKey = (id: number) => `pulso_tem_pet_${id}`;

export default function PerfilScreen() {
  const { userId, logout } = useAuthContext();
  const router = useRouter();

  const [usuario, setUsuario]           = useState<UsuarioResponse | null>(null);
  const [nome, setNome]                 = useState('');
  const [fazExercicio, setFazExercicio] = useState(false);
  const [temCrianca, setTemCrianca]     = useState(false);
  const [temProblema, setTemProblema]   = useState(false);
  const [temPet, setTemPet]             = useState(false);
  const [loadingData, setLoadingData]   = useState(true);
  const [saving, setSaving]             = useState(false);
  const [error, setError]               = useState<string | null>(null);

  const [toast, setToast] = useState<{ visible: boolean; message: string; variant: 'success' | 'error' }>({
    visible: false, message: '', variant: 'success',
  });
  const showToast = (message: string, variant: 'success' | 'error') =>
    setToast({ visible: true, message, variant });

  useEffect(() => {
    if (!userId) { router.replace('/(auth)/login'); return; }

    Promise.all([
      usuarioService.getById(userId),
      SecureStore.getItemAsync(petKey(userId)),
    ])
      .then(([u, petStored]) => {
        setUsuario(u);
        setNome(u.nome);
        setFazExercicio(u.fazExercicio);
        setTemCrianca(u.temCrianca);
        setTemProblema(u.temProblemaRespiratorio);
        setTemPet(petStored === 'true');
      })
      .catch((e: unknown) => {
        const err = e as { response?: { data?: { erro?: string } }; message?: string };
        setError(err?.response?.data?.erro ?? err?.message ?? 'Erro ao carregar perfil');
      })
      .finally(() => setLoadingData(false));
  }, [userId, router]);

  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);
    try {
      const updated = await usuarioService.update(userId, {
        nome, fazExercicio, temCrianca, temProblemaRespiratorio: temProblema,
      });
      setUsuario(updated);
      await SecureStore.setItemAsync(petKey(userId), String(temPet));
      showToast('Perfil salvo com sucesso', 'success');
    } catch (e: unknown) {
      const err = e as { response?: { data?: { erro?: string } }; message?: string };
      showToast(err?.response?.data?.erro ?? err?.message ?? 'Erro ao salvar', 'error');
    } finally { setSaving(false); }
  };

  const handleDelete = () => {
    Alert.alert('Excluir conta', 'Esta ação é irreversível. Deseja continuar?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir', style: 'destructive',
        onPress: async () => {
          if (!userId) return;
          try {
            await usuarioService.remove(userId);
            await SecureStore.deleteItemAsync(petKey(userId));
            await logout();
            router.replace('/(auth)/login');
          } catch (e: unknown) {
            const err = e as { response?: { data?: { erro?: string } }; message?: string };
            showToast(err?.response?.data?.erro ?? 'Erro ao excluir conta', 'error');
          }
        },
      },
    ]);
  };

  const handleLogout = async () => { await logout(); router.replace('/(auth)/login'); };

  if (loadingData) return (
    <SafeAreaView style={styles.safe}><LoadingSkeleton rows={5} style={styles.skeleton} /></SafeAreaView>
  );
  if (error) return (
    <SafeAreaView style={styles.safe}>
      <ErrorState message={error} onRetry={() => { setError(null); setLoadingData(true); }} />
    </SafeAreaView>
  );

  const toggleRows = [
    { label: 'Pratico exercícios regularmente', value: fazExercicio, onChange: setFazExercicio },
    { label: 'Tenho crianças em casa',          value: temCrianca,   onChange: setTemCrianca   },
    { label: 'Tenho problema respiratório',     value: temProblema,  onChange: setTemProblema  },
    { label: 'Tenho pet em casa 🐾',            value: temPet,       onChange: setTemPet       },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Avatar: gradiente cyan→green com inicial do nome */}
        <View style={styles.avatarRow}>
          <LinearGradient
            colors={[Colors.cyan, Colors.bom]}
            style={styles.avatar}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.avatarInitial}>
              {(usuario?.nome ?? 'U').charAt(0).toUpperCase()}
            </Text>
          </LinearGradient>
          <View>
            <Text style={styles.title}>{usuario?.nome ?? 'Perfil'}</Text>
            <Text style={styles.email}>{usuario?.email}</Text>
          </View>
        </View>

        <TextInput
          style={styles.input} value={nome} onChangeText={setNome}
          placeholder="Nome" placeholderTextColor={Colors.textDim}
        />

        {toggleRows.map(({ label, value, onChange }) => (
          <View key={label} style={styles.row}>
            <Text style={styles.rowLabel}>{label}</Text>
            <Switch
              value={value} onValueChange={onChange}
              trackColor={{ true: Colors.bom, false: Colors.border }}
            />
          </View>
        ))}

        <Button label="Salvar" onPress={() => void handleSave()} loading={saving} variant="primary" />
        <Button label="Sair"   onPress={() => void handleLogout()} variant="secondary" />

        <View style={styles.danger}>
          <Text style={styles.dangerTitle}>Zona de Perigo</Text>
          <Button label="Excluir conta" onPress={handleDelete} variant="danger" size="sm" />
        </View>
      </ScrollView>

      <Toast
        visible={toast.visible}
        message={toast.message}
        variant={toast.variant}
        onHide={() => setToast((t) => ({ ...t, visible: false }))}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: Colors.bg },
  skeleton:    { padding: 20 },
  content:     { flexGrow: 1, padding: 20, gap: 12 },
  avatarRow:   { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 4 },
  avatar:      { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  avatarInitial: { fontFamily: Typography.font.heading, fontSize: Typography.size.xl, color: '#fff' },
  title:       { fontFamily: Typography.font.heading,  fontSize: Typography.size.xl, color: Colors.text },
  email:       { fontFamily: Typography.font.body, fontSize: Typography.size.sm, color: Colors.textMuted },
  input:       {
    fontFamily: Typography.font.body,
    backgroundColor: Colors.surface, borderColor: Colors.border, borderWidth: 1,
    borderRadius: 8, padding: 14, color: Colors.text, fontSize: Typography.size.md,
  },
  row:         {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  rowLabel:    { flex: 1, fontFamily: Typography.font.body, color: Colors.text, fontSize: Typography.size.md, marginRight: 12 },
  danger:      {
    borderWidth: 1, borderColor: Colors.critico, borderRadius: 12, padding: 16, marginTop: 16, gap: 12,
  },
  dangerTitle: {
    fontFamily: Typography.font.subheading,
    color: Colors.critico, fontSize: Typography.size.sm,
  },
});
