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
import { formatDate } from '@/utils/dateUtils';

const petKey          = (id: number) => `pulso_tem_pet_${id}`;
const notifDiarioKey  = (id: number) => `pulso_notif_diario_${id}`;
const notifCriticoKey = (id: number) => `pulso_notif_critico_${id}`;

export default function PerfilScreen() {
  const { userId, logout } = useAuthContext();
  const router = useRouter();

  const [usuario, setUsuario]           = useState<UsuarioResponse | null>(null);
  const [nome, setNome]                 = useState('');
  const [fazExercicio, setFazExercicio] = useState(false);
  const [temCrianca, setTemCrianca]     = useState(false);
  const [temProblema, setTemProblema]   = useState(false);
  const [temPet, setTemPet]             = useState(false);
  // ND-03: preferências de notificação (armazenadas localmente)
  const [notifDiario,  setNotifDiario]  = useState(true);
  const [notifCritico, setNotifCritico] = useState(true);
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
      SecureStore.getItemAsync(notifDiarioKey(userId)),
      SecureStore.getItemAsync(notifCriticoKey(userId)),
    ])
      .then(([u, petStored, nd, nc]) => {
        setUsuario(u);
        setNome(u.nome);
        setFazExercicio(u.fazExercicio);
        setTemCrianca(u.temCrianca);
        setTemProblema(u.temProblemaRespiratorio);
        setTemPet(petStored === 'true');
        if (nd !== null) setNotifDiario(nd === 'true');
        if (nc !== null) setNotifCritico(nc === 'true');
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
      await SecureStore.setItemAsync(notifDiarioKey(userId),  String(notifDiario));
      await SecureStore.setItemAsync(notifCriticoKey(userId), String(notifCritico));
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

  // HV-01: toggle rows com hint explicativo (espelhando register.tsx)
  const toggleRows = [
    {
      label: 'Pratico exercícios regularmente',
      hint:  'Personalizamos alertas de qualidade do ar para atividades ao ar livre',
      value: fazExercicio, onChange: setFazExercicio,
    },
    {
      label: 'Tenho crianças em casa',
      hint:  'Crianças são mais sensíveis à poluição — alertas mais preventivos',
      value: temCrianca, onChange: setTemCrianca,
    },
    {
      label: 'Tenho problema respiratório',
      hint:  'Asma, bronquite ou DPOC — recomendações mais conservadoras de exposição',
      value: temProblema, onChange: setTemProblema,
    },
    {
      label: 'Tenho pet em casa 🐾',
      hint:  'Alertas de temperatura do asfalto nos horários de passeio',
      value: temPet, onChange: setTemPet,
    },
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
          <View style={styles.avatarInfo}>
            <Text style={styles.title}>{usuario?.nome ?? 'Perfil'}</Text>
            <Text style={styles.email}>{usuario?.email}</Text>
            {/* FB-03: RM + data de cadastro */}
            <Text style={styles.avatarMeta}>
              RM {String(usuario?.id ?? '—').padStart(6, '0')}
              {usuario?.dtCriacao ? `  ·  desde ${formatDate(usuario.dtCriacao)}` : ''}
            </Text>
          </View>
        </View>

        <TextInput
          style={styles.input} value={nome} onChangeText={setNome}
          placeholder="Nome" placeholderTextColor={Colors.textDim}
        />

        {toggleRows.map(({ label, hint, value, onChange }) => (
          <View key={label} style={styles.row}>
            <View style={styles.rowBody}>
              <Text style={styles.rowLabel}>{label}</Text>
              <Text style={styles.rowHint}>{hint}</Text>
            </View>
            <Switch
              value={value} onValueChange={onChange}
              trackColor={{ true: Colors.bom, false: Colors.border }}
            />
          </View>
        ))}

        {/* ND-03: seção de notificações */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Notificações</Text>
        </View>
        <View style={styles.row}>
          <View style={styles.rowBody}>
            <Text style={styles.rowLabel}>Resumo diário</Text>
            <Text style={styles.rowHint}>Score do ar e temperatura toda manhã às 8h</Text>
          </View>
          <Switch
            value={notifDiario} onValueChange={setNotifDiario}
            trackColor={{ true: Colors.cyan, false: Colors.border }}
          />
        </View>
        <View style={styles.row}>
          <View style={styles.rowBody}>
            <Text style={styles.rowLabel}>Alertas de emergência</Text>
            <Text style={styles.rowHint}>Aviso imediato quando qualidade atingir CRÍTICO</Text>
          </View>
          <Switch
            value={notifCritico} onValueChange={setNotifCritico}
            trackColor={{ true: Colors.critico, false: Colors.border }}
          />
        </View>

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
  avatarRow:     { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 4 },
  avatarInfo:    { flex: 1, gap: 2 },
  avatar:        { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  avatarInitial: { fontFamily: Typography.font.heading, fontSize: Typography.size.xl, color: '#fff' },
  avatarMeta:    { fontFamily: Typography.font.mono, fontSize: Typography.size.xs, color: Colors.textDim, marginTop: 2 },
  title:         { fontFamily: Typography.font.heading,  fontSize: Typography.size.xl, color: Colors.text },
  email:         { fontFamily: Typography.font.body, fontSize: Typography.size.sm, color: Colors.textMuted },
  input:       {
    fontFamily: Typography.font.body,
    backgroundColor: Colors.surface, borderColor: Colors.border, borderWidth: 1,
    borderRadius: 8, padding: 14, color: Colors.text, fontSize: Typography.size.md,
  },
  row:         {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  rowBody:     { flex: 1, marginRight: 12, gap: 2 },
  rowLabel:    { fontFamily: Typography.font.body, color: Colors.text, fontSize: Typography.size.md },
  rowHint:     { fontFamily: Typography.font.body, fontSize: Typography.size.xs, color: Colors.textDim },
  sectionHeader: { paddingTop: 8, paddingBottom: 2 },
  sectionTitle:  { fontFamily: Typography.font.subheading, fontSize: Typography.size.sm, color: Colors.textDim, letterSpacing: 1 },
  danger:      {
    borderWidth: 1, borderColor: Colors.critico, borderRadius: 12, padding: 16, marginTop: 16, gap: 12,
  },
  dangerTitle: {
    fontFamily: Typography.font.subheading,
    color: Colors.critico, fontSize: Typography.size.sm,
  },
});
