'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Lock, Sparkles, ArrowLeft, ArrowRight } from 'lucide-react';
import { quizApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { niveauLabel } from '@/lib/constants';
import type { QuizDetail, QuizCorrection } from '@/types';

const ESSAI_GRATUIT_KEY = 'gandal_essai_gratuit_utilise';

export default function QuizPlayPage() {
  const { id } = useParams<{ id: string }>();
  const { isLoggedIn } = useAuthStore();
  const [quiz, setQuiz] = useState<QuizDetail | null>(null);
  const [reponses, setReponses] = useState<(number | null)[]>([]);
  const [result, setResult] = useState<{ score: number; total: number; correction: QuizCorrection[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [essaiEpuise, setEssaiEpuise] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Un visiteur non inscrit n'a droit qu'à un seul quiz d'essai (côté client) —
    // au-delà, on l'invite à créer un compte plutôt que de charger le quiz.
    if (!isLoggedIn() && typeof window !== 'undefined' && localStorage.getItem(ESSAI_GRATUIT_KEY)) {
      setEssaiEpuise(true);
      return;
    }
    quizApi.getById(id).then(d => {
      setQuiz(d.quiz);
      setReponses(new Array(d.quiz.questions.length).fill(null));
    }).catch(() => toast.error('Quiz introuvable'));
  }, [id, isLoggedIn]);

  const choisir = (qIndex: number, choixIndex: number) => {
    setReponses(prev => prev.map((r, i) => (i === qIndex ? choixIndex : r)));
  };

  const soumettre = async () => {
    if (reponses.some(r => r === null)) { toast.error('Réponds à toutes les questions'); return; }
    setLoading(true);
    try {
      const data = await quizApi.submit(id, reponses as number[]);
      setResult(data);
      if (!isLoggedIn() && typeof window !== 'undefined') {
        localStorage.setItem(ESSAI_GRATUIT_KEY, 'true');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  if (essaiEpuise) {
    return (
      <div className="max-w-md mx-auto text-center bg-white rounded-2xl border border-ink/10 p-8">
        <Lock size={28} className="mx-auto text-brand mb-3" strokeWidth={1.75} />
        <h1 className="text-xl font-bold text-ink mb-2">Ton test gratuit est déjà utilisé</h1>
        <p className="text-sm text-ink/60 mb-6">
          Sans inscription, un seul quiz d'essai est disponible. Crée un compte gratuit pour continuer à t'entraîner à volonté.
        </p>
        <Link href="/register" className="inline-flex items-center justify-center gap-2 bg-brand text-white rounded-full px-6 py-3 font-semibold hover:bg-brand-dark transition-colors">
          Créer mon compte gratuit
        </Link>
      </div>
    );
  }

  if (!quiz) return <p className="text-ink/60">Chargement...</p>;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-1">{quiz.titre}</h1>
      <p className="text-ink/60 mb-6">{quiz.matiere} · {niveauLabel(quiz.niveau)}</p>

      {result && (
        <div className="bg-brand/10 border border-brand rounded-xl p-4 mb-4 text-center">
          <p className="text-2xl font-extrabold text-brand">{result.score} / {result.total}</p>
        </div>
      )}

      {result && !isLoggedIn() && (
        <div className="bg-sand border border-ink/10 rounded-xl p-4 mb-6 flex items-center gap-3">
          <Sparkles size={20} className="text-brand shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-ink">C'était ton essai gratuit !</p>
            <p className="text-xs text-ink/60">Inscris-toi pour passer d'autres quiz et réserver un enseignant.</p>
          </div>
          <Link href="/register" className="text-sm font-bold text-brand hover:text-brand-dark shrink-0">S'inscrire →</Link>
        </div>
      )}

      {result ? (
        // ── Révision : toutes les questions avec correction ──────────────
        <div className="space-y-6">
          {quiz.questions.map((q, i) => (
            <QuestionCard key={i} q={q} index={i} selected={reponses[i]} correction={result.correction[i]} onSelect={() => {}} disabled />
          ))}
        </div>
      ) : (
        // ── Une question à la fois ────────────────────────────────────────
        <>
          <div className="flex flex-col gap-2 mb-6">
            <div className="h-1.5 rounded-full bg-ink/10 overflow-hidden">
              <div className="h-full bg-brand rounded-full transition-all duration-300" style={{ width: `${((currentIndex + 1) / quiz.questions.length) * 100}%` }} />
            </div>
            <span className="text-xs font-semibold text-ink/40">Question {currentIndex + 1} sur {quiz.questions.length}</span>
          </div>

          <QuestionCard
            q={quiz.questions[currentIndex]}
            index={currentIndex}
            selected={reponses[currentIndex]}
            onSelect={ci => choisir(currentIndex, ci)}
          />

          <div className="flex items-center justify-between mt-6">
            <button onClick={() => setCurrentIndex(i => Math.max(0, i - 1))} disabled={currentIndex === 0}
              className="flex items-center gap-1.5 text-sm font-semibold text-ink/60 hover:text-ink disabled:opacity-30">
              <ArrowLeft size={15} /> Précédent
            </button>

            {currentIndex < quiz.questions.length - 1 ? (
              <button onClick={() => setCurrentIndex(i => i + 1)} disabled={reponses[currentIndex] === null}
                className="flex items-center gap-1.5 bg-brand text-white rounded-full px-6 py-2.5 font-semibold hover:bg-brand-dark disabled:opacity-40">
                Suivant <ArrowRight size={15} />
              </button>
            ) : (
              <button onClick={soumettre} disabled={loading || reponses[currentIndex] === null}
                className="bg-brand text-white rounded-full px-6 py-2.5 font-semibold hover:bg-brand-dark disabled:opacity-40">
                {loading ? 'Correction...' : 'Valider mes réponses'}
              </button>
            )}
          </div>
        </>
      )}
    </div>
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
    <div className="bg-white rounded-2xl border border-ink/10 p-5">
      <p className="font-semibold mb-3">{index + 1}. {q.question}</p>
      <div className="space-y-2">
        {q.choix.map((c, ci) => {
          const isSelected = selected === ci;
          const isCorrectAnswer = correction && correction.reponseCorrecte === ci;
          let style = 'border-ink/15 hover:border-ink/30';
          if (correction) {
            if (isCorrectAnswer) style = 'border-green-500 bg-green-50';
            else if (isSelected && !correction.correct) style = 'border-red-500 bg-red-50';
          } else if (isSelected) style = 'border-brand bg-brand-light';

          return (
            <button key={ci} disabled={disabled} onClick={() => onSelect(ci)}
              className={`w-full text-left border rounded-lg px-3 py-2.5 text-sm transition-colors ${style}`}>
              {c}
            </button>
          );
        })}
      </div>
      {correction?.explication && (
        <p className="text-xs text-ink/60 mt-3 italic">{correction.explication}</p>
      )}
    </div>
  );
}
