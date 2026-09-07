import { useEffect } from 'react';
import { Stack } from 'expo-router';
import Toast from 'react-native-toast-message';
import { useAuthStore } from '@/store/authStore';

export default function RootLayout() {
  const hydrate = useAuthStore(s => s.hydrate);

  useEffect(() => { hydrate(); }, [hydrate]);

  return (
    <>
      <Stack screenOptions={{ headerTitleStyle: { fontWeight: '800' } }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ title: 'Connexion' }} />
        <Stack.Screen name="register" options={{ title: 'Inscription' }} />
        <Stack.Screen name="profil" options={{ title: 'Mon profil' }} />
        <Stack.Screen name="repetiteur/[id]" options={{ title: 'Enseignant' }} />
        <Stack.Screen name="quiz/[id]" options={{ title: 'Quiz' }} />
        <Stack.Screen name="repetiteur-profil" options={{ title: 'Mon profil enseignant' }} />
        <Stack.Screen name="repetiteur-contenu" options={{ title: 'Mon contenu' }} />
        <Stack.Screen name="repetiteur-classes" options={{ title: 'Classes virtuelles' }} />
        <Stack.Screen name="eleve-cours" options={{ title: 'Mes cours' }} />
        <Stack.Screen name="eleve-exercices" options={{ title: 'Mes exercices' }} />
      </Stack>
      <Toast />
    </>
  );
}
