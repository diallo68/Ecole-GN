'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { HelpCircle } from 'lucide-react';
import { quizApi } from '@/lib/api';
import { CYCLES, niveauxDuCycle, niveauLabel, matieresDuNiveau } from '@/lib/constants';
import ErrorState from '@/components/ErrorState';
import EmptyState from '@/components/EmptyState';
import type { QuizSummary, Cycle, Niveau } from '@/types';

export default function QuizListPage() {
  return (
    <Suspense fallback={<p className="text-ink-muted">Chargement...</p>}>
      <QuizListContent />
    </Suspense>
  );
}

function QuizListContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const cycle = searchParams.get('cycle') as Cycle | null;
  const niveau = searchParams.get('niveau') as Niveau | null;

  const [quizzes, setQuizzes] = useState<QuizSummary[]>([]);
  const [matiere, setMatiere] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const charger = () => {
    if (!niveau) return;
    setLoading(true);
    setError(false);
    quizApi.list({ matiere: matiere || undefined, niveau }).then(d => setQuizzes(d.quizzes)).catch(() => setError(true)).finally(() => setLoading(false));
  };
  useEffect(charger, [matiere, niveau]);

  // ── Étape 1 : choix du cycle ─────────────────────────────────────────
  if (!cycle) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-2xl font-bold text-ink mb-1">Quiz d'auto-évaluation</h1>
        <p className="text-ink-muted mb-8">Commence par choisir ton niveau d'étude.</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {CYCLES.map(c => (
            <button key={c.value} onClick={() => router.push(`/quiz?cycle=${c.value}`)}
              className="bg-white rounded-2xl border border-ink/10 p-6 flex flex-col items-center gap-2 hover:border-brand hover:shadow-md transition-all">
              <span className="font-bold text-ink">{c.label}</span>
              <span className="text-xs text-ink-muted">{c.desc}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ── Étape 2 : choix de la classe précise ────────────────────────────
  if (!niveau) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-2xl font-bold text-ink">{CYCLES.find(c => c.value === cycle)?.label}</h1>
          <Link href="/quiz" className="text-sm text-brand font-semibold hover:text-brand-dark">Changer de niveau</Link>
        </div>
        <p className="text-ink-muted mb-8 text-left">Choisis ta classe.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {niveauxDuCycle(cycle).map(n => (
            <button key={n.value} onClick={() => router.push(`/quiz?cycle=${cycle}&niveau=${n.value}`)}
              className="bg-white rounded-2xl border border-ink/10 p-5 font-bold text-ink hover:border-brand hover:shadow-md transition-all">
              {n.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ── Étape 3 : liste des quiz de la classe choisie ───────────────────────
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-bold text-ink">Quiz · {niveauLabel(niveau)}</h1>
        <Link href="/quiz" className="text-sm text-brand font-semibold hover:text-brand-dark">Changer de niveau</Link>
      </div>
      <p className="text-ink-muted mb-4">Teste tes connaissances gratuitement.</p>

      <div className="flex flex-wrap gap-2 mb-6">
        <FilterPill active={!matiere} onClick={() => setMatiere('')} label="Toutes les matières" />
        {matieresDuNiveau(niveau).map(m => <FilterPill key={m} active={matiere === m} onClick={() => setMatiere(m)} label={m} />)}
      </div>

      {loading ? (
        <p className="text-ink-muted">Chargement...</p>
      ) : error ? (
        <ErrorState message="Impossible de charger les quiz." onRetry={charger} />
      ) : quizzes.length === 0 ? (
        <EmptyState icon={HelpCircle} message="Aucun quiz disponible pour cette sélection."
          ctaLabel={matiere ? 'Voir les autres matières' : undefined} onCta={() => setMatiere('')} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {quizzes.map(q => (
            <Link key={q._id} href={`/quiz/${q._id}`} className="bg-white rounded-2xl border border-ink/10 p-4 hover:shadow-md transition-shadow">
              <p className="font-bold">{q.titre}</p>
              <p className="text-sm text-ink-muted">{q.matiere} · {niveauLabel(q.niveau)}</p>
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
