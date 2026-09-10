import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { quizApi } from '@/lib/api';
import { Colors, CYCLES, niveauxDuCycle, niveauLabel, matieresDuNiveau } from '@/lib/constants';
import type { QuizSummary, Niveau, Cycle } from '@/types';

export default function QuizListScreen() {
  const router = useRouter();
  const { cycle: cycleParam } = useLocalSearchParams<{ cycle?: string }>();
  const [cycle, setCycle] = useState<Cycle | null>(null);
  const [niveau, setNiveau] = useState<Niveau | null>(null);
  const [matiere, setMatiere] = useState<string | null>(null);
  const [quizzes, setQuizzes] = useState<QuizSummary[]>([]);

  // Arrivée depuis la carte "À chaque classe, ses révisions" de l'accueil
  // (?cycle=...) — pré-sélectionne le cycle sans passer par l'étape 1.
  useEffect(() => {
    if (cycleParam && CYCLES.some(c => c.value === cycleParam)) setCycle(cycleParam as Cycle);
  }, [cycleParam]);

  useEffect(() => {
    if (!niveau) return;
    quizApi.list({ matiere: matiere || undefined, niveau }).then(d => setQuizzes(d.quizzes)).catch(() => {});
  }, [niveau, matiere]);

  // ── Étape 1 : choix du cycle ─────────────────────────────────────────────
  if (!cycle) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.surfaceBg, padding: 20, justifyContent: 'center' }}>
        <Text style={{ fontSize: 20, fontWeight: '900', color: Colors.ink, textAlign: 'center', marginBottom: 6 }}>Quiz d'auto-évaluation</Text>
        <Text style={{ fontSize: 13, color: Colors.inkMuted, textAlign: 'center', marginBottom: 24 }}>Commence par choisir ton niveau d'étude.</Text>
        <View style={{ gap: 12 }}>
          {CYCLES.map(c => (
            <TouchableOpacity key={c.value} onPress={() => setCycle(c.value)}
              style={{ backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.surfaceBorder, borderRadius: 16, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '800', color: Colors.ink, fontSize: 15 }}>{c.label}</Text>
                <Text style={{ fontSize: 12, color: Colors.inkMuted }}>{c.desc}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.inkSubtle} />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  }

  // ── Étape 2 : choix de la classe précise ─────────────────────────────────
  if (!niveau) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.surfaceBg, padding: 20 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <Text style={{ fontSize: 18, fontWeight: '900', color: Colors.ink }}>{CYCLES.find(c => c.value === cycle)?.label}</Text>
          <TouchableOpacity onPress={() => setCycle(null)}>
            <Text style={{ fontSize: 12, color: Colors.brand, fontWeight: '700' }}>Changer</Text>
          </TouchableOpacity>
        </View>
        <Text style={{ fontSize: 13, color: Colors.inkMuted, marginBottom: 20 }}>Choisis ta classe.</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {niveauxDuCycle(cycle).map(n => (
            <TouchableOpacity key={n.value} onPress={() => setNiveau(n.value)}
              style={{ backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.surfaceBorder, borderRadius: 14, paddingVertical: 16, paddingHorizontal: 20, minWidth: '30%', alignItems: 'center' }}>
              <Text style={{ fontWeight: '800', color: Colors.ink, fontSize: 14 }}>{n.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  }

  // ── Étape 3 : liste des quiz de la classe choisie ────────────────────────
  return (
    <View style={{ flex: 1, backgroundColor: Colors.surfaceBg }}>
      <View style={{ padding: 16, paddingBottom: 8, gap: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 16, fontWeight: '800', color: Colors.ink }}>{niveauLabel(niveau)}</Text>
          <TouchableOpacity onPress={() => { setCycle(null); setNiveau(null); setMatiere(null); }}>
            <Text style={{ fontSize: 12, color: Colors.brand, fontWeight: '700' }}>Changer de niveau</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          horizontal showsHorizontalScrollIndicator={false}
          data={[{ value: null, label: 'Toutes matières' }, ...matieresDuNiveau(niveau!).map(m => ({ value: m, label: m }))]}
          keyExtractor={item => item.label}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => setMatiere(item.value)}
              style={{ backgroundColor: matiere === item.value ? Colors.brand : Colors.white, borderWidth: 1, borderColor: matiere === item.value ? Colors.brand : Colors.surfaceBorder, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, marginRight: 8 }}>
              <Text style={{ color: matiere === item.value ? Colors.white : Colors.ink, fontSize: 12, fontWeight: '700' }}>{item.label}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
      <FlatList
        data={quizzes}
        keyExtractor={item => item._id}
        contentContainerStyle={{ padding: 16, paddingTop: 8, gap: 10 }}
        ListEmptyComponent={<Text style={{ textAlign: 'center', color: Colors.inkMuted, marginTop: 20 }}>Aucun quiz disponible.</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => router.push(`/quiz/${item._id}`)}
            style={{ backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.surfaceBorder, borderRadius: 14, padding: 14 }}>
            <Text style={{ fontWeight: '800', color: Colors.ink }}>{item.titre}</Text>
            <Text style={{ fontSize: 12, color: Colors.inkMuted, marginTop: 2 }}>{item.matiere} · {niveauLabel(item.niveau)}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
