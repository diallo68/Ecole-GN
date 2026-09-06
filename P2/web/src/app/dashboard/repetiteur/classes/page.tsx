'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { classeVirtuelleApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { MATIERES, NIVEAUX, niveauLabel } from '@/lib/constants';
import type { ClasseVirtuelle, Niveau } from '@/types';

export default function RepetiteurClassesPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [classes, setClasses] = useState<ClasseVirtuelle[]>([]);
  const [titre, setTitre] = useState('');
  const [matiere, setMatiere] = useState(MATIERES[0]);
  const [niveau, setNiveau] = useState<Niveau>('7e');
  const [dateHeure, setDateHeure] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && user.role !== 'repetiteur') { router.push('/dashboard'); return; }
    classeVirtuelleApi.mine().then(d => setClasses(d.classes)).catch(() => {});
  }, [user, router]);

  const planifier = async () => {
    if (!titre || !dateHeure) { toast.error('Titre et date requis'); return; }
    setLoading(true);
    try {
      const { classe } = await classeVirtuelleApi.create({ titre, matiere, niveau, dateHeure });
      setClasses(prev => [classe, ...prev]);
      toast.success('Classe virtuelle planifiée !');
      setTitre(''); setDateHeure('');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== 'repetiteur') return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white rounded-xl border border-ink/10 p-4 h-fit">
        <h2 className="font-bold mb-3">Planifier une classe virtuelle</h2>
        <div className="space-y-2">
          <input placeholder="Titre (ex: Révisions Bac blanc)" value={titre} onChange={e => setTitre(e.target.value)} className="w-full border border-ink/15 rounded-lg px-3 py-2 text-sm" />
          <select value={matiere} onChange={e => setMatiere(e.target.value)} className="w-full border border-ink/15 rounded-lg px-3 py-2 text-sm">
            {MATIERES.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <select value={niveau} onChange={e => setNiveau(e.target.value as Niveau)} className="w-full border border-ink/15 rounded-lg px-3 py-2 text-sm">
            {NIVEAUX.map(n => <option key={n.value} value={n.value}>{n.label}</option>)}
          </select>
          <input type="datetime-local" value={dateHeure} onChange={e => setDateHeure(e.target.value)} className="w-full border border-ink/15 rounded-lg px-3 py-2 text-sm" />
          <button onClick={planifier} disabled={loading} className="w-full bg-brand text-white rounded-lg py-2 text-sm font-semibold hover:bg-brand-dark disabled:opacity-50">
            {loading ? 'Création...' : 'Planifier (lien visio généré auto.)'}
          </button>
        </div>
      </div>

      <div className="md:col-span-2 space-y-3">
        <h2 className="font-bold">Mes classes virtuelles</h2>
        {classes.length === 0 ? (
          <p className="text-ink/60 text-sm">Aucune classe planifiée.</p>
        ) : classes.map(c => (
          <div key={c._id} className="bg-white rounded-xl border border-ink/10 p-4">
            <p className="font-semibold">{c.titre}</p>
            <p className="text-sm text-ink/60">{c.matiere} · {niveauLabel(c.niveau)} · {new Date(c.dateHeure).toLocaleString('fr-FR')}</p>
            <a href={c.lienVisio} target="_blank" rel="noreferrer" className="text-sm text-brand font-semibold">Lien de la salle →</a>
          </div>
        ))}
      </div>
    </div>
  );
}
