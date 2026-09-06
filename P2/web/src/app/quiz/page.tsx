'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { GraduationCap, School, Landmark } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { quizApi } from '@/lib/api';
import { MATIERES } from '@/lib/constants';
import type { QuizSummary, Niveau } from '@/types';

const NIVEAUX: Array<{ value: Niveau; label: string; icon: LucideIcon; desc: string }> = [
  { value: 'primaire', label: 'Primaire', icon: School, desc: 'CP au CM2' },
  { value: 'college', label: 'Collège', icon: GraduationCap, desc: '6ème à la 3ème' },
  { value: 'lycee', label: 'Lycée', icon: Landmark, desc: 'Seconde à Terminale' },
];

export default function QuizListPage() {
  return (
    <Suspense fallback={<p className="text-ink/60">Chargement...</p>}>
      <QuizListContent />
    </Suspense>
  );
}

function QuizListContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const niveau = searchParams.get('niveau') as Niveau | null;

  const [quizzes, setQuizzes] = useState<QuizSummary[]>([]);
  const [matiere, setMatiere] = useState('');

  useEffect(() => {
    if (!niveau) return;
    quizApi.list({ matiere: matiere || undefined, niveau }).then(d => setQuizzes(d.quizzes)).catch(() => {});
  }, [matiere, niveau]);

  // ── Étape 1 : choix du niveau, obligatoire avant de voir les quiz ──────
  if (!niveau) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-2xl font-bold text-ink mb-1">Quiz d'auto-évaluation</h1>
        <p className="text-ink/60 mb-8">Commence par choisir ton niveau scolaire.</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {NIVEAUX.map(n => (
            <button key={n.value} onClick={() => router.push(`/quiz?niveau=${n.value}`)}
              className="bg-white rounded-2xl border border-ink/10 p-6 flex flex-col items-center gap-2 hover:border-brand hover:shadow-md transition-all">
              <n.icon size={28} className="text-brand" strokeWidth={1.75} />
              <span className="font-bold text-ink">{n.label}</span>
              <span className="text-xs text-ink/50">{n.desc}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ── Étape 2 : liste des quiz du niveau choisi ───────────────────────────
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-bold text-ink">Quiz — {NIVEAUX.find(n => n.value === niveau)?.label}</h1>
        <Link href="/quiz" className="text-sm text-brand font-semibold hover:text-brand-dark">Changer de niveau</Link>
      </div>
      <p className="text-ink/60 mb-4">Teste tes connaissances gratuitement.</p>

      <div className="flex flex-wrap gap-2 mb-6">
        <FilterPill active={!matiere} onClick={() => setMatiere('')} label="Toutes les matières" />
        {MATIERES.map(m => <FilterPill key={m} active={matiere === m} onClick={() => setMatiere(m)} label={m} />)}
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

function FilterPill({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
        active ? 'bg-brand text-white border-brand' : 'bg-white border-ink/15 text-ink/70 hover:border-brand/40'
      }`}>
      {label}
    </button>
  );
}
