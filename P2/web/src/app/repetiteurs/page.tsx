'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronDown, Search, Star } from 'lucide-react';
import { repetiteurApi } from '@/lib/api';
import { MATIERES, ALL_CITIES, DISPONIBILITES, niveauLabel, tarifLabel } from '@/lib/constants';
import type { Repetiteur } from '@/types';

const TARIF_MAX_OPTIONS = [
  { value: '', label: 'Tous les tarifs' },
  { value: '30000', label: "Jusqu'à 30 000 GNF" },
  { value: '60000', label: "Jusqu'à 60 000 GNF" },
  { value: '100000', label: "Jusqu'à 100 000 GNF" },
  { value: '300000', label: "Jusqu'à 300 000 GNF" },
];

export default function RepetiteursPage() {
  const [repetiteurs, setRepetiteurs] = useState<Repetiteur[]>([]);
  const [matiere, setMatiere] = useState('');
  const [tarifMax, setTarifMax] = useState('');
  const [ville, setVille] = useState('');
  const [disponibilite, setDisponibilite] = useState('');
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

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-ink mb-5">Trouver un enseignant</h1>

      <div className="flex flex-col gap-3 mb-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <FilterBox label="Je veux apprendre">
            <select value={matiere} onChange={e => setMatiere(e.target.value)} className="w-full appearance-none bg-transparent outline-none text-sm font-bold text-ink pr-5 cursor-pointer">
              <option value="">Toutes les matières</option>
              {MATIERES.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </FilterBox>

          <FilterBox label="Tarif">
            <select value={tarifMax} onChange={e => setTarifMax(e.target.value)} className="w-full appearance-none bg-transparent outline-none text-sm font-bold text-ink pr-5 cursor-pointer">
              {TARIF_MAX_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </FilterBox>

          <FilterBox label="Ville">
            <select value={ville} onChange={e => setVille(e.target.value)} className="w-full appearance-none bg-transparent outline-none text-sm font-bold text-ink pr-5 cursor-pointer">
              <option value="">Toutes les villes</option>
              {ALL_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </FilterBox>

          <FilterBox label="Mes disponibilités">
            <select value={disponibilite} onChange={e => setDisponibilite(e.target.value)} className="w-full appearance-none bg-transparent outline-none text-sm font-bold text-ink pr-5 cursor-pointer">
              <option value="">Toutes les heures</option>
              {DISPONIBILITES.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
          </FilterBox>
        </div>

        <div className="relative sm:max-w-xs">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/30" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Nom ou mot-clé..."
            className="w-full border border-ink/10 rounded-xl pl-9 pr-3 py-2.5 text-sm outline-none focus:border-brand bg-white" />
        </div>
      </div>

      {loading ? (
        <p className="text-ink/50 text-sm">Chargement...</p>
      ) : filtres.length === 0 ? (
        <p className="text-ink/50 text-sm">Aucun enseignant ne correspond à ces critères.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filtres.map(r => (
            <Link key={r._id} href={`/repetiteurs/${r._id}`} className="bg-white rounded-2xl border border-ink/10 p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="w-11 h-11 rounded-full bg-sand text-brand-dark font-bold grid place-items-center border border-ink/10">
                  {r.prenom?.[0]}{r.nom?.[0]}
                </div>
                {r.repetiteur.ratingCount > 0 && (
                  <div className="flex items-center gap-1 bg-sand px-2 py-1 rounded-lg text-xs font-semibold">
                    <Star size={11} className="fill-amber-400 text-amber-400" /> {r.repetiteur.avgRating}
                  </div>
                )}
              </div>
              <p className="font-bold text-ink">{r.prenom} {r.nom}</p>
              <p className="text-sm text-ink/50 mt-0.5">{r.repetiteur.matieres?.join(', ')}</p>
              <p className="text-xs text-ink/40 mt-1">{r.city} · {r.repetiteur.niveaux?.slice(0, 3).map(niveauLabel).join(', ')}{r.repetiteur.niveaux?.length > 3 ? '...' : ''}</p>

              {r.repetiteur.disponibilites?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {r.repetiteur.disponibilites.map(d => (
                    <span key={d} className="text-[10px] font-semibold bg-brand-light text-brand-dark px-2 py-0.5 rounded-full">
                      {DISPONIBILITES.find(x => x.value === d)?.label || d}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-ink/10">
                <span className="text-xs text-ink/40">{r.repetiteur.disponible ? 'Disponible' : 'Complet'}</span>
                {r.repetiteur.tarif?.montant ? (
                  <span className="text-sm font-bold text-brand">{tarifLabel(r.repetiteur.tarif)}</span>
                ) : (
                  <span className="text-xs text-ink/30">Tarif sur demande</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function FilterBox({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="relative border border-ink/10 rounded-2xl px-3.5 py-2 bg-white">
      <span className="block text-[11px] text-ink/40 leading-none mb-1">{label}</span>
      {children}
      <ChevronDown size={14} className="absolute right-3.5 top-1/2 translate-y-[2px] text-ink/30 pointer-events-none" />
    </div>
  );
}
