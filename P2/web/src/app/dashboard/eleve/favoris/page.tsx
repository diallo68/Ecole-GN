'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { authApi } from '@/lib/api';
import { tarifLabel } from '@/lib/constants';
import FavoriButton from '@/components/FavoriButton';
import EmptyState from '@/components/EmptyState';
import type { Repetiteur } from '@/types';

export default function EleveFavorisPage() {
  const [favoris, setFavoris] = useState<Repetiteur[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authApi.mesFavoris().then(d => setFavoris(d.favoris)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  // Retire immédiatement de la liste affichée un favori qu'on vient de
  // retirer via le cœur — pas besoin de recharger toute la page.
  const retirer = (id: string) => setFavoris(prev => prev.filter(f => f._id !== id));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-extrabold text-ink">Mes enseignants favoris</h1>
        <p className="text-sm text-ink-muted">Retrouve rapidement les enseignants que tu as mis de côté.</p>
      </div>

      {loading ? (
        <p className="text-sm text-ink-muted">Chargement...</p>
      ) : favoris.length === 0 ? (
        <div className="bg-white rounded-2xl border border-ink/10">
          <EmptyState icon={Heart} message="Aucun enseignant en favori pour le moment." ctaLabel="Trouver un enseignant" ctaHref="/repetiteurs" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {favoris.map(r => (
            <Link key={r._id} href={`/repetiteurs/${r._id}`} className="bg-white rounded-2xl border border-ink/10 p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-full bg-sand text-brand-dark font-bold grid place-items-center border border-ink/10">
                  {r.prenom?.[0]}{r.nom?.[0]}
                </div>
                <FavoriButton repetiteurId={r._id} onToggle={fav => { if (!fav) retirer(r._id); }} />
              </div>
              <p className="font-bold text-ink">{r.prenom} {r.nom}</p>
              <p className="text-sm text-ink-muted mt-0.5">{r.repetiteur.matieres?.join(', ')}</p>
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
