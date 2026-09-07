import { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import { repetiteurApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Colors, MATIERES, CYCLES, niveauxDuCycle, TARIF_PERIODES, DISPONIBILITES } from '@/lib/constants';
import FileUploadField from '@/components/FileUploadField';
import type { Niveau, TarifPeriode, Disponibilite } from '@/types';

export default function RepetiteurProfilScreen() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const [bio, setBio] = useState('');
  const [matieres, setMatieres] = useState<string[]>([]);
  const [niveaux, setNiveaux] = useState<Niveau[]>([]);
  const [montant, setMontant] = useState('');
  const [periode, setPeriode] = useState<TarifPeriode>('heure');
  const [disponibilites, setDisponibilites] = useState<Disponibilite[]>([]);
  const [disponible, setDisponible] = useState(true);
  const [avatar, setAvatar] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    if (user.role !== 'repetiteur') { router.back(); return; }
    setBio(user.repetiteur?.bio || '');
    setMatieres(user.repetiteur?.matieres || []);
    setNiveaux(user.repetiteur?.niveaux || []);
    setMontant(user.repetiteur?.tarif?.montant?.toString() || '');
    setPeriode(user.repetiteur?.tarif?.periode || 'heure');
    setDisponibilites(user.repetiteur?.disponibilites || []);
    setDisponible(user.repetiteur?.disponible ?? true);
    setAvatar(user.repetiteur?.avatar || '');
  }, [user, router]);

  const toggle = <T,>(arr: T[], val: T, setArr: (v: T[]) => void) => {
    setArr(arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val]);
  };

  const save = async () => {
    setLoading(true);
    const tarif = montant ? { montant: Number(montant), periode } : undefined;
    try {
      await repetiteurApi.updateMyProfile({ bio, matieres, niveaux, tarif, disponibilites, disponible, avatar: avatar || undefined });
      if (user) {
        setUser({ ...user, repetiteur: { ...user.repetiteur!, bio, matieres, niveaux, tarif, disponibilites, disponible, avatar } });
      }
      Toast.show({ type: 'success', text1: 'Profil enseignant mis à jour !' });
    } catch (e: any) {
      Toast.show({ type: 'error', text1: e.message || 'Erreur' });
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== 'repetiteur') return null;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: Colors.surfaceBg }} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      {!user.repetiteur?.valide && (
        <View style={{ backgroundColor: '#fffbeb', borderWidth: 1, borderColor: Colors.warning, borderRadius: 10, padding: 10, marginBottom: 14 }}>
          <Text style={{ fontSize: 12, color: Colors.warning }}>En attente de validation par l'équipe Gandal.</Text>
        </View>
      )}

      <View style={{ backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.surfaceBorder, borderRadius: 16, padding: 16, gap: 16 }}>
        <Field label="Photo de profil">
          <FileUploadField value={avatar} onChange={setAvatar} kind="photo" label="Changer la photo" />
        </Field>

        <Field label="Présentation">
          <TextInput value={bio} onChangeText={setBio} multiline numberOfLines={4} maxLength={1000}
            placeholder="Présente-toi à tes futurs élèves..." placeholderTextColor={Colors.inkSubtle}
            style={{ borderWidth: 1, borderColor: Colors.surfaceBorder, borderRadius: 10, padding: 12, fontSize: 14, color: Colors.ink, minHeight: 90, textAlignVertical: 'top' }} />
        </Field>

        <Field label="Matières enseignées">
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {MATIERES.map(m => (
              <Chip key={m} label={m} active={matieres.includes(m)} onPress={() => toggle(matieres, m, setMatieres)} />
            ))}
          </View>
        </Field>

        <Field label="Classes enseignées">
          <View style={{ gap: 10 }}>
            {CYCLES.map(cycle => (
              <View key={cycle.value} style={{ gap: 6 }}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: Colors.inkSubtle, textTransform: 'uppercase' }}>{cycle.label}</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {niveauxDuCycle(cycle.value).map(n => (
                    <Chip key={n.value} label={n.label} active={niveaux.includes(n.value)} onPress={() => toggle(niveaux, n.value, setNiveaux)} small />
                  ))}
                </View>
              </View>
            ))}
          </View>
        </Field>

        <Field label="Tarif (GNF)">
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TextInput value={montant} onChangeText={setMontant} keyboardType="number-pad" placeholder="Ex: 50000" placeholderTextColor={Colors.inkSubtle}
              style={{ flex: 1, borderWidth: 1, borderColor: Colors.surfaceBorder, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: Colors.ink }} />
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {TARIF_PERIODES.map(p => (
                <Chip key={p.value} label={p.label} active={periode === p.value} onPress={() => setPeriode(p.value)} small />
              ))}
            </View>
          </View>
          <Text style={{ fontSize: 11, color: Colors.inkSubtle, marginTop: 4 }}>À l'heure pour des cours ponctuels, au mois/à l'année pour un forfait.</Text>
        </Field>

        <Field label="Disponibilités">
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {DISPONIBILITES.map(d => (
              <Chip key={d.value} label={d.label} active={disponibilites.includes(d.value)} onPress={() => toggle(disponibilites, d.value, setDisponibilites)} />
            ))}
          </View>
        </Field>

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 14, fontWeight: '700', color: Colors.ink }}>Disponible pour de nouvelles réservations</Text>
          <Switch value={disponible} onValueChange={setDisponible} trackColor={{ true: Colors.brand }} />
        </View>

        <TouchableOpacity onPress={save} disabled={loading}
          style={{ backgroundColor: Colors.brand, borderRadius: 12, paddingVertical: 14, alignItems: 'center', opacity: loading ? 0.6 : 1 }}>
          {loading ? <ActivityIndicator color={Colors.white} /> : <Text style={{ color: Colors.white, fontWeight: '800' }}>Enregistrer</Text>}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ fontSize: 12, fontWeight: '700', color: Colors.inkMuted }}>{label}</Text>
      {children}
    </View>
  );
}

function Chip({ label, active, onPress, small }: { label: string; active: boolean; onPress: () => void; small?: boolean }) {
  return (
    <TouchableOpacity onPress={onPress}
      style={{
        backgroundColor: active ? Colors.brand : Colors.white, borderWidth: 1, borderColor: active ? Colors.brand : Colors.surfaceBorder,
        borderRadius: 20, paddingHorizontal: small ? 10 : 12, paddingVertical: small ? 5 : 7,
      }}>
      <Text style={{ color: active ? Colors.white : Colors.ink, fontSize: small ? 11 : 12, fontWeight: '700' }}>{label}</Text>
    </TouchableOpacity>
  );
}
