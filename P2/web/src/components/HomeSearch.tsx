'use client';

import { BookOpen, GraduationCap, MapPin, Search } from 'lucide-react';
import { ALL_CITIES, CYCLES, MATIERES, niveauxDuCycle } from '@/lib/constants';

export default function HomeSearch() {
  const fieldClass = 'block w-full min-w-0 bg-transparent text-sm text-ink-muted py-1 pr-2 focus:outline-none';
  const labelClass = 'flex min-w-0 items-center gap-3 rounded-xl border border-ink/15 px-4 py-3 focus-within:ring-2 focus-within:ring-brand focus-within:ring-offset-2';
  return (
    <form action="/repetiteurs" method="get" role="search" aria-label="Trouver un enseignant"
      className="relative z-10 mt-6 lg:-mt-12 grid gap-3 rounded-2xl border border-ink/10 bg-white p-4 sm:p-5 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto] shadow-[0_14px_35px_-18px_rgba(19,90,61,0.28)]">
      <label className={labelClass}>
        <BookOpen size={21} className="shrink-0 text-brand" aria-hidden="true" />
        <span className="min-w-0 flex-1"><span className="text-xs font-semibold">Matière</span>
          <select name="matiere" defaultValue="" className={fieldClass}><option value="">Toutes les matières</option>{MATIERES.map(m => <option key={m}>{m}</option>)}</select>
        </span>
      </label>
      <label className={labelClass}>
        <GraduationCap size={22} className="shrink-0 text-brand" aria-hidden="true" />
        <span className="min-w-0 flex-1"><span className="text-xs font-semibold">Classe</span>
          <select name="niveau" defaultValue="" className={fieldClass}><option value="">Toutes les classes</option>{CYCLES.map(c => <optgroup key={c.value} label={c.label}>{niveauxDuCycle(c.value).map(n => <option key={n.value} value={n.value}>{n.label}</option>)}</optgroup>)}</select>
        </span>
      </label>
      <label className={labelClass}>
        <MapPin size={21} className="shrink-0 text-brand" aria-hidden="true" />
        <span className="min-w-0 flex-1"><span className="text-xs font-semibold">Ville</span>
          <select name="ville" defaultValue="" className={fieldClass}><option value="">Toutes les villes</option>{ALL_CITIES.map(c => <option key={c}>{c}</option>)}</select>
        </span>
      </label>
      <button type="submit" className="min-h-12 flex items-center justify-center gap-2 rounded-xl bg-brand px-7 py-3 font-semibold text-white hover:bg-brand-dark transition-colors"><Search size={19} aria-hidden="true" />Rechercher</button>
    </form>
  );
}
