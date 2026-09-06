'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { repetiteurApi, quizApi } from '@/lib/api';
import type { Repetiteur, QuizSummary } from '@/types';

export default function HomePage() {
  const [repetiteurs, setRepetiteurs] = useState<Repetiteur[]>([]);
  const [quizzes, setQuizzes] = useState<QuizSummary[]>([]);

  useEffect(() => {
    repetiteurApi.list({}).then(d => setRepetiteurs(d.repetiteurs.slice(0, 4))).catch(() => {});
    quizApi.list({}).then(d => setQuizzes(d.quizzes.slice(0, 6))).catch(() => {});
  }, []);

  return (
    <div className="space-y-10">
      <section className="text-center py-10">
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900">
          Le soutien scolaire, partout en Guinée
        </h1>
        <p className="mt-3 text-slate-600 max-w-xl mx-auto">
          Trouve un répétiteur, réserve un cours en présentiel ou en ligne, et teste tes connaissances avec nos quiz gratuits.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/repetiteurs" className="bg-brand text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-700">
            Trouver un répétiteur
          </Link>
          <Link href="/quiz" className="bg-white border border-slate-300 px-5 py-2.5 rounded-lg font-semibold hover:bg-slate-50">
            Faire un quiz
          </Link>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold">Répétiteurs disponibles</h2>
          <Link href="/repetiteurs" className="text-sm text-brand font-semibold">Voir tout →</Link>
        </div>
        {repetiteurs.length === 0 ? (
          <p className="text-slate-500 text-sm">Aucun répétiteur disponible pour le moment.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {repetiteurs.map(r => (
              <Link key={r._id} href={`/repetiteurs/${r._id}`} className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow">
                <p className="font-bold">{r.prenom} {r.nom}</p>
                <p className="text-sm text-slate-500">{r.repetiteur.matieres?.join(', ')}</p>
                <p className="text-xs text-slate-400 mt-1">{r.city}</p>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold">Teste-toi — quiz gratuits</h2>
          <Link href="/quiz" className="text-sm text-brand font-semibold">Voir tout →</Link>
        </div>
        {quizzes.length === 0 ? (
          <p className="text-slate-500 text-sm">Aucun quiz publié pour le moment.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {quizzes.map(q => (
              <Link key={q._id} href={`/quiz/${q._id}`} className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow">
                <p className="font-bold">{q.titre}</p>
                <p className="text-sm text-slate-500">{q.matiere} · {q.niveau}</p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
