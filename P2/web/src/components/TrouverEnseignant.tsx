'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { repetiteurApi } from '@/lib/api';
import { tarifLabel } from '@/lib/constants';
import { useFiltreEnseignantStore } from '@/store/filtreEnseignantStore';
import type { Repetiteur } from '@/types';

// Bloc résultats de recherche d'enseignants — utilisé à la fois sur la page
// dédiée /repetiteurs et directement sur l'accueil. Les filtres eux-mêmes
// (matière/tarif/ville/disponibilité) vivent dans la navbar globale et sont
// partagés via useFiltreEnseignantStore.
export default function TrouverEnseignant({ titreAs = 'h1' }: { titreAs?: 'h1' | 'h2' }) {
  const { matiere, tarifMax, ville, disponibilite } = useFiltreEnseignantStore();
  const [repetiteurs, setRepetiteurs] = useState<Repetiteur[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => {
      repetiteurApi.list({
        matiere: matiere || undefined,
        tarifMax: tarifMax || undefined,
        ville: ville || undefined,
        disponibilite: disponibilite || undefined,
      })
        .then(d => setRepetiteurs(d.repetiteurs))
        .catch(() => {})
        .finally(() => setLoading(false));
    }, 200);
    return () => clearTimeout(t);
  }, [matiere, tarifMax, ville, disponibilite]);

  const filtres = repetiteurs.filter(r =>
    !search || `${r.prenom} ${r.nom}`.toLowerCase().includes(search.toLowerCase()) ||
    r.repetiteur.matieres?.some(m => m.toLowerCase().includes(search.toLowerCase())),
  );

  const Titre = titreAs;

  return (
    <div>
      <Titre className="text-2xl md:text-3xl font-bold tracking-tight text-ink mb-5">Trouver un enseignant</Titre>

      <div className="relative sm:max-w-xs mb-8">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/30" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Nom ou mot-clé..."
          className="w-full border border-ink/10 rounded-xl pl-9 pr-3 py-2.5 text-sm outline-none focus:border-brand bg-white" />
      </div>

      {loading ? (
        <p className="text-ink/50 text-sm">Chargement...</p>
      ) : filtres.length === 0 ? (
        <p className="text-ink/50 text-sm">Aucun enseignant ne correspond à ces critères.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filtres.map(r => (
            <Link key={r._id} href={`/repetiteurs/${r._id}`} className="bg-white rounded-2xl border border-ink/10 p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-full bg-sand text-brand-dark font-bold grid place-items-center border border-ink/10">
                  {r.prenom?.[0]}{r.nom?.[0]}
                </div>
                {r.repetiteur.ratingCount > 0 && (
                  <div className="flex items-center gap-1 bg-sand px-2 py-1 rounded-lg text-xs font-semibold">
                    ★ {r.repetiteur.avgRating}
                  </div>
                )}
              </div>
              <p className="font-bold text-ink">{r.prenom} {r.nom}</p>
              <p className="text-sm text-ink/50 mt-0.5">{r.repetiteur.matieres?.join(', ')}</p>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-ink/10">
                <span className="text-xs text-ink/40">{r.city}</span>
                {r.repetiteur.tarif?.montant && <span className="text-sm font-bold text-brand">{tarifLabel(r.repetiteur.tarif)}</span>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
