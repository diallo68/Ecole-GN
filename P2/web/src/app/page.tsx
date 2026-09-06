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
    <div className="space-y-14">
      <section className="relative overflow-hidden rounded-3xl bg-brand-dark text-white px-6 py-14 md:py-20 text-center">
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-accent/20" />
        <div className="absolute -bottom-24 -left-10 w-72 h-72 rounded-full bg-flag/20" />
        <div className="relative">
          <span className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-accent text-xs font-bold uppercase tracking-wide px-3 py-1.5 rounded-full">
            🇬🇳 Fait pour la Guinée
          </span>
          <h1 className="mt-5 text-3xl md:text-5xl font-extrabold leading-tight">
            Le soutien scolaire,<br className="hidden md:block" /> partout en <span className="text-accent">Guinée</span>
          </h1>
          <p className="mt-4 text-white/80 max-w-xl mx-auto">
            Trouve un enseignant, réserve un cours en présentiel ou en ligne, et teste tes connaissances avec nos quiz gratuits.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link href="/repetiteurs" className="bg-accent text-brand-dark px-6 py-3 rounded-full font-bold hover:brightness-95 transition shadow-lg shadow-black/10">
              Trouver un enseignant
            </Link>
            <Link href="/quiz" className="bg-white/10 border border-white/30 text-white px-6 py-3 rounded-full font-bold hover:bg-white/20 transition">
              Faire un quiz
            </Link>
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-brand-dark">Enseignants disponibles</h2>
          <Link href="/repetiteurs" className="text-sm text-brand font-semibold hover:text-brand-dark">Voir tout →</Link>
        </div>
        {repetiteurs.length === 0 ? (
          <p className="text-[#14201b]/50 text-sm">Aucun enseignant disponible pour le moment.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {repetiteurs.map(r => (
              <Link key={r._id} href={`/repetiteurs/${r._id}`} className="bg-white rounded-2xl border border-black/5 p-4 hover:shadow-lg hover:-translate-y-0.5 transition-all">
                <div className="w-10 h-10 rounded-full bg-brand-light text-brand-dark font-bold grid place-items-center mb-2">
                  {r.prenom?.[0]}{r.nom?.[0]}
                </div>
                <p className="font-bold">{r.prenom} {r.nom}</p>
                <p className="text-sm text-[#14201b]/60">{r.repetiteur.matieres?.join(', ')}</p>
                <p className="text-xs text-[#14201b]/40 mt-1">{r.city}</p>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-brand-dark">Teste-toi — quiz gratuits</h2>
          <Link href="/quiz" className="text-sm text-brand font-semibold hover:text-brand-dark">Voir tout →</Link>
        </div>
        {quizzes.length === 0 ? (
          <p className="text-[#14201b]/50 text-sm">Aucun quiz publié pour le moment.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {quizzes.map(q => (
              <Link key={q._id} href={`/quiz/${q._id}`} className="bg-white rounded-2xl border border-black/5 p-4 hover:shadow-lg hover:-translate-y-0.5 transition-all">
                <p className="font-bold">{q.titre}</p>
                <p className="text-sm text-[#14201b]/60">{q.matiere} · {q.niveau}</p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
