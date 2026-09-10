import { useCallback, useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, TextInput, RefreshControl, FlatList, Modal } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { repetiteurApi, quizApi } from '@/lib/api';
import { Colors, CYCLES, NIVEAUX, MATIERES, ALL_CITIES, niveauxDuCycle, niveauLabel } from '@/lib/constants';
import { useAuthStore } from '@/store/authStore';
import type { Repetiteur, QuizSummary, Cycle, Niveau } from '@/types';

// Icône + description par cycle, pour la section "À chaque classe, ses
// révisions" (reprend la maquette validée — même contenu que la version web).
const CYCLE_MOTIFS: Record<Cycle, { icon: keyof typeof Ionicons.glyphMap; desc: string }> = {
  primaire: { icon: 'bag-handle-outline', desc: 'Des quiz pour consolider les bases et prendre confiance.' },
  college: { icon: 'book-outline', desc: 'Révisez les notions clés et progressez à votre rythme.' },
  lycee: { icon: 'school-outline', desc: 'Préparez vos examens et visez plus loin.' },
};

const COMMENT_CA_MARCHE: Array<{ icon: keyof typeof Ionicons.glyphMap; titre: string; texte: string }> = [
  { icon: 'document-text-outline', titre: 'Choisissez', texte: 'La matière, la classe et votre ville.' },
  { icon: 'chatbubbles-outline', titre: 'Échangez', texte: "Discutez de vos besoins avec l'enseignant." },
  { icon: 'calendar-outline', titre: 'Demandez une séance', texte: "L'enseignant confirme votre demande." },
];

// Ligne "champ" du bloc recherche accueil — ouvre une feuille de sélection
// (même schéma que le sélecteur de ville déjà utilisé sur l'onglet
// Enseignants), pas de <select> natif disponible sans nouvelle dépendance.
function SearchField({ icon, label, value, placeholder, onPress }: {
  icon: keyof typeof Ionicons.glyphMap; label: string; value: string | null; placeholder: string; onPress: () => void;
}) {
  return (
    <TouchableOpacity onPress={onPress}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: Colors.surfaceBorder, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10 }}>
      <Ionicons name={icon} size={18} color={Colors.brand} />
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 11, fontWeight: '700', color: Colors.ink }}>{label}</Text>
        <Text style={{ fontSize: 13, color: value ? Colors.ink : Colors.inkMuted, marginTop: 1 }}>{value || placeholder}</Text>
      </View>
      <Ionicons name="chevron-down" size={16} color={Colors.inkSubtle} />
    </TouchableOpacity>
  );
}

