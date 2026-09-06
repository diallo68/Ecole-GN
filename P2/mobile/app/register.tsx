import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Colors, MATIERES, NIVEAUX } from '@/lib/constants';
import type { Role, Niveau } from '@/types';

type Step = 'infos' | 'otp';

const ROLE_LABELS: Record<Role, string> = { eleve: 'Élève', parent: 'Parent', repetiteur: 'Enseignant', admin: 'Admin' };

export default function RegisterScreen() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [step, setStep] = useState<Step>('infos');
  const [loading, setLoading] = useState(false);

  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [city, setCity] = useState('');
  const [role, setRole] = useState<Role>('eleve');
  const [niveau, setNiveau] = useState<Niveau>('college');
  const [code, setCode] = useState('');

  const sendCode = async () => {
    if (!prenom || !email || password.length < 8) { Toast.show({ type: 'error', text1: 'Remplis tous les champs (mdp 8 car. min.)' }); return; }
    setLoading(true);
    try {
      const res = await authApi.sendCode({ email, prenom });
      if (res.sendFailed) { Toast.show({ type: 'error', text1: "L'envoi du code a échoué" }); return; }
      Toast.show({ type: 'success', text1: 'Code envoyé par email !' });
      setStep('otp');
    } catch (e: any) {
      Toast.show({ type: 'error', text1: e.message || 'Erreur' });
    } finally {
      setLoading(false);
    }
  };

  const verifyAndRegister = async () => {
    if (code.length !== 6) { Toast.show({ type: 'error', text1: 'Code à 6 chiffres requis' }); return; }
    setLoading(true);
    try {
      const data = await authApi.register({ prenom, nom, email, password, city, code, role, ...(role === 'eleve' ? { niveau } : {}) });
      await login(data.user, data.token);
      Toast.show({ type: 'success', text1: 'Compte créé !' });
      router.replace('/(tabs)');
    } catch (e: any) {
      Toast.show({ type: 'error', text1: e.message || 'Erreur' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: Colors.surfaceBg }} contentContainerStyle={{ padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: '900', color: Colors.ink, marginBottom: 20 }}>Inscription</Text>

      {step === 'infos' ? (
        <View style={{ gap: 10 }}>
          <TextInput placeholder="Prénom" value={prenom} onChangeText={setPrenom} style={inputStyle} />
          <TextInput placeholder="Nom" value={nom} onChangeText={setNom} style={inputStyle} />
          <TextInput placeholder="Email" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} style={inputStyle} />
          <TextInput placeholder="Mot de passe (8 car. min.)" secureTextEntry value={password} onChangeText={setPassword} style={inputStyle} />
          <TextInput placeholder="Ville" value={city} onChangeText={setCity} style={inputStyle} />

          <View style={{ flexDirection: 'row', gap: 8 }}>
            {(['eleve', 'parent', 'repetiteur'] as Role[]).map(r => (
              <TouchableOpacity key={r} onPress={() => setRole(r)}
                style={{ flex: 1, borderRadius: 10, padding: 10, alignItems: 'center', backgroundColor: role === r ? Colors.brand : Colors.white, borderWidth: 1, borderColor: role === r ? Colors.brand : Colors.surfaceBorder }}>
                <Text style={{ color: role === r ? Colors.white : Colors.ink, fontSize: 12, fontWeight: '700' }}>{ROLE_LABELS[r]}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {role === 'eleve' && (
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {NIVEAUX.map(n => (
                <TouchableOpacity key={n.value} onPress={() => setNiveau(n.value)}
                  style={{ flex: 1, borderRadius: 10, padding: 10, alignItems: 'center', backgroundColor: niveau === n.value ? Colors.brand : Colors.white, borderWidth: 1, borderColor: niveau === n.value ? Colors.brand : Colors.surfaceBorder }}>
                  <Text style={{ color: niveau === n.value ? Colors.white : Colors.ink, fontSize: 12, fontWeight: '700' }}>{n.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <TouchableOpacity onPress={sendCode} disabled={loading}
            style={{ backgroundColor: Colors.brand, borderRadius: 12, padding: 14, alignItems: 'center', opacity: loading ? 0.6 : 1 }}>
            <Text style={{ color: Colors.white, fontWeight: '800' }}>{loading ? 'Envoi...' : 'Recevoir mon code'}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={{ gap: 10 }}>
          <Text style={{ fontSize: 13, color: Colors.inkMuted }}>Un code à 6 chiffres a été envoyé à {email}.</Text>
          <TextInput placeholder="Code à 6 chiffres" keyboardType="number-pad" maxLength={6} value={code}
            onChangeText={t => setCode(t.replace(/\D/g, ''))}
            style={{ ...inputStyle, textAlign: 'center', fontSize: 20, letterSpacing: 6 }} />
          <TouchableOpacity onPress={verifyAndRegister} disabled={loading}
            style={{ backgroundColor: Colors.brand, borderRadius: 12, padding: 14, alignItems: 'center', opacity: loading ? 0.6 : 1 }}>
            <Text style={{ color: Colors.white, fontWeight: '800' }}>{loading ? 'Vérification...' : 'Valider et créer mon compte'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setStep('infos')} style={{ alignItems: 'center', marginTop: 6 }}>
            <Text style={{ color: Colors.inkMuted, fontSize: 13 }}>← Modifier mes infos</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const inputStyle = {
  backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.surfaceBorder, borderRadius: 12, padding: 14,
};
