import { useCallback, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { repetiteurApi, quizApi } from '@/lib/api';
import { Colors } from '@/lib/constants';
import type { Repetiteur, QuizSummary } from '@/types';

export default function HomeScreen() {
  const router = useRouter();
  const [repetiteurs, setRepetiteurs] = useState<Repetiteur[]>([]);
  const [quizzes, setQuizzes] = useState<QuizSummary[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const charger = useCallback(() => {
    repetiteurApi.list({}).then(d => setRepetiteurs(d.repetiteurs.slice(0, 5))).catch(() => {});
    quizApi.list({}).then(d => setQuizzes(d.quizzes.slice(0, 5))).catch(() => {});
  }, []);

  useFocusEffect(useCallback(() => { charger(); }, [charger]));

  return (
    <ScrollView
      contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); charger(); setRefreshing(false); }} />}
    >
      <Text style={{ fontSize: 24, fontWeight: '900', color: Colors.ink }}>Gandal</Text>
      <Text style={{ fontSize: 14, color: Colors.inkMuted, marginTop: 4, marginBottom: 20 }}>
        Le soutien scolaire, partout en Guinée
      </Text>

      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 24 }}>
        <TouchableOpacity onPress={() => router.push('/(tabs)/repetiteurs')}
          style={{ flex: 1, backgroundColor: Colors.brand, borderRadius: 14, padding: 14, alignItems: 'center' }}>
          <Text style={{ color: Colors.white, fontWeight: '800' }}>Trouver un enseignant</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/(tabs)/quiz')}
          style={{ flex: 1, backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.surfaceBorder, borderRadius: 14, padding: 14, alignItems: 'center' }}>
          <Text style={{ color: Colors.ink, fontWeight: '800' }}>Faire un quiz</Text>
        </TouchableOpacity>
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
      {quizzes.length === 0 ? (
        <Text style={{ color: Colors.inkMuted, fontSize: 13 }}>Aucun quiz publié.</Text>
      ) : quizzes.map(q => (
        <TouchableOpacity key={q._id} onPress={() => router.push(`/quiz/${q._id}`)}
          style={{ backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.surfaceBorder, borderRadius: 14, padding: 14, marginBottom: 10 }}>
          <Text style={{ fontWeight: '800', color: Colors.ink }}>{q.titre}</Text>
          <Text style={{ fontSize: 12, color: Colors.inkMuted, marginTop: 2 }}>{q.matiere} · {q.niveau}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}
