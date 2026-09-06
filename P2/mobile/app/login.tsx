import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Colors } from '@/lib/constants';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!email || !password) { Toast.show({ type: 'error', text1: 'Remplis tous les champs' }); return; }
    setLoading(true);
    try {
      const data = await authApi.login({ email, password });
      await login(data.user, data.token);
      Toast.show({ type: 'success', text1: 'Connecté !' });
      router.replace('/(tabs)');
    } catch (e: any) {
      Toast.show({ type: 'error', text1: e.message || 'Erreur de connexion' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.surfaceBg, padding: 20, justifyContent: 'center' }}>
      <Text style={{ fontSize: 22, fontWeight: '900', color: Colors.ink, marginBottom: 20 }}>Connexion</Text>
      <TextInput placeholder="Email" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail}
        style={{ backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.surfaceBorder, borderRadius: 12, padding: 14, marginBottom: 10 }} />
      <TextInput placeholder="Mot de passe" secureTextEntry value={password} onChangeText={setPassword}
        style={{ backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.surfaceBorder, borderRadius: 12, padding: 14, marginBottom: 16 }} />
      <TouchableOpacity onPress={submit} disabled={loading}
        style={{ backgroundColor: Colors.brand, borderRadius: 12, padding: 14, alignItems: 'center', opacity: loading ? 0.6 : 1 }}>
        <Text style={{ color: Colors.white, fontWeight: '800' }}>{loading ? 'Connexion...' : 'Se connecter'}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push('/register')} style={{ marginTop: 16, alignItems: 'center' }}>
        <Text style={{ color: Colors.brand, fontWeight: '700', fontSize: 13 }}>Pas encore de compte ? S'inscrire</Text>
      </TouchableOpacity>
    </View>
  );
}
