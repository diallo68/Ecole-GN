import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { quizApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Colors } from '@/lib/constants';
import type { QuizDetail, QuizCorrection } from '@/types';

const ESSAI_GRATUIT_KEY = 'gandal_essai_gratuit_utilise';

export default function QuizPlayScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { isLoggedIn } = useAuthStore();
  const [quiz, setQuiz] = useState<QuizDetail | null>(null);
  const [reponses, setReponses] = useState<(number | null)[]>([]);
  const [result, setResult] = useState<{ score: number; total: number; correction: QuizCorrection[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [essaiEpuise, setEssaiEpuise] = useState<boolean | null>(null); // null = vérification en cours
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    (async () => {
      if (!isLoggedIn()) {
        const utilise = await AsyncStorage.getItem(ESSAI_GRATUIT_KEY);
        if (utilise) { setEssaiEpuise(true); return; }
      }
      setEssaiEpuise(false);
      quizApi.getById(id).then(d => {
        setQuiz(d.quiz);
        setReponses(new Array(d.quiz.questions.length).fill(null));
      }).catch(() => Toast.show({ type: 'error', text1: 'Quiz introuvable' }));
    })();
  }, [id]);

  const choisir = (qIndex: number, choixIndex: number) => {
    if (result) return;
    setReponses(prev => prev.map((r, i) => (i === qIndex ? choixIndex : r)));
  };

  const soumettre = async () => {
    if (reponses.some(r => r === null)) { Toast.show({ type: 'error', text1: 'Réponds à toutes les questions' }); return; }
    setLoading(true);
    try {
      const data = await quizApi.submit(id, reponses as number[]);
      setResult(data);
      if (!isLoggedIn()) await AsyncStorage.setItem(ESSAI_GRATUIT_KEY, 'true');
    } catch (e: any) {
      Toast.show({ type: 'error', text1: e.message || 'Erreur' });
    } finally {
      setLoading(false);
    }
  };

  if (essaiEpuise === null) return <ActivityIndicator style={{ marginTop: 40 }} color={Colors.brand} />;

  if (essaiEpuise) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.surfaceBg, padding: 24, alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name="lock-closed-outline" size={32} color={Colors.brand} style={{ marginBottom: 12 }} />
        <Text style={{ fontSize: 18, fontWeight: '900', color: Colors.ink, textAlign: 'center', marginBottom: 8 }}>
          Ton test gratuit est déjà utilisé
        </Text>
        <Text style={{ fontSize: 13, color: Colors.inkMuted, textAlign: 'center', marginBottom: 24 }}>
          Sans inscription, un seul quiz d'essai est disponible. Crée un compte gratuit pour continuer à t'entraîner à volonté.
        </Text>
        <TouchableOpacity onPress={() => router.push('/register')}
          style={{ backgroundColor: Colors.brand, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 28 }}>
          <Text style={{ color: Colors.white, fontWeight: '800' }}>Créer mon compte gratuit</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!quiz) return <ActivityIndicator style={{ marginTop: 40 }} color={Colors.brand} />;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: Colors.surfaceBg }} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <Text style={{ fontSize: 20, fontWeight: '900', color: Colors.ink }}>{quiz.titre}</Text>
      <Text style={{ fontSize: 13, color: Colors.inkMuted, marginBottom: 16 }}>{quiz.matiere} · {quiz.niveau}</Text>

      {result && (
        <View style={{ backgroundColor: Colors.brandLight, borderRadius: 14, padding: 16, marginBottom: 12, alignItems: 'center' }}>
          <Text style={{ fontSize: 24, fontWeight: '900', color: Colors.brand }}>{result.score} / {result.total}</Text>
        </View>
      )}

      {result && !isLoggedIn() && (
        <View style={{ backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.surfaceBorder, borderRadius: 14, padding: 14, marginBottom: 16, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Ionicons name="sparkles-outline" size={20} color={Colors.brand} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.ink }}>C'était ton essai gratuit !</Text>
            <Text style={{ fontSize: 11, color: Colors.inkMuted }}>Inscris-toi pour passer d'autres quiz.</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/register')}>
            <Text style={{ fontSize: 12, fontWeight: '800', color: Colors.brand }}>S'inscrire →</Text>
          </TouchableOpacity>
        </View>
      )}

      {result ? (
        // ── Révision : toutes les questions avec correction ──────────────
        quiz.questions.map((q, i) => (
          <QuestionCard key={i} q={q} index={i} selected={reponses[i]} correction={result.correction[i]} onSelect={() => {}} disabled />
        ))
      ) : (
        // ── Une question à la fois ────────────────────────────────────────
        <>
          <View style={{ marginBottom: 16 }}>
            <View style={{ height: 5, borderRadius: 3, backgroundColor: Colors.surfaceBg, overflow: 'hidden', marginBottom: 6 }}>
              <View style={{ height: '100%', borderRadius: 3, backgroundColor: Colors.brand, width: `${((currentIndex + 1) / quiz.questions.length) * 100}%` }} />
            </View>
            <Text style={{ fontSize: 11, fontWeight: '700', color: Colors.inkSubtle }}>Question {currentIndex + 1} sur {quiz.questions.length}</Text>
          </View>

          <QuestionCard
            q={quiz.questions[currentIndex]}
            index={currentIndex}
            selected={reponses[currentIndex]}
            onSelect={ci => choisir(currentIndex, ci)}
          />

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
            <TouchableOpacity onPress={() => setCurrentIndex(i => Math.max(0, i - 1))} disabled={currentIndex === 0}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 6, opacity: currentIndex === 0 ? 0.3 : 1 }}>
              <Ionicons name="arrow-back" size={16} color={Colors.inkMuted} />
              <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.inkMuted }}>Précédent</Text>
            </TouchableOpacity>

            {currentIndex < quiz.questions.length - 1 ? (
              <TouchableOpacity onPress={() => setCurrentIndex(i => i + 1)} disabled={reponses[currentIndex] === null}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.brand, borderRadius: 20, paddingVertical: 10, paddingHorizontal: 20, opacity: reponses[currentIndex] === null ? 0.4 : 1 }}>
                <Text style={{ color: Colors.white, fontWeight: '800', fontSize: 13 }}>Suivant</Text>
                <Ionicons name="arrow-forward" size={16} color={Colors.white} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={soumettre} disabled={loading || reponses[currentIndex] === null}
                style={{ backgroundColor: Colors.brand, borderRadius: 20, paddingVertical: 10, paddingHorizontal: 20, opacity: (loading || reponses[currentIndex] === null) ? 0.4 : 1 }}>
                <Text style={{ color: Colors.white, fontWeight: '800', fontSize: 13 }}>{loading ? 'Correction...' : 'Valider'}</Text>
              </TouchableOpacity>
            )}
          </View>
        </>
      )}
    </ScrollView>
  );
}

