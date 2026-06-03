import { Tabs, useRouter } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';

export default function TabLayout() {
  const router = useRouter();
  const profileButton = (
    <TouchableOpacity onPress={() => router.push('/perfil')} style={{ marginRight: 16 }}>
      <Ionicons name="person-circle-outline" size={26} color={Colors.text} />
    </TouchableOpacity>
  );

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: { backgroundColor: Colors.bg, borderTopColor: Colors.border },
        tabBarActiveTintColor: Colors.bom,
        tabBarInactiveTintColor: Colors.textDim,
        headerStyle: { backgroundColor: Colors.bg },
        headerTintColor: Colors.text,
        headerRight: () => profileButton,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Pulso', tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} /> }}
      />
      <Tabs.Screen
        name="mapa"
        options={{ title: 'Mapa', tabBarIcon: ({ color, size }) => <Ionicons name="map" size={size} color={color} /> }}
      />
      <Tabs.Screen
        name="historico"
        options={{ title: 'Histórico', tabBarIcon: ({ color, size }) => <Ionicons name="bar-chart" size={size} color={color} /> }}
      />
    </Tabs>
  );
}
