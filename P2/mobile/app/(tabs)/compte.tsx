import { useCallback, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Linking } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { reservationApi, classeVirtuelleApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Colors, niveauLabel } from '@/lib/constants';
import type { Reservation, ClasseVirtuelle } from '@/types';

const ROLE_LABELS: Record<string, string> = {
  eleve: 'élève', parent: 'parent', repetiteur: 'enseignant', admin: 'admin',
};

type Item =
  | { type: 'reservation'; date: Date; data: Reservation }
  | { type: 'classe'; date: Date; data: ClasseVirtuelle };

export default function CompteScreen() {
  const router = useRouter();
  const { user, isLoggedIn, logout } = useAuthStore();
  const [items, setItems] = useState<Item[]>([]);

  useFocusEffect(useCallback(() => {
    if (!user) return;
    const resFetcher = user.role === 'repetiteur' ? reservationApi.agenda : reservationApi.mine;
    const classeFetcher = user.role === 'repetiteur' ? classeVirtuelleApi.mine : classeVirtuelleApi.mineAsEleve;
    Promise.all([
      resFetcher().then(d => d.reservations).catch(() => []),
      (user.role === 'repetiteur' || user.role === 'eleve' ? classeFetcher() : Promise.resolve({ classes: [] })).then(d => d.classes).catch(() => []),
    ]).then(([reservations, classes]) => {
      const combined: Item[] = [
        ...reservations.map(r => ({ type: 'reservation' as const, date: new Date(r.dateHeure), data: r })),
        ...classes.map(c => ({ type: 'classe' as const, date: new Date(c.dateHeure), data: c })),
      ].sort((a, b) => +a.date - +b.date);
      setItems(combined);
    });
  }, [user]));

  if (!isLoggedIn() || !user) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: Colors.surfaceBg }}>
        <Text style={{ fontSize: 16, fontWeight: '700', color: Colors.ink, marginBottom: 16 }}>Connecte-toi pour accéder à ton espace</Text>
        <TouchableOpacity onPress={() => router.push('/login')} style={{ backgroundColor: Colors.brand, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 28 }}>
          <Text style={{ color: Colors.white, fontWeight: '800' }}>Se connecter</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <FlatList
      style={{ backgroundColor: Colors.surfaceBg }}
      contentContainerStyle={{ padding: 16 }}
      data={items}
      keyExtractor={item => item.data._id}
      ListHeaderComponent={
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 20, fontWeight: '900', color: Colors.ink }}>Bonjour {user.prenom} 👋</Text>
          <Text style={{ color: Colors.inkMuted, marginBottom: 12 }}>Espace {ROLE_LABELS[user.role] || user.role}</Text>
          {user.role === 'repetiteur' && !user.repetiteur?.valide && (
            <View style={{ backgroundColor: '#fffbeb', borderWidth: 1, borderColor: Colors.warning, borderRadius: 10, padding: 10, marginBottom: 10 }}>
              <Text style={{ fontSize: 12, color: Colors.warning }}>Profil en attente de validation par l'équipe Gandal.</Text>
            </View>
          )}
          <TouchableOpacity onPress={() => router.push('/profil')}
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.surfaceBorder, borderRadius: 12, padding: 14, marginBottom: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Ionicons name="person-circle-outline" size={20} color={Colors.brand} />
              <Text style={{ fontWeight: '700', color: Colors.ink, fontSize: 14 }}>Mon profil</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.inkSubtle} />
          </TouchableOpacity>
          <TouchableOpacity onPress={logout} style={{ alignSelf: 'flex-start', marginBottom: 8 }}>
            <Text style={{ color: Colors.danger, fontSize: 13, fontWeight: '700' }}>Déconnexion</Text>
          </TouchableOpacity>
          <Text style={{ fontSize: 14, fontWeight: '800', color: Colors.ink, marginTop: 8 }}>Classes virtuelles &amp; réservations</Text>
        </View>
      }
      ListEmptyComponent={<Text style={{ color: Colors.inkMuted, textAlign: 'center' }}>Aucune classe virtuelle ni réservation programmée.</Text>}
      renderItem={({ item }) => {
        const isClasse = item.type === 'classe';
        return (
          <View style={{ backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.surfaceBorder, borderRadius: 14, padding: 14, marginBottom: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name={isClasse ? 'videocam-outline' : 'time-outline'} size={14} color={Colors.brand} />
              <Text style={{ fontWeight: '800', color: Colors.ink }}>
                {isClasse ? item.data.titre : `${item.data.matiere} · ${niveauLabel(item.data.niveau)}`}
              </Text>
            </View>
            <Text style={{ fontSize: 12, color: Colors.inkMuted, marginTop: 2 }}>
              {item.date.toLocaleString('fr-FR')}
              {!isClasse && ` — ${(item.data as Reservation).mode === 'en_ligne' ? 'En ligne' : 'Présentiel'}`}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: Colors.brand, textTransform: 'capitalize' }}>
                {isClasse ? 'Classe virtuelle' : item.data.statut.replace('_', ' ')}
              </Text>
              {item.data.lienVisio && (
                <TouchableOpacity onPress={() => Linking.openURL(item.data.lienVisio!)}>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: Colors.brand }}>Rejoindre →</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        );
      }}
    />
  );
}
