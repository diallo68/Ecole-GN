'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { repetiteurApi } from '@/lib/api';
import type { Repetiteur } from '@/types';

const MATIERES = ['Mathématiques', 'Français', 'Sciences Physiques', 'SVT'];
const NIVEAUX = ['primaire', 'college', 'lycee'];

export default function RepetiteursPage() {
  const [repetiteurs, setRepetiteurs] = useState<Repetiteur[]>([]);
  const [matiere, setMatiere] = useState('');
  const [niveau, setNiveau] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    repetiteurApi.list({ matiere: matiere || undefined, niveau: niveau || undefined })
      .then(d => setRepetiteurs(d.repetiteurs))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [matiere, niveau]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Trouver un répétiteur</h1>

      <div className="flex flex-wrap gap-3 mb-6">
        <select value={matiere} onChange={e => setMatiere(e.target.value)} className="border border-slate-300 rounded-lg px-3 py-2">
          <option value="">Toutes les matières</option>
          {MATIERES.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <select value={niveau} onChange={e => setNiveau(e.target.value)} className="border border-slate-300 rounded-lg px-3 py-2">
          <option value="">Tous les niveaux</option>
          {NIVEAUX.map(n => <option key={n} value={n}>{n}</option>)}
        </select>
      </div>

      {loading ? (
        <p className="text-slate-500">Chargement...</p>
      ) : repetiteurs.length === 0 ? (
        <p className="text-slate-500">Aucun répétiteur ne correspond à ces critères.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {repetiteurs.map(r => (
            <Link key={r._id} href={`/repetiteurs/${r._id}`} className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow">
              <p className="font-bold">{r.prenom} {r.nom}</p>
              <p className="text-sm text-slate-500">{r.repetiteur.matieres?.join(', ')}</p>
              <p className="text-xs text-slate-400 mt-1">{r.city} · {r.repetiteur.niveaux?.join(', ')}</p>
              {r.repetiteur.tarifHoraire && <p className="text-sm font-semibold text-brand mt-2">{r.repetiteur.tarifHoraire.toLocaleString('fr-FR')} GNF/h</p>}
              {r.repetiteur.ratingCount > 0 && <p className="text-xs text-amber-500 mt-1">★ {r.repetiteur.avgRating} ({r.repetiteur.ratingCount} avis)</p>}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
