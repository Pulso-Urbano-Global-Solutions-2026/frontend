// app/perfil.tsx — adiciona temPet via SecureStore (sem tocar no backend)
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, ScrollView, StyleSheet,
         Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import ErrorState from '@/components/ErrorState/ErrorState';
import LoadingSkeleton from '@/components/LoadingSkeleton/LoadingSkeleton';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { useAuthContext } from '@/contexts/AuthContext';
import * as usuarioService from '@/services/usuarioService';
import type { UsuarioResponse } from '@/types/usuario.types';

// Chave para persistir a preferência de pet por usuário
const petKey = (id: number) => `pulso_tem_pet_${id}`;

export default function PerfilScreen() {
  const { userId, logout } = useAuthContext();
  const router = useRouter();

  const [usuario, setUsuario]       = useState<UsuarioResponse | null>(null);
  const [nome, setNome]             = useState('');
  const [fazExercicio, setFazExercicio] = useState(false);
  const [temCrianca, setTemCrianca] = useState(false);
  const [temProblema, setTemProblema] = useState(false);
  const [temPet, setTemPet]         = useState(false);  // ← novo
  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState<string | null>(null);

  useEffect(() => {
    if (!userId) { router.replace('/(auth)/login'); return; }

    // Carrega perfil do backend + preferência de pet do SecureStore em paralelo
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
        setTemPet(petStored === 'true');   // ← restaura preferência
      })
      .catch((e) => setError(e?.response?.data?.erro ?? e?.message ?? 'Erro ao carregar perfil'))
      .finally(() => setLoadingData(false));
  }, [userId, router]);

  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);
    try {
      // Salva campos do backend normalmente
      const updated = await usuarioService.update(userId, {
        nome, fazExercicio, temCrianca, temProblemaRespiratorio: temProblema,
      });
      setUsuario(updated);

      // Salva temPet localmente (SecureStore — sem precisar tocar no Java)
      await SecureStore.setItemAsync(petKey(userId), String(temPet));

      Alert.alert('Sucesso', 'Perfil atualizado!');
    } catch (e: any) {
      Alert.alert('Erro', e?.response?.data?.erro ?? e?.message ?? 'Erro ao salvar');
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
            // Limpa preferência de pet ao deletar conta
            await SecureStore.deleteItemAsync(petKey(userId));
            await logout();
            router.replace('/(auth)/login');
          } catch (e: any) {
            Alert.alert('Erro', e?.response?.data?.erro ?? 'Erro ao excluir conta');
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
    { label: 'Tenho pet em casa 🐾',            value: temPet,       onChange: setTemPet       }, // ← novo
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{usuario?.nome ?? 'Perfil'}</Text>
        <Text style={styles.email}>{usuario?.email}</Text>

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

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
          {saving
            ? <ActivityIndicator color={Colors.bg} />
            : <Text style={styles.saveBtnText}>Salvar</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>

        <View style={styles.danger}>
          <Text style={styles.dangerTitle}>Zona de Perigo</Text>
          <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
            <Text style={styles.deleteText}>Excluir conta</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: Colors.bg },
  skeleton:     { padding: 20 },
  content:      { flexGrow: 1, padding: 20, gap: 12 },
  title:        { fontSize: Typography.size.xl, fontWeight: '700', color: Colors.text },
  email:        { fontSize: Typography.size.sm, color: Colors.textMuted, marginBottom: 8 },
  input:        {
    backgroundColor: Colors.surface, borderColor: Colors.border, borderWidth: 1,
    borderRadius: 8, padding: 14, color: Colors.text, fontSize: Typography.size.md,
  },
  row:          {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  rowLabel:     { flex: 1, color: Colors.text, fontSize: Typography.size.md, marginRight: 12 },
  saveBtn:      {
    backgroundColor: Colors.bom, borderRadius: 8, padding: 14,
    alignItems: 'center', marginTop: 8,
  },
  saveBtnText:  { color: Colors.bg, fontWeight: '700', fontSize: Typography.size.md },
  logoutBtn:    { backgroundColor: Colors.surface2, borderRadius: 8, padding: 14, alignItems: 'center' },
  logoutText:   { color: Colors.text, fontSize: Typography.size.md },
  danger:       {
    borderWidth: 1, borderColor: Colors.critico, borderRadius: 12, padding: 16, marginTop: 16,
  },
  dangerTitle:  { color: Colors.critico, fontWeight: '700', fontSize: Typography.size.sm, marginBottom: 12 },
  deleteBtn:    { backgroundColor: Colors.criticoDim, borderRadius: 8, padding: 12, alignItems: 'center' },
  deleteText:   { color: Colors.critico, fontWeight: '700', fontSize: Typography.size.md },
});
