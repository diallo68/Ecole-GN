import { useCallback, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { reservationApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Colors } from '@/lib/constants';
import type { Reservation } from '@/types';

const ROLE_LABELS: Record<string, string> = {
  eleve: 'élève', parent: 'parent', repetiteur: 'enseignant', admin: 'admin',
};

export default function CompteScreen() {
  const router = useRouter();
  const { user, isLoggedIn, logout } = useAuthStore();
  const [reservations, setReservations] = useState<Reservation[]>([]);

  useFocusEffect(useCallback(() => {
    if (!user) return;
    const fetcher = user.role === 'repetiteur' ? reservationApi.agenda : reservationApi.mine;
    fetcher().then(d => setReservations(d.reservations)).catch(() => {});
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
      data={reservations}
      keyExtractor={item => item._id}
      ListHeaderComponent={
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 20, fontWeight: '900', color: Colors.ink }}>Bonjour {user.prenom} 👋</Text>
          <Text style={{ color: Colors.inkMuted, marginBottom: 12 }}>Espace {ROLE_LABELS[user.role] || user.role}</Text>
          {user.role === 'repetiteur' && !user.repetiteur?.valide && (
            <View style={{ backgroundColor: '#fffbeb', borderWidth: 1, borderColor: Colors.warning, borderRadius: 10, padding: 10, marginBottom: 10 }}>
              <Text style={{ fontSize: 12, color: Colors.warning }}>Profil en attente de validation par l'équipe Gandal.</Text>
            </View>
          )}
          <TouchableOpacity onPress={logout} style={{ alignSelf: 'flex-start' }}>
            <Text style={{ color: Colors.danger, fontSize: 13, fontWeight: '700' }}>Déconnexion</Text>
          </TouchableOpacity>
        </View>
      }
      ListEmptyComponent={<Text style={{ color: Colors.inkMuted, textAlign: 'center' }}>Aucune réservation.</Text>}
      renderItem={({ item }) => (
        <View style={{ backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.surfaceBorder, borderRadius: 14, padding: 14, marginBottom: 10 }}>
          <Text style={{ fontWeight: '800', color: Colors.ink }}>{item.matiere} · {item.niveau}</Text>
          <Text style={{ fontSize: 12, color: Colors.inkMuted, marginTop: 2 }}>
            {new Date(item.dateHeure).toLocaleString('fr-FR')} — {item.mode === 'en_ligne' ? 'En ligne' : 'Présentiel'}
          </Text>
          <Text style={{ fontSize: 11, fontWeight: '700', color: Colors.brand, marginTop: 4, textTransform: 'capitalize' }}>{item.statut.replace('_', ' ')}</Text>
        </View>
      )}
    />
  );
}
