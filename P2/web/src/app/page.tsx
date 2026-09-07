'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { repetiteurApi } from '@/lib/api';
import AssistantWidget from '@/components/AssistantWidget';
import { tarifLabel } from '@/lib/constants';
import type { Repetiteur } from '@/types';

export default function HomePage() {
  const [repetiteurs, setRepetiteurs] = useState<Repetiteur[]>([]);

  useEffect(() => {
    repetiteurApi.list({}).then(d => setRepetiteurs(d.repetiteurs.slice(0, 4))).catch(() => {});
  }, []);

  return (
    <>
    <div className="space-y-20">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute -top-20 -left-16 w-72 h-72 rounded-full bg-flag/10 blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 -right-20 w-80 h-80 rounded-full bg-accent/10 blur-3xl pointer-events-none" />

        <div className="relative flex flex-col lg:flex-row items-center gap-10 lg:gap-14 py-8 lg:py-12">
          <div className="w-full lg:w-[55%] flex flex-col items-start gap-6">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-ink/5 border border-ink/10 text-sm font-medium text-ink/60">
              <span className="w-2 h-2 rounded-full bg-brand" />
              Soutien scolaire du primaire au lycée
            </span>

            <h1 className="text-[2.25rem] md:text-5xl lg:text-[3.25rem] font-bold tracking-tight leading-[1.08] text-ink">
              Le savoir à portée de main, <br className="hidden md:block" />
              <span className="text-brand">partout en Guinée.</span>
            </h1>

            <p className="text-base md:text-lg text-ink/60 leading-relaxed max-w-xl">
              Connectez-vous avec les meilleurs enseignants(es) de la Guinée. Séances à domicile ou en ligne, adaptées au rythme de chaque élève pour garantir sa réussite.
            </p>

            <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-3 mt-1">
              <Link href="/repetiteurs" className="group flex items-center justify-center gap-2 bg-brand text-white px-7 py-3.5 rounded-2xl font-semibold hover:bg-brand-dark transition-all shadow-lg shadow-brand/20">
                Trouver un enseignant
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          <div className="w-full lg:w-[45%] relative h-[260px] lg:h-[340px] hidden md:block">
            <div className="absolute top-1/2 -left-6 w-20 h-20 bg-accent/10 rounded-full blur-xl -translate-y-1/2" />
            <div className="absolute inset-0 rounded-[2.5rem_0.75rem_2.5rem_0.75rem] overflow-hidden shadow-xl bg-ink/5">
              <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1000&q=80" alt="Élèves en séance de soutien scolaire" className="w-full h-full object-cover" />
            </div>
            <div className="absolute -bottom-5 -left-5 bg-white/95 backdrop-blur-md border border-white p-4 rounded-2xl shadow-lg flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-light text-brand-dark grid place-items-center shrink-0 font-bold">✓</div>
              <div>
                <p className="text-[11px] text-ink/50 uppercase tracking-wider font-semibold">Garantie</p>
                <p className="text-sm font-bold text-ink leading-none mt-1">100% Qualifié</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enseignants */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-ink">Enseignants disponibles</h2>
            <p className="text-ink/50 text-sm mt-1">Des profils vérifiés, passionnés par la transmission du savoir.</p>
          </div>
          <Link href="/repetiteurs" className="hidden sm:inline-flex items-center gap-1.5 text-sm text-brand font-semibold hover:text-brand-dark shrink-0">
            Voir tout <ArrowRight size={14} />
          </Link>
        </div>
        {repetiteurs.length === 0 ? (
          <p className="text-ink/50 text-sm">Aucun enseignant disponible pour le moment.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {repetiteurs.map(r => (
              <Link key={r._id} href={`/repetiteurs/${r._id}`} className="bg-sand rounded-[1.75rem] border border-transparent p-5 hover:shadow-lg hover:-translate-y-0.5 hover:border-ink/5 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-full bg-white text-brand-dark font-bold grid place-items-center border border-ink/10">
                    {r.prenom?.[0]}{r.nom?.[0]}
                  </div>
                  {r.repetiteur.ratingCount > 0 && (
                    <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg shadow-sm border border-ink/5 text-xs font-semibold">
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
      </section>
    </div>
    <AssistantWidget />
    </>
  );
}
