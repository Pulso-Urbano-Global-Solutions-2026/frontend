import { Tabs, useRouter } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';

export default function TabLayout() {
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: Colors.bg,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarActiveTintColor:   Colors.cyan,
        tabBarInactiveTintColor: Colors.textDim,
        tabBarLabelStyle: {
          fontFamily: Typography.font.body,
          fontSize:   Typography.size.xs,
          marginTop:  2,
        },
        headerStyle:      { backgroundColor: Colors.bg },
        headerTintColor:  Colors.text,
        headerTitleStyle: {
          fontFamily: Typography.font.heading,
          fontSize:   Typography.size.md,
          color:      Colors.text,
        },
        headerRight: () => (
          <TouchableOpacity
            onPress={() => router.push('/perfil')}
            style={{ marginRight: 16 }}
            accessibilityLabel="Abrir perfil"
            accessibilityRole="button"
          >
            <Ionicons name="person-circle-outline" size={28} color={Colors.cyan} />
          </TouchableOpacity>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Pulso',
          tabBarIcon: ({ color }) => (
            <Ionicons name="pulse-outline" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="mapa"
        options={{
          title: 'Mapa',
          tabBarIcon: ({ color }) => (
            <Ionicons name="map-outline" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="historico"
        options={{
          title: 'Histórico',
          tabBarIcon: ({ color }) => (
            <Ionicons name="analytics-outline" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
