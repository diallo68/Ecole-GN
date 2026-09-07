import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Linking, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { contentApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Colors, MATIERES, niveauLabel } from '@/lib/constants';
import type { ContentItem } from '@/types';

export default function EleveCoursScreen() {
  const { user } = useAuthStore();
  const [items, setItems] = useState<ContentItem[]>([]);
  const [matiere, setMatiere] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = { matiere: matiere || undefined, niveau: user?.eleve?.niveau };
    Promise.all([contentApi.listAll('support', params), contentApi.listAll('video', params)])
      .then(([supports, videos]) => {
        setItems([...videos, ...supports].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [matiere, user]);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.surfaceBg }}>
      <View style={{ padding: 12 }}>
        <Text style={{ fontSize: 12, color: Colors.inkMuted, marginBottom: 8 }}>
          Supports et vidéos publiés par les enseignants Gandal{user?.eleve?.niveau ? ` — ${niveauLabel(user.eleve.niveau)}` : ''}.
        </Text>
        <FlatList
          horizontal showsHorizontalScrollIndicator={false}
          data={[{ value: null, label: 'Toutes matières' }, ...MATIERES.map(m => ({ value: m, label: m }))]}
          keyExtractor={i => i.label}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => setMatiere(item.value)}
              style={{ backgroundColor: matiere === item.value ? Colors.brand : Colors.white, borderWidth: 1, borderColor: matiere === item.value ? Colors.brand : Colors.surfaceBorder, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, marginRight: 8 }}>
              <Text style={{ color: matiere === item.value ? Colors.white : Colors.ink, fontSize: 12, fontWeight: '700' }}>{item.label}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={Colors.brand} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={i => i._id}
          contentContainerStyle={{ padding: 16, paddingTop: 4, gap: 10 }}
          ListEmptyComponent={<Text style={{ textAlign: 'center', color: Colors.inkMuted, marginTop: 20 }}>Aucun cours disponible pour le moment.</Text>}
          renderItem={({ item }) => {
            const isVideo = item.url !== undefined;
            const auteur = typeof item.repetiteurId === 'object' ? `${item.repetiteurId.prenom} ${item.repetiteurId.nom}` : null;
            return (
              <TouchableOpacity onPress={() => Linking.openURL((isVideo ? item.url : item.fichierUrl) || '')}
                style={{ backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.surfaceBorder, borderRadius: 14, padding: 14, flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.brandLight, alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name={isVideo ? 'videocam-outline' : 'document-text-outline'} size={18} color={Colors.brandDark} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: '800', color: Colors.ink }}>{item.titre}</Text>
                  <Text style={{ fontSize: 12, color: Colors.inkMuted, marginTop: 2 }}>{item.matiere}{item.chapitre ? ` · ${item.chapitre}` : ''}</Text>
                  {auteur && <Text style={{ fontSize: 11, color: Colors.inkSubtle, marginTop: 2 }}>Par {auteur}</Text>}
                </View>
                <Ionicons name="open-outline" size={16} color={Colors.inkSubtle} />
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}
