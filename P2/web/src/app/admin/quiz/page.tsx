'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { quizApi } from '@/lib/api';
import type { QuizFull } from '@/types';

export default function AdminQuizPage() {
  const [quizzes, setQuizzes] = useState<QuizFull[]>([]);
  const [loading, setLoading] = useState(true);

  const charger = () => {
    setLoading(true);
    quizApi.adminList().then(d => setQuizzes(d.quizzes)).catch(() => toast.error('Erreur de chargement')).finally(() => setLoading(false));
  };
  useEffect(charger, []);

  const togglePublish = async (id: string, publie: boolean) => {
    try {
      await quizApi.togglePublish(id, publie);
      setQuizzes(prev => prev.map(q => (q._id === id ? { ...q, publie } : q)));
      toast.success(publie ? 'Quiz publié !' : 'Quiz dépublié');
    } catch { toast.error('Erreur'); }
  };

  const supprimer = async (id: string) => {
    if (!confirm('Supprimer ce quiz définitivement ?')) return;
    try {
      await quizApi.remove(id);
      setQuizzes(prev => prev.filter(q => q._id !== id));
      toast.success('Quiz supprimé');
    } catch { toast.error('Erreur'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Quiz d'auto-évaluation</h1>
        <Link href="/admin/quiz/nouveau" className="bg-brand text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700">
          + Nouveau quiz
        </Link>
      </div>

      {loading ? (
        <p className="text-slate-500">Chargement...</p>
      ) : quizzes.length === 0 ? (
        <p className="text-slate-500">Aucun quiz créé pour l'instant.</p>
      ) : (
        <div className="space-y-3">
          {quizzes.map(q => (
            <div key={q._id} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold">{q.titre}</p>
                <p className="text-sm text-slate-500">{q.matiere} · {q.niveau} · {q.questions.length} questions</p>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${q.publie ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                  {q.publie ? 'Publié' : 'Brouillon'}
                </span>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => togglePublish(q._id, !q.publie)} className="bg-slate-100 text-sm font-semibold px-3 py-1.5 rounded-lg hover:bg-slate-200">
                  {q.publie ? 'Dépublier' : 'Publier'}
                </button>
                <button onClick={() => supprimer(q._id)} className="text-red-500 text-sm font-semibold px-3 py-1.5 hover:underline">Supprimer</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
