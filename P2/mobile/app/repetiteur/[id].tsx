import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import { repetiteurApi, reservationApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Colors, DISPONIBILITES, tarifLabel } from '@/lib/constants';
import type { Repetiteur } from '@/types';

export default function RepetiteurDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { isLoggedIn } = useAuthStore();

  const [repetiteur, setRepetiteur] = useState<Repetiteur | null>(null);
  const [matiere, setMatiere] = useState('');
  const [mode, setMode] = useState<'presentiel' | 'en_ligne'>('en_ligne');
  const [dateHeure, setDateHeure] = useState(''); // format libre "AAAA-MM-JJ HH:MM" pour ce scaffold
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    repetiteurApi.getById(id).then(d => {
      setRepetiteur(d.repetiteur);
      setMatiere(d.repetiteur.repetiteur.matieres?.[0] || '');
    }).catch(() => Toast.show({ type: 'error', text1: 'Enseignant introuvable' }));
  }, [id]);

  const reserver = async () => {
    if (!isLoggedIn()) { router.push('/login'); return; }
    if (!dateHeure) { Toast.show({ type: 'error', text1: 'Indique une date (ex: 2026-09-10 18:00)' }); return; }
    setLoading(true);
    try {
      await reservationApi.create({
        repetiteurId: id, matiere, niveau: repetiteur?.repetiteur.niveaux?.[0], mode,
        dateHeure: new Date(dateHeure.replace(' ', 'T')).toISOString(),
      });
      Toast.show({ type: 'success', text1: 'Réservation envoyée !' });
      router.push('/(tabs)/compte');
    } catch (e: any) {
      Toast.show({ type: 'error', text1: e.message || 'Erreur' });
    } finally {
      setLoading(false);
    }
  };

  if (!repetiteur) return <ActivityIndicator style={{ marginTop: 40 }} color={Colors.brand} />;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: Colors.surfaceBg }} contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: '900', color: Colors.ink }}>{repetiteur.prenom} {repetiteur.nom}</Text>
      <Text style={{ color: Colors.inkMuted, marginTop: 2 }}>{repetiteur.city}</Text>
      {repetiteur.repetiteur.ratingCount > 0 && (
        <Text style={{ color: Colors.warning, marginTop: 4 }}>★ {repetiteur.repetiteur.avgRating} ({repetiteur.repetiteur.ratingCount} avis)</Text>
      )}
      <Text style={{ color: Colors.ink, marginTop: 12, lineHeight: 20 }}>{repetiteur.repetiteur.bio}</Text>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
        {repetiteur.repetiteur.matieres?.map(m => (
          <View key={m} style={{ backgroundColor: Colors.surfaceBorder, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 }}>
            <Text style={{ fontSize: 11, color: Colors.ink }}>{m}</Text>
          </View>
        ))}
      </View>

      {repetiteur.repetiteur.tarif?.montant && (
        <Text style={{ fontSize: 17, fontWeight: '800', color: Colors.brand, marginTop: 14 }}>
          {tarifLabel(repetiteur.repetiteur.tarif)}
        </Text>
      )}

      {repetiteur.repetiteur.disponibilites?.length > 0 && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
          {repetiteur.repetiteur.disponibilites.map(d => (
            <View key={d} style={{ backgroundColor: Colors.brandLight, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 }}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: Colors.brandDark }}>{DISPONIBILITES.find(x => x.value === d)?.label || d}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={{ backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.surfaceBorder, borderRadius: 14, padding: 14, marginTop: 20 }}>
        <Text style={{ fontWeight: '800', color: Colors.ink, marginBottom: 10 }}>Réserver une session</Text>

        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
          <TouchableOpacity onPress={() => setMode('en_ligne')}
            style={{ flex: 1, borderRadius: 10, padding: 10, alignItems: 'center', backgroundColor: mode === 'en_ligne' ? Colors.brand : Colors.surfaceBg }}>
            <Text style={{ color: mode === 'en_ligne' ? Colors.white : Colors.ink, fontWeight: '700', fontSize: 12 }}>En ligne</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setMode('presentiel')}
            style={{ flex: 1, borderRadius: 10, padding: 10, alignItems: 'center', backgroundColor: mode === 'presentiel' ? Colors.brand : Colors.surfaceBg }}>
            <Text style={{ color: mode === 'presentiel' ? Colors.white : Colors.ink, fontWeight: '700', fontSize: 12 }}>Présentiel</Text>
          </TouchableOpacity>
        </View>

        <TextInput placeholder="Date et heure (AAAA-MM-JJ HH:MM)" value={dateHeure} onChangeText={setDateHeure}
          style={{ borderWidth: 1, borderColor: Colors.surfaceBorder, borderRadius: 10, padding: 10, marginBottom: 10, fontSize: 13 }} />

        <TouchableOpacity onPress={reserver} disabled={loading}
          style={{ backgroundColor: Colors.brand, borderRadius: 10, padding: 12, alignItems: 'center', opacity: loading ? 0.6 : 1 }}>
          <Text style={{ color: Colors.white, fontWeight: '800' }}>{loading ? 'Envoi...' : 'Réserver'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
