'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { quizApi } from '@/lib/api';
import type { QuizSummary } from '@/types';

const MATIERES = ['Mathématiques', 'Français', 'Sciences Physiques', 'SVT'];
const NIVEAUX = ['primaire', 'college', 'lycee'];

export default function QuizListPage() {
  const [quizzes, setQuizzes] = useState<QuizSummary[]>([]);
  const [matiere, setMatiere] = useState('');
  const [niveau, setNiveau] = useState('');

  useEffect(() => {
    quizApi.list({ matiere: matiere || undefined, niveau: niveau || undefined }).then(d => setQuizzes(d.quizzes)).catch(() => {});
  }, [matiere, niveau]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Quiz d'auto-évaluation</h1>
      <p className="text-ink/60 mb-4">Teste tes connaissances gratuitement, quel que soit ton niveau.</p>

      <div className="flex flex-wrap gap-3 mb-6">
        <select value={matiere} onChange={e => setMatiere(e.target.value)} className="border border-ink/15 rounded-lg px-3 py-2">
          <option value="">Toutes les matières</option>
          {MATIERES.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <select value={niveau} onChange={e => setNiveau(e.target.value)} className="border border-ink/15 rounded-lg px-3 py-2">
          <option value="">Tous les niveaux</option>
          {NIVEAUX.map(n => <option key={n} value={n}>{n}</option>)}
        </select>
      </div>

      {quizzes.length === 0 ? (
        <p className="text-ink/60">Aucun quiz disponible pour ces critères.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {quizzes.map(q => (
            <Link key={q._id} href={`/quiz/${q._id}`} className="bg-white rounded-xl border border-ink/10 p-4 hover:shadow-md transition-shadow">
              <p className="font-bold">{q.titre}</p>
              <p className="text-sm text-ink/60">{q.matiere} · {q.niveau}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
