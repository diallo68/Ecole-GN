import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import Toast from 'react-native-toast-message';
import { quizApi } from '@/lib/api';
import { Colors } from '@/lib/constants';
import type { QuizDetail, QuizCorrection } from '@/types';

export default function QuizPlayScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [quiz, setQuiz] = useState<QuizDetail | null>(null);
  const [reponses, setReponses] = useState<(number | null)[]>([]);
  const [result, setResult] = useState<{ score: number; total: number; correction: QuizCorrection[] } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    quizApi.getById(id).then(d => {
      setQuiz(d.quiz);
      setReponses(new Array(d.quiz.questions.length).fill(null));
    }).catch(() => Toast.show({ type: 'error', text1: 'Quiz introuvable' }));
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
    } catch (e: any) {
      Toast.show({ type: 'error', text1: e.message || 'Erreur' });
    } finally {
      setLoading(false);
    }
  };

  if (!quiz) return <ActivityIndicator style={{ marginTop: 40 }} color={Colors.brand} />;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: Colors.surfaceBg }} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <Text style={{ fontSize: 20, fontWeight: '900', color: Colors.ink }}>{quiz.titre}</Text>
      <Text style={{ fontSize: 13, color: Colors.inkMuted, marginBottom: 16 }}>{quiz.matiere} · {quiz.niveau}</Text>

      {result && (
        <View style={{ backgroundColor: Colors.brandLight, borderRadius: 14, padding: 16, marginBottom: 16, alignItems: 'center' }}>
          <Text style={{ fontSize: 24, fontWeight: '900', color: Colors.brand }}>{result.score} / {result.total}</Text>
        </View>
      )}

      {quiz.questions.map((q, i) => (
        <View key={i} style={{ backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.surfaceBorder, borderRadius: 14, padding: 14, marginBottom: 12 }}>
          <Text style={{ fontWeight: '700', color: Colors.ink, marginBottom: 8 }}>{i + 1}. {q.question}</Text>
          {q.choix.map((c, ci) => {
            const isSelected = reponses[i] === ci;
            const correction = result?.correction[i];
            const isCorrectAnswer = correction && correction.reponseCorrecte === ci;
            let borderColor = Colors.surfaceBorder;
            let bg = Colors.white;
            if (result) {
              if (isCorrectAnswer) { borderColor = Colors.success; bg = '#f0fdf4'; }
              else if (isSelected && !correction?.correct) { borderColor = Colors.danger; bg = '#fef2f2'; }
            } else if (isSelected) { borderColor = Colors.brand; bg = Colors.brandLight; }

            return (
              <TouchableOpacity key={ci} onPress={() => choisir(i, ci)}
                style={{ borderWidth: 1.5, borderColor, backgroundColor: bg, borderRadius: 10, padding: 10, marginBottom: 6 }}>
                <Text style={{ fontSize: 13, color: Colors.ink }}>{c}</Text>
              </TouchableOpacity>
            );
          })}
          {result?.correction[i]?.explication && (
            <Text style={{ fontSize: 11, color: Colors.inkMuted, fontStyle: 'italic', marginTop: 4 }}>{result.correction[i].explication}</Text>
          )}
        </View>
      ))}

      {!result && (
        <TouchableOpacity onPress={soumettre} disabled={loading}
          style={{ backgroundColor: Colors.brand, borderRadius: 14, padding: 14, alignItems: 'center', opacity: loading ? 0.6 : 1 }}>
          <Text style={{ color: Colors.white, fontWeight: '800' }}>{loading ? 'Correction...' : 'Valider mes réponses'}</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}