function QuestionCard({ q, index, selected, correction, onSelect, disabled }: {
  q: { question: string; choix: string[] };
  index: number;
  selected: number | null;
  correction?: QuizCorrection;
  onSelect: (choixIndex: number) => void;
  disabled?: boolean;
}) {
  return (
    <View style={{ backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.surfaceBorder, borderRadius: 14, padding: 14, marginBottom: 12 }}>
      <Text style={{ fontWeight: '700', color: Colors.ink, marginBottom: 8 }}>{index + 1}. {q.question}</Text>
      {q.choix.map((c, ci) => {
        const isSelected = selected === ci;
        const isCorrectAnswer = correction && correction.reponseCorrecte === ci;
        let borderColor = Colors.surfaceBorder;
        let bg = Colors.white;
        if (correction) {
          if (isCorrectAnswer) { borderColor = Colors.success; bg = '#f0fdf4'; }
          else if (isSelected && !correction.correct) { borderColor = Colors.danger; bg = '#fef2f2'; }
        } else if (isSelected) { borderColor = Colors.brand; bg = Colors.brandLight; }

        return (
          <TouchableOpacity key={ci} disabled={disabled} onPress={() => onSelect(ci)}
            style={{ borderWidth: 1.5, borderColor, backgroundColor: bg, borderRadius: 10, padding: 10, marginBottom: 6 }}>
            <Text style={{ fontSize: 13, color: Colors.ink }}>{c}</Text>
          </TouchableOpacity>
        );
      })}
      {correction?.explication && (
        <Text style={{ fontSize: 11, color: Colors.inkMuted, fontStyle: 'italic', marginTop: 4 }}>{correction.explication}</Text>
      )}
    </View>
  );
}
