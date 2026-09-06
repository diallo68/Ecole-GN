import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/lib/constants';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: Colors.brand, headerTitleStyle: { fontWeight: '800' } }}>
      <Tabs.Screen name="index" options={{ title: 'Accueil', tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="repetiteurs" options={{ title: 'Enseignants', tabBarIcon: ({ color, size }) => <Ionicons name="people-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="quiz" options={{ title: 'Quiz', tabBarIcon: ({ color, size }) => <Ionicons name="help-circle-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="compte" options={{ title: 'Mon espace', tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} /> }} />
    </Tabs>
  );
}
