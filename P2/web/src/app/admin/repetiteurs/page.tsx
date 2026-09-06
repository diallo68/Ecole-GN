'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { repetiteurApi } from '@/lib/api';
import type { Repetiteur } from '@/types';

type Filtre = 'en_attente' | 'valide' | 'tous';

export default function AdminRepetiteursPage() {
  const [repetiteurs, setRepetiteurs] = useState<Repetiteur[]>([]);
  const [filtre, setFiltre] = useState<Filtre>('en_attente');
  const [loading, setLoading] = useState(true);

  const charger = () => {
    setLoading(true);
    repetiteurApi.adminList(filtre === 'tous' ? undefined : filtre)
      .then(d => setRepetiteurs(d.repetiteurs))
      .catch(() => toast.error('Erreur de chargement'))
      .finally(() => setLoading(false));
  };
  useEffect(charger, [filtre]);

  const moderer = async (id: string, valide: boolean) => {
    try {
      await repetiteurApi.moderate(id, valide);
      toast.success(valide ? 'Enseignant validé !' : 'Enseignant refusé');
      setRepetiteurs(prev => prev.filter(r => r._id !== id));
    } catch { toast.error('Erreur'); }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Modération des enseignants</h1>

      <div className="flex gap-2 mb-6">
        {(['en_attente', 'valide', 'tous'] as Filtre[]).map(f => (
          <button key={f} onClick={() => setFiltre(f)}
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold capitalize ${filtre === f ? 'bg-brand text-white' : 'bg-white border border-ink/15'}`}>
            {f.replace('_', ' ')}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-ink/60">Chargement...</p>
      ) : repetiteurs.length === 0 ? (
        <p className="text-ink/60">Aucun enseignant dans cette catégorie.</p>
      ) : (
        <div className="space-y-3">
          {repetiteurs.map(r => (
            <div key={r._id} className="bg-white rounded-xl border border-ink/10 p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold">{r.prenom} {r.nom} <span className="text-ink/40 font-normal text-sm">— {r.email}</span></p>
                <p className="text-sm text-ink/60">{r.city} · {r.repetiteur.matieres?.join(', ')} · {r.repetiteur.niveaux?.join(', ')}</p>
                <p className="text-xs mt-1">
                  <span className={`font-semibold px-2 py-0.5 rounded-full ${r.repetiteur.valide ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                    {r.repetiteur.valide ? 'Validé' : 'En attente'}
                  </span>
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                {!r.repetiteur.valide && (
                  <button onClick={() => moderer(r._id, true)} className="bg-green-600 text-white text-sm font-semibold px-3 py-1.5 rounded-lg hover:bg-green-700">Valider</button>
                )}
                {r.repetiteur.valide && (
                  <button onClick={() => moderer(r._id, false)} className="bg-ink/10 text-ink/80 text-sm font-semibold px-3 py-1.5 rounded-lg hover:bg-ink/15">Suspendre</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
