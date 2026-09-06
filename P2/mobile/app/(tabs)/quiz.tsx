import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { quizApi } from '@/lib/api';
import { Colors, MATIERES } from '@/lib/constants';
import type { QuizSummary, Niveau } from '@/types';

const NIVEAUX: Array<{ value: Niveau; label: string; icon: React.ComponentProps<typeof Ionicons>['name']; desc: string }> = [
  { value: 'primaire', label: 'Primaire', icon: 'school-outline', desc: 'CP au CM2' },
  { value: 'college', label: 'Collège', icon: 'library-outline', desc: '6ème à la 3ème' },
  { value: 'lycee', label: 'Lycée', icon: 'ribbon-outline', desc: 'Seconde à Terminale' },
];

export default function QuizListScreen() {
  const router = useRouter();
  const [niveau, setNiveau] = useState<Niveau | null>(null);
  const [matiere, setMatiere] = useState<string | null>(null);
  const [quizzes, setQuizzes] = useState<QuizSummary[]>([]);

  useEffect(() => {
    if (!niveau) return;
    quizApi.list({ matiere: matiere || undefined, niveau }).then(d => setQuizzes(d.quizzes)).catch(() => {});
  }, [niveau, matiere]);

  // ── Étape 1 : choix du niveau, obligatoire ──────────────────────────────
  if (!niveau) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.surfaceBg, padding: 20, justifyContent: 'center' }}>
        <Text style={{ fontSize: 20, fontWeight: '900', color: Colors.ink, textAlign: 'center', marginBottom: 6 }}>Quiz d'auto-évaluation</Text>
        <Text style={{ fontSize: 13, color: Colors.inkMuted, textAlign: 'center', marginBottom: 24 }}>Commence par choisir ton niveau scolaire.</Text>
        <View style={{ gap: 12 }}>
          {NIVEAUX.map(n => (
            <TouchableOpacity key={n.value} onPress={() => setNiveau(n.value)}
              style={{ backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.surfaceBorder, borderRadius: 16, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
              <Ionicons name={n.icon} size={26} color={Colors.brand} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '800', color: Colors.ink, fontSize: 15 }}>{n.label}</Text>
                <Text style={{ fontSize: 12, color: Colors.inkMuted }}>{n.desc}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.inkSubtle} />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  }

  // ── Étape 2 : liste des quiz du niveau choisi ───────────────────────────
  return (
    <View style={{ flex: 1, backgroundColor: Colors.surfaceBg }}>
      <View style={{ padding: 16, paddingBottom: 8, gap: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 16, fontWeight: '800', color: Colors.ink }}>
            {NIVEAUX.find(n => n.value === niveau)?.label}
          </Text>
          <TouchableOpacity onPress={() => { setNiveau(null); setMatiere(null); }}>
            <Text style={{ fontSize: 12, color: Colors.brand, fontWeight: '700' }}>Changer de niveau</Text>
          </TouchableOpacity>
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
            <Text style={{ fontSize: 12, color: Colors.inkMuted, marginTop: 2 }}>{item.matiere} · {item.niveau}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
