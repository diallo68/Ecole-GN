'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { ALL_CITIES } from '@/lib/constants';

// Barre de recherche compacte dans la navbar — remplace le simple lien
// "Chercher" par une recherche directement utilisable sans changer de page.
// Le résultat (matière/nom + ville) est transmis à /repetiteurs par l'URL
// (?q=...&ville=...), repris au montage par TrouverEnseignant.
export default function NavSearchBar({ vertical = false, onSubmit }: { vertical?: boolean; onSubmit?: () => void }) {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [ville, setVille] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set('q', q.trim());
    if (ville) params.set('ville', ville);
    router.push(`/repetiteurs${params.toString() ? `?${params.toString()}` : ''}`);
    onSubmit?.();
  };

  return (
    <form onSubmit={submit}
      className={vertical
        ? 'flex flex-col gap-2'
        : 'flex items-center bg-sand/70 border border-ink/10 rounded-full pl-3 pr-1 py-1 gap-1.5 focus-within:border-brand/40 transition-colors'}>
      <label htmlFor="nav-search-q" className="sr-only">Matière ou nom d&apos;enseignant</label>
      <div className={vertical ? 'relative' : 'flex items-center gap-1.5 flex-1 min-w-0'}>
        {vertical && <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" />}
        {!vertical && <Search size={14} className="text-ink/40 shrink-0" />}
        <input id="nav-search-q" value={q} onChange={e => setQ(e.target.value)} placeholder="Mathématiques, nom..."
          className={vertical
            ? 'w-full border border-ink/15 rounded-full pl-9 pr-3 py-2 text-sm outline-none focus:border-brand bg-white'
            : 'bg-transparent outline-none text-sm w-32 placeholder:text-ink/40'} />
      </div>

      {!vertical && <div className="w-px h-4 bg-ink/15 shrink-0" />}

      <label htmlFor="nav-search-ville" className="sr-only">Ville</label>
      <select id="nav-search-ville" value={ville} onChange={e => setVille(e.target.value)}
        className={vertical
          ? 'w-full border border-ink/15 rounded-full px-3 py-2 text-sm outline-none focus:border-brand bg-white cursor-pointer'
          : 'bg-transparent outline-none text-xs text-ink/70 max-w-[110px] cursor-pointer shrink-0'}>
        <option value="">Toute la Guinée</option>
        {ALL_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
      </select>

      <button type="submit"
        className={vertical
          ? 'bg-brand text-white text-sm font-bold py-2 rounded-full hover:bg-brand-dark'
          : 'bg-brand text-white text-xs font-bold px-3.5 py-1.5 rounded-full hover:bg-brand-dark shrink-0'}>
        OK
      </button>
    </form>
  );
}
