'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight, SearchX } from 'lucide-react';
import { repetiteurApi } from '@/lib/api';
import { tarifLabel } from '@/lib/constants';
import { useFiltreEnseignantStore } from '@/store/filtreEnseignantStore';
import FiltreEnseignantBar from './FiltreEnseignantBar';
import ErrorState from './ErrorState';
import EmptyState from './EmptyState';
import FavoriButton from './FavoriButton';
import type { Repetiteur } from '@/types';

// Bloc résultats de recherche d'enseignants — utilisé sur la page dédiée
// /repetiteurs. Les filtres (matière/classe/tarif/ville/disponibilité) et la
// recherche texte sont tous appliqués côté serveur (avant, seuls les 50
// premiers profils étaient chargés puis filtrés dans le navigateur : un
// enseignant hors de ce lot était introuvable par nom).
export default function TrouverEnseignant({ titreAs = 'h1' }: { titreAs?: 'h1' | 'h2' }) {
  const { matiere, niveau, tarifMax, ville, disponibilite, reset, setVille } = useFiltreEnseignantStore();
  const [repetiteurs, setRepetiteurs] = useState<Repetiteur[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [filtresOpen, setFiltresOpen] = useState(false);
  const filtresActifs = [matiere, niveau, tarifMax, ville, disponibilite].filter(Boolean).length;

  // Reprend une recherche lancée depuis la barre de la navbar (?q=...&ville=...)
  // — lu une seule fois au montage, pas via useSearchParams pour éviter la
  // contrainte de Suspense sur une page par ailleurs entièrement client.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    const v = params.get('ville');
    if (q) setSearch(q);
    if (v) setVille(v);
    if (params.has('matiere') || params.has('niveau')) {
      useFiltreEnseignantStore.setState({
        matiere: params.get('matiere') || '',
        niveau: params.get('niveau') || '',
        ville: params.get('ville') || '',
        tarifMax: '',
        disponibilite: '',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Un changement de filtre ou de recherche doit revenir à la page 1 —
  // sinon on peut se retrouver sur une page qui n'existe plus.
  useEffect(() => { setPage(1); }, [matiere, niveau, tarifMax, ville, disponibilite, search]);

  useEffect(() => {
    // Annule la requête précédente si une nouvelle part avant qu'elle ait
    // répondu (filtre changé rapidement) — sinon une réponse en retard
    // pouvait écraser un résultat plus récent avec des données obsolètes.
    const controller = new AbortController();
    setLoading(true);
    setError(false);
    const t = setTimeout(() => {
      repetiteurApi.list({
        matiere: matiere || undefined,
        niveau: niveau || undefined,
        tarifMax: tarifMax || undefined,
        ville: ville || undefined,
        disponibilite: disponibilite || undefined,
        q: search.trim() || undefined,
        page,
      }, controller.signal)
        .then(d => { setRepetiteurs(d.repetiteurs); setTotal(d.total); setTotalPages(d.totalPages); })
        .catch(err => {
          if (err instanceof DOMException && err.name === 'AbortError') return; // remplacée par une requête plus récente, pas une panne
          setError(true);
        })
        .finally(() => setLoading(false));
    }, 300);
    return () => { clearTimeout(t); controller.abort(); };
  }, [matiere, niveau, tarifMax, ville, disponibilite, search, page, reloadKey]);

  const Titre = titreAs;

  return (
    <div>
      <Titre className="text-2xl md:text-3xl font-bold tracking-tight text-ink mb-5">Trouver un enseignant</Titre>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
        <div className="relative sm:max-w-xs">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/30" />
          <label htmlFor="recherche-enseignant" className="sr-only">Rechercher un enseignant par nom ou matière</label>
          <input id="recherche-enseignant" value={search} onChange={e => setSearch(e.target.value)} placeholder="Nom ou matière..."
            className="w-full border border-ink/10 rounded-xl pl-9 pr-3 py-2.5 text-sm outline-none focus:border-brand bg-white" />
        </div>

        {/* Desktop : filtres directement visibles */}
        <div className="hidden lg:block">
          <FiltreEnseignantBar />
        </div>
        {/* Mobile/tablette : bouton dépliable, avec le nombre de filtres actifs */}
        <button onClick={() => setFiltresOpen(o => !o)}
          className="lg:hidden flex items-center gap-1.5 text-xs font-semibold text-ink-muted border border-ink/10 rounded-full px-3 py-2 self-start">
          <SlidersHorizontal size={13} /> Filtres{filtresActifs > 0 ? ` (${filtresActifs})` : ''}
        </button>
      </div>

      {filtresOpen && (
        <div className="lg:hidden mb-6 p-3 bg-white border border-ink/10 rounded-xl">
          <FiltreEnseignantBar vertical />
        </div>
      )}

      {loading ? (
        <p className="text-ink-muted text-sm">Chargement...</p>
      ) : error ? (
        <ErrorState message="Impossible de charger les enseignants." onRetry={() => setReloadKey(k => k + 1)} />
      ) : repetiteurs.length === 0 ? (
        <EmptyState icon={SearchX} message="Aucun enseignant ne correspond à ces critères. Essayez une autre matière ou élargissez la ville."
          ctaLabel={search || matiere || niveau || tarifMax || ville || disponibilite ? 'Effacer les filtres' : undefined}
          onCta={() => { reset(); setSearch(''); }} />
      ) : (
        <>
          <p className="text-xs text-ink-muted mb-3">{total} enseignant{total > 1 ? 's' : ''} trouvé{total > 1 ? 's' : ''}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {repetiteurs.map(r => (
              <Link key={r._id} href={`/repetiteurs/${r._id}`} className="bg-white rounded-2xl border border-ink/10 p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-full bg-sand text-brand-dark font-bold grid place-items-center border border-ink/10">
                    {r.prenom?.[0]}{r.nom?.[0]}
                  </div>
                  <div className="flex items-center gap-2">
                    {r.repetiteur.ratingCount > 0 && (
                      <div className="flex items-center gap-1 bg-sand px-2 py-1 rounded-lg text-xs font-semibold">
                        ★ {r.repetiteur.avgRating}
                      </div>
                    )}
                    <FavoriButton repetiteurId={r._id} />
                  </div>
                </div>
                <p className="font-bold text-ink">{r.prenom} {r.nom}</p>
                <p className="text-sm text-ink-muted mt-0.5">{r.repetiteur.matieres?.join(', ')}</p>
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-ink/10">
                  <span className="text-xs text-ink-muted">{r.city}</span>
                  {r.repetiteur.tarif?.montant && <span className="text-sm font-bold text-brand">{tarifLabel(r.repetiteur.tarif)}</span>}
                </div>
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-8">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
                className="flex items-center gap-1 text-sm font-semibold text-ink-muted hover:text-ink disabled:opacity-30">
                <ChevronLeft size={16} /> Précédent
              </button>
              <span className="text-xs font-semibold text-ink-muted">Page {page} sur {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
                className="flex items-center gap-1 text-sm font-semibold text-ink-muted hover:text-ink disabled:opacity-30">
                Suivant <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
