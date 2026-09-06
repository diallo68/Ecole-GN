import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { quizApi } from '@/lib/api';
import { Colors } from '@/lib/constants';
import type { QuizSummary } from '@/types';

export default function QuizListScreen() {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<QuizSummary[]>([]);

  useEffect(() => { quizApi.list({}).then(d => setQuizzes(d.quizzes)).catch(() => {}); }, []);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.surfaceBg }}>
      <FlatList
        data={quizzes}
        keyExtractor={item => item._id}
        contentContainerStyle={{ padding: 16, gap: 10 }}
        ListHeaderComponent={
          <Text style={{ fontSize: 13, color: Colors.inkMuted, marginBottom: 10 }}>
            Quiz gratuits pour te tester, quel que soit ton niveau.
          </Text>
        }
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
