import { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import { classeVirtuelleApi, reservationApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Colors, NIVEAUX, niveauLabel, matieresDuNiveau } from '@/lib/constants';
import type { ClasseVirtuelle, Reservation, Niveau } from '@/types';

export default function RepetiteurClassesScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [classes, setClasses] = useState<ClasseVirtuelle[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [titre, setTitre] = useState('');
  const [niveau, setNiveau] = useState<Niveau>('7e');
  const matieresDisponibles = matieresDuNiveau(niveau);
  const [matiere, setMatiere] = useState(matieresDisponibles[0]);
  const [dateHeure, setDateHeure] = useState(''); // "AAAA-MM-JJ HH:MM"
  const [loading, setLoading] = useState(false);

  const changerNiveau = (v: Niveau) => {
    setNiveau(v);
    const options = matieresDuNiveau(v);
    if (!options.includes(matiere)) setMatiere(options[0]);
  };

  useEffect(() => {
    if (!user) return;
    if (user.role !== 'repetiteur') { router.back(); return; }
    classeVirtuelleApi.mine().then(d => setClasses(d.classes)).catch(() => {});
    reservationApi.agenda().then(d => setReservations(d.reservations)).catch(() => {});
  }, [user, router]);

  const planifier = async () => {
    if (!titre || !dateHeure) { Toast.show({ type: 'error', text1: 'Titre et date requis' }); return; }
    const iso = new Date(dateHeure.replace(' ', 'T')).toISOString();
    if (isNaN(Date.parse(iso))) { Toast.show({ type: 'error', text1: 'Date invalide (ex: 2026-09-14 17:00)' }); return; }
    setLoading(true);
    try {
      const { classe } = await classeVirtuelleApi.create({ titre, matiere, niveau, dateHeure: iso });
      setClasses(prev => [classe, ...prev]);
      Toast.show({ type: 'success', text1: 'Classe virtuelle planifiée !' });
      setTitre(''); setDateHeure('');
    } catch (e: any) {
      Toast.show({ type: 'error', text1: e.message || 'Erreur' });
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== 'repetiteur') return null;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: Colors.surfaceBg }} contentContainerStyle={{ padding: 16, paddingBottom: 40, gap: 16 }}>
      <View style={{ backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.surfaceBorder, borderRadius: 16, padding: 16, gap: 10 }}>
        <Text style={{ fontWeight: '800', color: Colors.ink, fontSize: 15 }}>Planifier une classe virtuelle</Text>
        <TextInput value={titre} onChangeText={setTitre} placeholder="Titre (ex: Révisions Bac blanc)" placeholderTextColor={Colors.inkSubtle}
          style={{ borderWidth: 1, borderColor: Colors.surfaceBorder, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: Colors.ink }} />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {NIVEAUX.map(n => (
            <TouchableOpacity key={n.value} onPress={() => changerNiveau(n.value)}
              style={{ backgroundColor: niveau === n.value ? Colors.brand : Colors.surfaceBg, borderWidth: 1, borderColor: niveau === n.value ? Colors.brand : Colors.surfaceBorder, borderRadius: 16, paddingHorizontal: 10, paddingVertical: 5 }}>
              <Text style={{ color: niveau === n.value ? Colors.white : Colors.ink, fontSize: 11, fontWeight: '700' }}>{n.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {matieresDisponibles.map(m => (
            <TouchableOpacity key={m} onPress={() => setMatiere(m)}
              style={{ backgroundColor: matiere === m ? Colors.brand : Colors.surfaceBg, borderWidth: 1, borderColor: matiere === m ? Colors.brand : Colors.surfaceBorder, borderRadius: 16, paddingHorizontal: 10, paddingVertical: 5 }}>
              <Text style={{ color: matiere === m ? Colors.white : Colors.ink, fontSize: 11, fontWeight: '700' }}>{m}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TextInput value={dateHeure} onChangeText={setDateHeure} placeholder="AAAA-MM-JJ HH:MM (ex: 2026-09-14 17:00)" placeholderTextColor={Colors.inkSubtle}
          style={{ borderWidth: 1, borderColor: Colors.surfaceBorder, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: Colors.ink }} />
        <TouchableOpacity onPress={planifier} disabled={loading}
          style={{ backgroundColor: Colors.brand, borderRadius: 10, paddingVertical: 12, alignItems: 'center', opacity: loading ? 0.6 : 1 }}>
          {loading ? <ActivityIndicator color={Colors.white} /> : <Text style={{ color: Colors.white, fontWeight: '800' }}>Planifier (lien visio généré auto.)</Text>}
        </TouchableOpacity>
      </View>

      <View style={{ gap: 8 }}>
        <Text style={{ fontWeight: '800', color: Colors.ink, fontSize: 15 }}>Mes classes virtuelles</Text>
        {classes.length === 0 ? (
          <Text style={{ color: Colors.inkMuted, fontSize: 13 }}>Aucune classe planifiée.</Text>
        ) : classes.map(c => (
          <View key={c._id} style={{ backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.surfaceBorder, borderRadius: 14, padding: 14 }}>
            <Text style={{ fontWeight: '800', color: Colors.ink }}>{c.titre}</Text>
            <Text style={{ fontSize: 12, color: Colors.inkMuted, marginTop: 2 }}>{c.matiere} · {niveauLabel(c.niveau)} · {new Date(c.dateHeure).toLocaleString('fr-FR')}</Text>
            <TouchableOpacity onPress={() => Linking.openURL(c.lienVisio)}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.brand, marginTop: 4 }}>Lien de la salle →</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <View style={{ gap: 8 }}>
        <Text style={{ fontWeight: '800', color: Colors.ink, fontSize: 15 }}>Mes réservations (créneaux avec élèves)</Text>
        {reservations.length === 0 ? (
          <Text style={{ color: Colors.inkMuted, fontSize: 13 }}>Aucune réservation pour l'instant.</Text>
        ) : reservations.map(r => (
          <View key={r._id} style={{ backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.surfaceBorder, borderRadius: 14, padding: 14 }}>
            <Text style={{ fontWeight: '800', color: Colors.ink }}>{r.matiere} · {niveauLabel(r.niveau)}</Text>
            <Text style={{ fontSize: 12, color: Colors.inkMuted, marginTop: 2 }}>
              {new Date(r.dateHeure).toLocaleString('fr-FR')} · {r.mode === 'en_ligne' ? 'En ligne' : 'Présentiel'}
            </Text>
            <Text style={{ fontSize: 11, fontWeight: '700', color: Colors.brand, marginTop: 4, textTransform: 'capitalize' }}>{r.statut.replace('_', ' ')}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
