import { useCallback, useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, RefreshControl, FlatList } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { repetiteurApi, quizApi } from '@/lib/api';
import { Colors, CYCLES, niveauxDuCycle, niveauLabel } from '@/lib/constants';
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

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [repetiteurs, setRepetiteurs] = useState<Repetiteur[]>([]);
  const [quizzes, setQuizzes] = useState<QuizSummary[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [cycle, setCycle] = useState<Cycle | null>(null);
  const [niveau, setNiveau] = useState<Niveau | null>(null);

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

  return (
    <ScrollView
      contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); charger(); setRefreshing(false); }} />}
    >
      <Image source={require('../../assets/images/hero-illustration.jpg')}
        style={{ width: '100%', aspectRatio: 16 / 11, borderRadius: 18, marginBottom: 18 }} resizeMode="cover" />

      <Text style={{ fontSize: 12, fontWeight: '800', letterSpacing: 1.5, color: Colors.brand, textTransform: 'uppercase' }}>
        Soutien scolaire en Guinée
      </Text>
      <Text style={{ fontSize: 28, fontWeight: '900', color: Colors.ink, lineHeight: 34, marginTop: 6 }}>
        Un enseignant pour progresser,{'\n'}<Text style={{ color: Colors.brand }}>du primaire au lycée.</Text>
      </Text>
      <Text style={{ fontSize: 14, color: Colors.inkMuted, marginTop: 10, lineHeight: 20 }}>
        Trouvez un accompagnement adapté à votre classe et révisez à votre rythme avec les quiz Gandal.
      </Text>

      <View style={{ flexDirection: 'row', gap: 10, marginTop: 18, marginBottom: 12 }}>
        <TouchableOpacity onPress={() => router.push('/(tabs)/repetiteurs')}
          style={{ flex: 1, backgroundColor: Colors.brand, borderRadius: 14, padding: 14, alignItems: 'center' }}>
          <Text style={{ color: Colors.white, fontWeight: '800' }}>Trouver un enseignant</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/(tabs)/quiz')}
          style={{ flex: 1, backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.surfaceBorder, borderRadius: 14, padding: 14, alignItems: 'center' }}>
          <Text style={{ color: Colors.ink, fontWeight: '800' }}>Découvrir les quiz</Text>
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
    </ScrollView>
  );
}
