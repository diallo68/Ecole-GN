'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { quizApi } from '@/lib/api';
import { NIVEAUX, matieresDuNiveau } from '@/lib/constants';
import type { Niveau } from '@/types';

interface DraftQuestion {
  question: string;
  choix: string[];
  reponseCorrecte: number;
  explication: string;
}

const emptyQuestion = (): DraftQuestion => ({ question: '', choix: ['', '', '', ''], reponseCorrecte: 0, explication: '' });

export default function NouveauQuizPage() {
  const router = useRouter();
  const [titre, setTitre] = useState('');
  const [niveau, setNiveau] = useState<Niveau>('7e');
  const matieresDisponibles = matieresDuNiveau(niveau);
  const [matiere, setMatiere] = useState(matieresDisponibles[0]);
  const [questions, setQuestions] = useState<DraftQuestion[]>([emptyQuestion()]);
  const [loading, setLoading] = useState(false);

  const changerNiveau = (v: Niveau) => {
    setNiveau(v);
    const options = matieresDuNiveau(v);
    if (!options.includes(matiere)) setMatiere(options[0]);
  };

  const updateQuestion = (i: number, patch: Partial<DraftQuestion>) => {
    setQuestions(prev => prev.map((q, idx) => (idx === i ? { ...q, ...patch } : q)));
  };
  const updateChoix = (qi: number, ci: number, value: string) => {
    setQuestions(prev => prev.map((q, idx) => (idx === qi ? { ...q, choix: q.choix.map((c, k) => (k === ci ? value : c)) } : q)));
  };

  const publier = async () => {
    if (!titre || questions.some(q => !q.question || q.choix.some(c => !c))) {
      toast.error('Complète le titre et toutes les questions/choix');
      return;
    }
    setLoading(true);
    try {
      await quizApi.create({ titre, matiere, niveau, questions });
      toast.success('Quiz publié !');
      router.push('/admin/quiz');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-1">Nouveau quiz</h1>
      <p className="text-ink/60 mb-6 text-sm">
        Contenu généré par IA en amont (voir cahier des charges §5.3) — relis attentivement avant de publier.
      </p>

      <div className="bg-white rounded-xl border border-ink/10 p-4 mb-6 space-y-3">
        <input placeholder="Titre du quiz" value={titre} onChange={e => setTitre(e.target.value)} className="w-full border border-ink/15 rounded-lg px-3 py-2" />
        <div className="flex gap-3">
          <select value={niveau} onChange={e => changerNiveau(e.target.value as Niveau)} className="flex-1 border border-ink/15 rounded-lg px-3 py-2">
            {NIVEAUX.map(n => <option key={n.value} value={n.value}>{n.label}</option>)}
          </select>
          <select value={matiere} onChange={e => setMatiere(e.target.value)} className="flex-1 border border-ink/15 rounded-lg px-3 py-2">
            {matieresDisponibles.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {questions.map((q, qi) => (
          <div key={qi} className="bg-white rounded-xl border border-ink/10 p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="font-semibold">Question {qi + 1}</p>
              {questions.length > 1 && (
                <button onClick={() => setQuestions(prev => prev.filter((_, i) => i !== qi))} className="text-red-500 text-xs hover:underline">Retirer</button>
              )}
            </div>
            <input placeholder="Énoncé de la question" value={q.question} onChange={e => updateQuestion(qi, { question: e.target.value })}
              className="w-full border border-ink/15 rounded-lg px-3 py-2 mb-2 text-sm" />
            <div className="space-y-1.5 mb-2">
              {q.choix.map((c, ci) => (
                <div key={ci} className="flex items-center gap-2">
                  <input type="radio" checked={q.reponseCorrecte === ci} onChange={() => updateQuestion(qi, { reponseCorrecte: ci })} />
                  <input placeholder={`Choix ${ci + 1}`} value={c} onChange={e => updateChoix(qi, ci, e.target.value)}
                    className="flex-1 border border-ink/15 rounded-lg px-3 py-1.5 text-sm" />
                </div>
              ))}
            </div>
            <input placeholder="Explication de la bonne réponse" value={q.explication} onChange={e => updateQuestion(qi, { explication: e.target.value })}
              className="w-full border border-ink/15 rounded-lg px-3 py-2 text-sm" />
          </div>
        ))}
      </div>

      <div className="flex gap-3 mt-4">
        <button onClick={() => setQuestions(prev => [...prev, emptyQuestion()])} className="flex-1 bg-white border border-ink/15 rounded-lg py-2 text-sm font-semibold hover:bg-sand">
          + Ajouter une question
        </button>
        <button onClick={publier} disabled={loading} className="flex-1 bg-brand text-white rounded-lg py-2 text-sm font-semibold hover:bg-brand-dark disabled:opacity-50">
          {loading ? 'Publication...' : 'Publier le quiz'}
        </button>
      </div>
    </div>
  );
}