// Feuille de sélection générique (recherche + liste), réutilisée pour les
// trois champs Matière / Classe / Ville du bloc recherche accueil.
function SelectSheet({ visible, title, options, search, onSelect, onClose }: {
  visible: boolean; title: string; options: string[]; search?: { value: string; onChange: (v: string) => void };
  onSelect: (v: string | null) => void; onClose: () => void;
}) {
  const filtered = search ? options.filter(o => o.toLowerCase().includes(search.value.toLowerCase())) : options;
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' }} activeOpacity={1} onPress={onClose} />
      <View style={{ backgroundColor: Colors.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, position: 'absolute', bottom: 0, left: 0, right: 0, maxHeight: '75%' }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: Colors.surfaceBorder }}>
          <TouchableOpacity onPress={() => { onSelect(null); onClose(); }}>
            <Text style={{ color: Colors.inkMuted, fontSize: 15 }}>Toutes</Text>
          </TouchableOpacity>
          <Text style={{ fontWeight: '800', fontSize: 15, color: Colors.ink }}>{title}</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={{ color: Colors.inkMuted, fontSize: 15 }}>Fermer</Text>
          </TouchableOpacity>
        </View>
        {search && (
          <View style={{ paddingHorizontal: 16, paddingVertical: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surfaceBg, borderRadius: 10, paddingHorizontal: 12, borderWidth: 1, borderColor: Colors.surfaceBorder }}>
              <Ionicons name="search-outline" size={16} color={Colors.inkMuted} style={{ marginRight: 8 }} />
              <TextInput value={search.value} onChangeText={search.onChange} placeholder="Rechercher..." placeholderTextColor={Colors.inkMuted}
                style={{ flex: 1, paddingVertical: 10, fontSize: 14, color: Colors.ink }} autoFocus />
            </View>
          </View>
        )}
        <FlatList
          data={filtered}
          keyExtractor={o => o}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => { onSelect(item); onClose(); }}
              style={{ paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.surfaceBorder }}>
              <Text style={{ fontSize: 15, color: Colors.ink }}>{item}</Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={{ paddingBottom: 30 }}
        />
      </View>
    </Modal>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [repetiteurs, setRepetiteurs] = useState<Repetiteur[]>([]);
  const [quizzes, setQuizzes] = useState<QuizSummary[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [cycle, setCycle] = useState<Cycle | null>(null);
  const [niveau, setNiveau] = useState<Niveau | null>(null);

  // ── Bloc recherche (matière / classe / ville) ────────────────────────
  const [searchMatiere, setSearchMatiere] = useState<string | null>(null);
  const [searchNiveau, setSearchNiveau] = useState<Niveau | null>(null);
  const [searchVille, setSearchVille] = useState<string | null>(null);
  const [openSheet, setOpenSheet] = useState<'matiere' | 'classe' | 'ville' | null>(null);
  const [villeSearch, setVilleSearch] = useState('');
  const NIVEAU_LABELS = NIVEAUX.map(n => n.label);

  const charger = useCallback(() => {
    repetiteurApi.list({}).then(d => setRepetiteurs(d.repetiteurs.slice(0, 5))).catch(() => {});
  }, []);

  useFocusEffect(useCallback(() => { charger(); }, [charger]));

  // Pré-sélectionne le niveau de l'élève connecté, sans l'imposer.
  useEffect(() => {
    if (user?.eleve?.niveau) {
      const all = [...niveauxDuCycle('primaire'), ...niveauxDuCycle('college'), ...niveauxDuCycle('lycee')];
      const n = all.find(x => x.value === user.eleve!.niveau);
      if (n) { setCycle(n.cycle); setNiveau(n.value); }
    }
  }, [user]);

  useEffect(() => {
    quizApi.list({ niveau: niveau || undefined }).then(d => setQuizzes(d.quizzes.slice(0, 5))).catch(() => {});
  }, [niveau]);

  const lancerRecherche = () => {
    router.push({
      pathname: '/(tabs)/repetiteurs',
      params: {
        matiere: searchMatiere || undefined,
        niveau: searchNiveau || undefined,
        ville: searchVille || undefined,
      },
    });
  };

  return (
    <ScrollView
      contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); charger(); setRefreshing(false); }} />}
    >
      <Text style={{ fontSize: 12, fontWeight: '800', letterSpacing: 1.5, color: Colors.brand, textTransform: 'uppercase' }}>
        Soutien scolaire en Guinée
      </Text>
      <Text style={{ fontSize: 28, fontWeight: '900', color: Colors.ink, lineHeight: 34, marginTop: 6 }}>
        Un enseignant pour progresser,{'\n'}<Text style={{ color: Colors.brand }}>du primaire au lycée.</Text>
      </Text>
      <Text style={{ fontSize: 14, color: Colors.inkMuted, marginTop: 10, lineHeight: 20 }}>
        Trouvez un accompagnement adapté à votre classe et révisez à votre rythme avec les quiz Gandal.
      </Text>

      <View style={{ flexDirection: 'row', gap: 10, marginTop: 18, marginBottom: 18 }}>
        <TouchableOpacity onPress={() => router.push('/(tabs)/repetiteurs')}
          style={{ flex: 1, backgroundColor: Colors.brand, borderRadius: 14, padding: 14, alignItems: 'center' }}>
          <Text style={{ color: Colors.white, fontWeight: '800' }}>Trouver un enseignant</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/(tabs)/quiz')}
          style={{ flex: 1, backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.surfaceBorder, borderRadius: 14, padding: 14, alignItems: 'center' }}>
          <Text style={{ color: Colors.ink, fontWeight: '800' }}>Découvrir les quiz</Text>
        </TouchableOpacity>
      </View>

      <Image source={require('../../assets/images/hero-illustration.jpg')}
        style={{ width: '100%', aspectRatio: 16 / 11, borderRadius: 18, marginBottom: 16 }} resizeMode="cover" />

      {/* Bloc recherche matière / classe / ville */}
      <View style={{ backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.surfaceBorder, borderRadius: 16, padding: 14, gap: 10, marginBottom: 16 }}>
        <SearchField icon="book-outline" label="Matière" value={searchMatiere} placeholder="Toutes les matières" onPress={() => setOpenSheet('matiere')} />
        <SearchField icon="school-outline" label="Classe" value={searchNiveau ? niveauLabel(searchNiveau) : null} placeholder="Toutes les classes" onPress={() => setOpenSheet('classe')} />
        <SearchField icon="location-outline" label="Ville" value={searchVille} placeholder="Toutes les villes" onPress={() => setOpenSheet('ville')} />
        <TouchableOpacity onPress={lancerRecherche}
          style={{ flexDirection: 'row', gap: 8, backgroundColor: Colors.brand, borderRadius: 12, paddingVertical: 13, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="search" size={16} color={Colors.white} />
          <Text style={{ color: Colors.white, fontWeight: '800' }}>Rechercher</Text>
        </TouchableOpacity>
      </View>

      <View style={{ alignSelf: 'flex-start', marginBottom: 26 }}>
        <Text style={{ fontSize: 16, fontStyle: 'italic', fontWeight: '600', color: Colors.brand }}>
          Apprendre aujourd'hui, bâtir demain.
        </Text>
        <View style={{ width: '92%', height: 3, backgroundColor: Colors.accent, borderRadius: 2, marginTop: 3, alignSelf: 'flex-end', transform: [{ rotate: '-1deg' }] }} />
      </View>

      {/* Comment ça marche */}
      <View style={{ gap: 14, marginBottom: 28 }}>
        {COMMENT_CA_MARCHE.map((etape, index) => (
          <View key={etape.titre} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
            <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: `${Colors.accent}33`, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 11, fontWeight: '800', color: Colors.ink }}>0{index + 1}</Text>
            </View>
            <Ionicons name={etape.icon} size={20} color={Colors.brand} style={{ marginTop: 2 }} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: '800', color: Colors.ink, fontSize: 14 }}>{etape.titre}</Text>
              <Text style={{ fontSize: 12, color: Colors.inkMuted, marginTop: 2 }}>{etape.texte}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* À chaque classe, ses révisions */}
      <Text style={{ fontSize: 18, fontWeight: '900', color: Colors.ink, marginBottom: 12 }}>À chaque classe, ses révisions</Text>
      <View style={{ gap: 10, marginBottom: 26 }}>
        {CYCLES.map(c => (
          <TouchableOpacity key={c.value} onPress={() => router.push({ pathname: '/(tabs)/quiz', params: { cycle: c.value } })}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.surfaceBorder, borderRadius: 16, padding: 16 }}>
            <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: `${Colors.accent}33`, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name={CYCLE_MOTIFS[c.value].icon} size={22} color={Colors.brand} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: '800', color: Colors.ink, fontSize: 16 }}>{c.label}</Text>
              <Text style={{ fontSize: 12, color: Colors.inkMuted, marginTop: 2, lineHeight: 17 }}>{CYCLE_MOTIFS[c.value].desc}</Text>
              <Text style={{ fontSize: 12, fontWeight: '800', color: Colors.brand, marginTop: 6 }}>Explorer les quiz  →</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={{ fontSize: 16, fontWeight: '800', color: Colors.ink, marginBottom: 10 }}>Enseignants disponibles</Text>
      {repetiteurs.length === 0 ? (
        <Text style={{ color: Colors.inkMuted, fontSize: 13, marginBottom: 20 }}>Aucun enseignant disponible.</Text>
      ) : repetiteurs.map(r => (
        <TouchableOpacity key={r._id} onPress={() => router.push(`/repetiteur/${r._id}`)}
          style={{ backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.surfaceBorder, borderRadius: 14, padding: 14, marginBottom: 10 }}>
          <Text style={{ fontWeight: '800', color: Colors.ink }}>{r.prenom} {r.nom}</Text>
          <Text style={{ fontSize: 12, color: Colors.inkMuted, marginTop: 2 }}>{r.repetiteur.matieres?.join(', ')}</Text>
        </TouchableOpacity>
      ))}

      <Text style={{ fontSize: 16, fontWeight: '800', color: Colors.ink, marginTop: 12, marginBottom: 10 }}>Teste-toi</Text>

      {/* Filtres niveau : cycle puis classe précise */}
      <FlatList
        horizontal showsHorizontalScrollIndicator={false}
        data={[{ value: null, label: 'Tous niveaux' }, ...CYCLES.map(c => ({ value: c.value, label: c.label }))]}
        keyExtractor={item => item.label}
        style={{ marginBottom: 8 }}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => { setCycle(item.value); setNiveau(null); }}
            style={{ backgroundColor: cycle === item.value ? Colors.brand : Colors.white, borderWidth: 1, borderColor: cycle === item.value ? Colors.brand : Colors.surfaceBorder, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, marginRight: 8 }}>
            <Text style={{ color: cycle === item.value ? Colors.white : Colors.ink, fontSize: 12, fontWeight: '700' }}>{item.label}</Text>
          </TouchableOpacity>
        )}
      />
      {cycle && (
        <FlatList
          horizontal showsHorizontalScrollIndicator={false}
          data={[{ value: null, label: 'Toutes les classes' }, ...niveauxDuCycle(cycle).map(n => ({ value: n.value, label: n.label }))]}
          keyExtractor={item => item.label}
          style={{ marginBottom: 14 }}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => setNiveau(item.value)}
              style={{ backgroundColor: niveau === item.value ? Colors.brand : Colors.white, borderWidth: 1, borderColor: niveau === item.value ? Colors.brand : Colors.surfaceBorder, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, marginRight: 8 }}>
              <Text style={{ color: niveau === item.value ? Colors.white : Colors.ink, fontSize: 12, fontWeight: '700' }}>{item.label}</Text>
            </TouchableOpacity>
          )}
        />
      )}

      {quizzes.length === 0 ? (
        <Text style={{ color: Colors.inkMuted, fontSize: 13 }}>Aucun quiz publié pour ces critères.</Text>
      ) : quizzes.map(q => (
        <TouchableOpacity key={q._id} onPress={() => router.push(`/quiz/${q._id}`)}
          style={{ backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.surfaceBorder, borderRadius: 14, padding: 14, marginBottom: 10 }}>
          <Text style={{ fontWeight: '800', color: Colors.ink }}>{q.titre}</Text>
          <Text style={{ fontSize: 12, color: Colors.inkMuted, marginTop: 2 }}>{q.matiere} · {niveauLabel(q.niveau)}</Text>
        </TouchableOpacity>
      ))}

      <SelectSheet visible={openSheet === 'matiere'} title="Choisir une matière" options={MATIERES}
        onSelect={v => setSearchMatiere(v)} onClose={() => setOpenSheet(null)} />
      <SelectSheet visible={openSheet === 'classe'} title="Choisir une classe" options={NIVEAU_LABELS}
        onSelect={label => setSearchNiveau(label ? (NIVEAUX.find(n => n.label === label)?.value ?? null) : null)} onClose={() => setOpenSheet(null)} />
      <SelectSheet visible={openSheet === 'ville'} title="Choisir une ville" options={ALL_CITIES}
        search={{ value: villeSearch, onChange: setVilleSearch }}
        onSelect={v => setSearchVille(v)} onClose={() => { setOpenSheet(null); setVilleSearch(''); }} />
    </ScrollView>
  );
}
