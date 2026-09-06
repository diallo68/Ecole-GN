'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { quizApi } from '@/lib/api';
import type { QuizDetail, QuizCorrection } from '@/types';

export default function QuizPlayPage() {
  const { id } = useParams<{ id: string }>();
  const [quiz, setQuiz] = useState<QuizDetail | null>(null);
  const [reponses, setReponses] = useState<(number | null)[]>([]);
  const [result, setResult] = useState<{ score: number; total: number; correction: QuizCorrection[] } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    quizApi.getById(id).then(d => {
      setQuiz(d.quiz);
      setReponses(new Array(d.quiz.questions.length).fill(null));
    }).catch(() => toast.error('Quiz introuvable'));
  }, [id]);

  const choisir = (qIndex: number, choixIndex: number) => {
    setReponses(prev => prev.map((r, i) => (i === qIndex ? choixIndex : r)));
  };

  const soumettre = async () => {
    if (reponses.some(r => r === null)) { toast.error('Réponds à toutes les questions'); return; }
    setLoading(true);
    try {
      const data = await quizApi.submit(id, reponses as number[]);
      setResult(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  if (!quiz) return <p className="text-slate-500">Chargement...</p>;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-1">{quiz.titre}</h1>
      <p className="text-slate-500 mb-6">{quiz.matiere} · {quiz.niveau}</p>

      {result && (
        <div className="bg-brand/10 border border-brand rounded-xl p-4 mb-6 text-center">
          <p className="text-2xl font-extrabold text-brand">{result.score} / {result.total}</p>
        </div>
      )}

      <div className="space-y-6">
        {quiz.questions.map((q, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="font-semibold mb-2">{i + 1}. {q.question}</p>
            <div className="space-y-2">
              {q.choix.map((c, ci) => {
                const isSelected = reponses[i] === ci;
                const correction = result?.correction[i];
                const isCorrectAnswer = correction && correction.reponseCorrecte === ci;
                let style = 'border-slate-300';
                if (result) {
                  if (isCorrectAnswer) style = 'border-green-500 bg-green-50';
                  else if (isSelected && !correction?.correct) style = 'border-red-500 bg-red-50';
                } else if (isSelected) style = 'border-brand bg-blue-50';

                return (
                  <button key={ci} disabled={!!result} onClick={() => choisir(i, ci)}
                    className={`w-full text-left border rounded-lg px-3 py-2 text-sm ${style}`}>
                    {c}
                  </button>
                );
              })}
            </div>
            {result?.correction[i]?.explication && (
              <p className="text-xs text-slate-500 mt-2 italic">{result.correction[i].explication}</p>
            )}
          </div>
        ))}
      </div>

      {!result && (
        <button onClick={soumettre} disabled={loading} className="mt-6 w-full bg-brand text-white rounded-lg py-2.5 font-semibold hover:bg-blue-700 disabled:opacity-50">
          {loading ? 'Correction...' : 'Valider mes réponses'}
        </button>
      )}
    </div>
  );
}
