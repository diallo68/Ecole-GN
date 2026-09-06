import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { repetiteurApi } from '@/lib/api';
import { Colors, MATIERES, NIVEAUX } from '@/lib/constants';
import type { Repetiteur } from '@/types';

export default function RepetiteursScreen() {
  const router = useRouter();
  const [repetiteurs, setRepetiteurs] = useState<Repetiteur[]>([]);
  const [matiere, setMatiere] = useState<string | null>(null);
  const [niveau, setNiveau] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    repetiteurApi.list({ matiere: matiere || undefined, niveau: niveau || undefined })
      .then(d => setRepetiteurs(d.repetiteurs))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [matiere, niveau]);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.surfaceBg }}>
      <View style={{ padding: 12, gap: 8 }}>
        <FlatList
          horizontal showsHorizontalScrollIndicator={false}
          data={[{ value: null, label: 'Toutes matières' }, ...MATIERES.map(m => ({ value: m, label: m }))]}
          keyExtractor={item => item.label}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => setMatiere(item.value)}
              style={{ backgroundColor: matiere === item.value ? Colors.brand : Colors.white, borderWidth: 1, borderColor: matiere === item.value ? Colors.brand : Colors.surfaceBorder, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, marginRight: 8 }}>
              <Text style={{ color: matiere === item.value ? Colors.white : Colors.ink, fontSize: 12, fontWeight: '700' }}>{item.label}</Text>
            </TouchableOpacity>
          )}
        />
        <FlatList
          horizontal showsHorizontalScrollIndicator={false}
          data={[{ value: null, label: 'Tous niveaux' }, ...NIVEAUX]}
          keyExtractor={item => item.label}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => setNiveau(item.value)}
              style={{ backgroundColor: niveau === item.value ? Colors.brand : Colors.white, borderWidth: 1, borderColor: niveau === item.value ? Colors.brand : Colors.surfaceBorder, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, marginRight: 8 }}>
              <Text style={{ color: niveau === item.value ? Colors.white : Colors.ink, fontSize: 12, fontWeight: '700' }}>{item.label}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={Colors.brand} />
      ) : (
        <FlatList
          data={repetiteurs}
          keyExtractor={item => item._id}
          contentContainerStyle={{ padding: 12, gap: 10 }}
          ListEmptyComponent={<Text style={{ textAlign: 'center', color: Colors.inkMuted, marginTop: 20 }}>Aucun enseignant ne correspond.</Text>}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => router.push(`/repetiteur/${item._id}`)}
              style={{ backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.surfaceBorder, borderRadius: 14, padding: 14 }}>
              <Text style={{ fontWeight: '800', color: Colors.ink }}>{item.prenom} {item.nom}</Text>
              <Text style={{ fontSize: 12, color: Colors.inkMuted, marginTop: 2 }}>{item.repetiteur.matieres?.join(', ')}</Text>
              <Text style={{ fontSize: 11, color: Colors.inkSubtle, marginTop: 2 }}>{item.city}</Text>
              {item.repetiteur.tarifHoraire && (
                <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.brand, marginTop: 6 }}>{item.repetiteur.tarifHoraire.toLocaleString('fr-FR')} GNF/h</Text>
              )}
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}
