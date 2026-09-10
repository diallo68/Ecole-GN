import { useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, ActivityIndicator, Modal } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { repetiteurApi } from '@/lib/api';
import { Colors, MATIERES, DISPONIBILITES, ALL_CITIES, NIVEAUX, niveauLabel, tarifLabel } from '@/lib/constants';
import type { Repetiteur, Niveau } from '@/types';

const TARIF_MAX_OPTIONS: { value: string | null; label: string }[] = [
  { value: null, label: 'Tous les tarifs' },
  { value: '30000', label: "Jusqu'à 30 000 GNF" },
  { value: '60000', label: "Jusqu'à 60 000 GNF" },
  { value: '100000', label: "Jusqu'à 100 000 GNF" },
  { value: '300000', label: "Jusqu'à 300 000 GNF" },
];

export default function RepetiteursScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ matiere?: string; niveau?: string; ville?: string }>();
  const [repetiteurs, setRepetiteurs] = useState<Repetiteur[]>([]);
  const [matiere, setMatiere] = useState<string | null>(null);
  const [niveau, setNiveau] = useState<Niveau | null>(null);
  const [tarifMax, setTarifMax] = useState<string | null>(null);
  const [ville, setVille] = useState<string | null>(null);
  const [disponibilite, setDisponibilite] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [showNiveauPicker, setShowNiveauPicker] = useState(false);
  const [citySearch, setCitySearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Reprend une recherche lancée depuis le bloc de l'accueil
  // (?matiere=...&niveau=...&ville=...).
  useEffect(() => {
    if (params.matiere) setMatiere(params.matiere);
    if (params.niveau) setNiveau(params.niveau as Niveau);
    if (params.ville) setVille(params.ville);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setLoading(true);
    repetiteurApi.list({
      matiere: matiere || undefined,
      niveau: niveau || undefined,
      tarifMax: tarifMax || undefined,
      ville: ville || undefined,
      disponibilite: disponibilite || undefined,
    })
      .then(d => setRepetiteurs(d.repetiteurs))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [matiere, niveau, tarifMax, ville, disponibilite]);

  const filtres = repetiteurs.filter(r =>
    !search || `${r.prenom} ${r.nom}`.toLowerCase().includes(search.toLowerCase()) ||
    r.repetiteur.matieres?.some(m => m.toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <View style={{ flex: 1, backgroundColor: Colors.surfaceBg }}>
      <View style={{ padding: 12, gap: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.surfaceBorder, borderRadius: 12, paddingHorizontal: 12 }}>
          <Ionicons name="search-outline" size={15} color={Colors.inkMuted} style={{ marginRight: 8 }} />
          <TextInput value={search} onChangeText={setSearch} placeholder="Nom ou mot-clé..." placeholderTextColor={Colors.inkSubtle}
            style={{ flex: 1, paddingVertical: 10, fontSize: 13, color: Colors.ink }} />
        </View>

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
          data={TARIF_MAX_OPTIONS}
          keyExtractor={item => item.label}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => setTarifMax(item.value)}
              style={{ backgroundColor: tarifMax === item.value ? Colors.brand : Colors.white, borderWidth: 1, borderColor: tarifMax === item.value ? Colors.brand : Colors.surfaceBorder, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, marginRight: 8 }}>
              <Text style={{ color: tarifMax === item.value ? Colors.white : Colors.ink, fontSize: 12, fontWeight: '700' }}>{item.label}</Text>
            </TouchableOpacity>
          )}
        />
        <FlatList
          horizontal showsHorizontalScrollIndicator={false}
          data={[{ value: null, label: 'Toutes les heures' }, ...DISPONIBILITES]}
          keyExtractor={item => item.label}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => setDisponibilite(item.value)}
              style={{ backgroundColor: disponibilite === item.value ? Colors.brand : Colors.white, borderWidth: 1, borderColor: disponibilite === item.value ? Colors.brand : Colors.surfaceBorder, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, marginRight: 8 }}>
              <Text style={{ color: disponibilite === item.value ? Colors.white : Colors.ink, fontSize: 12, fontWeight: '700' }}>{item.label}</Text>
            </TouchableOpacity>
          )}
        />

        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity onPress={() => setShowNiveauPicker(true)}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: niveau ? Colors.brand : Colors.white, borderWidth: 1, borderColor: niveau ? Colors.brand : Colors.surfaceBorder, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 }}>
            <Ionicons name="school-outline" size={13} color={niveau ? Colors.white : Colors.inkMuted} />
            <Text style={{ color: niveau ? Colors.white : Colors.ink, fontSize: 12, fontWeight: '700' }}>{niveau ? niveauLabel(niveau) : 'Toutes les classes'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { setCitySearch(''); setShowCityPicker(true); }}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: ville ? Colors.brand : Colors.white, borderWidth: 1, borderColor: ville ? Colors.brand : Colors.surfaceBorder, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 }}>
            <Ionicons name="location-outline" size={13} color={ville ? Colors.white : Colors.inkMuted} />
            <Text style={{ color: ville ? Colors.white : Colors.ink, fontSize: 12, fontWeight: '700' }}>{ville || 'Toutes les villes'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={Colors.brand} />
      ) : (
        <FlatList
          data={filtres}
          keyExtractor={item => item._id}
          contentContainerStyle={{ padding: 12, gap: 10 }}
          ListEmptyComponent={<Text style={{ textAlign: 'center', color: Colors.inkMuted, marginTop: 20 }}>Aucun enseignant ne correspond.</Text>}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => router.push(`/repetiteur/${item._id}`)}
              style={{ backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.surfaceBorder, borderRadius: 14, padding: 14 }}>
              <Text style={{ fontWeight: '800', color: Colors.ink }}>{item.prenom} {item.nom}</Text>
              <Text style={{ fontSize: 12, color: Colors.inkMuted, marginTop: 2 }}>{item.repetiteur.matieres?.join(', ')}</Text>
              <Text style={{ fontSize: 11, color: Colors.inkSubtle, marginTop: 2 }}>{item.city}</Text>
              {item.repetiteur.tarif?.montant && (
                <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.brand, marginTop: 6 }}>{tarifLabel(item.repetiteur.tarif)}</Text>
              )}
            </TouchableOpacity>
          )}
        />
      )}

      <Modal visible={showNiveauPicker} transparent animationType="slide" onRequestClose={() => setShowNiveauPicker(false)}>
        <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' }} activeOpacity={1} onPress={() => setShowNiveauPicker(false)} />
        <View style={{ backgroundColor: Colors.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, position: 'absolute', bottom: 0, left: 0, right: 0, maxHeight: '75%' }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: Colors.surfaceBorder }}>
            <TouchableOpacity onPress={() => { setNiveau(null); setShowNiveauPicker(false); }}>
              <Text style={{ color: Colors.inkMuted, fontSize: 15 }}>Toutes</Text>
            </TouchableOpacity>
            <Text style={{ fontWeight: '800', fontSize: 15, color: Colors.ink }}>Choisir une classe</Text>
            <TouchableOpacity onPress={() => setShowNiveauPicker(false)}>
              <Text style={{ color: Colors.inkMuted, fontSize: 15 }}>Fermer</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={NIVEAUX}
            keyExtractor={n => n.value}
            renderItem={({ item: n }) => (
              <TouchableOpacity onPress={() => { setNiveau(n.value); setShowNiveauPicker(false); }}
                style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.surfaceBorder, backgroundColor: niveau === n.value ? Colors.brandLight : Colors.white }}>
                <Text style={{ fontSize: 15, color: Colors.ink, fontWeight: niveau === n.value ? '700' : '400' }}>{n.label}</Text>
                {niveau === n.value && <Ionicons name="checkmark" size={17} color={Colors.brand} />}
              </TouchableOpacity>
            )}
            contentContainerStyle={{ paddingBottom: 30 }}
          />
        </View>
      </Modal>

      <Modal visible={showCityPicker} transparent animationType="slide" onRequestClose={() => setShowCityPicker(false)}>
        <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' }} activeOpacity={1} onPress={() => setShowCityPicker(false)} />
        <View style={{ backgroundColor: Colors.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, position: 'absolute', bottom: 0, left: 0, right: 0, maxHeight: '75%' }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: Colors.surfaceBorder }}>
            <TouchableOpacity onPress={() => { setVille(null); setShowCityPicker(false); }}>
              <Text style={{ color: Colors.inkMuted, fontSize: 15 }}>Toutes</Text>
            </TouchableOpacity>
            <Text style={{ fontWeight: '800', fontSize: 15, color: Colors.ink }}>Choisir une ville</Text>
            <TouchableOpacity onPress={() => setShowCityPicker(false)}>
              <Text style={{ color: Colors.inkMuted, fontSize: 15 }}>Fermer</Text>
            </TouchableOpacity>
          </View>
          <View style={{ paddingHorizontal: 16, paddingVertical: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surfaceBg, borderRadius: 10, paddingHorizontal: 12, borderWidth: 1, borderColor: Colors.surfaceBorder }}>
              <Ionicons name="search-outline" size={16} color={Colors.inkMuted} style={{ marginRight: 8 }} />
              <TextInput value={citySearch} onChangeText={setCitySearch} placeholder="Rechercher une ville..." placeholderTextColor={Colors.inkMuted}
                style={{ flex: 1, paddingVertical: 10, fontSize: 14, color: Colors.ink }} autoFocus />
            </View>
          </View>
          <FlatList
            data={ALL_CITIES.filter(c => c.toLowerCase().includes(citySearch.toLowerCase()))}
            keyExtractor={c => c}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item: c }) => (
              <TouchableOpacity onPress={() => { setVille(c); setShowCityPicker(false); }}
                style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.surfaceBorder, backgroundColor: ville === c ? Colors.brandLight : Colors.white }}>
                <Text style={{ fontSize: 15, color: Colors.ink, fontWeight: ville === c ? '700' : '400' }}>{c}</Text>
                {ville === c && <Ionicons name="checkmark" size={17} color={Colors.brand} />}
              </TouchableOpacity>
            )}
            contentContainerStyle={{ paddingBottom: 30 }}
          />
        </View>
      </Modal>
    </View>
  );
}
