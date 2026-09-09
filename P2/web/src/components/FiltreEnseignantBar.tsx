'use client';

import { ChevronDown } from 'lucide-react';
import { MATIERES, ALL_CITIES, DISPONIBILITES } from '@/lib/constants';
import { useFiltreEnseignantStore } from '@/store/filtreEnseignantStore';

const TARIF_MAX_OPTIONS = [
  { value: '', label: 'Tous les tarifs' },
  { value: '30000', label: "Jusqu'à 30 000 GNF" },
  { value: '60000', label: "Jusqu'à 60 000 GNF" },
  { value: '100000', label: "Jusqu'à 100 000 GNF" },
  { value: '300000', label: "Jusqu'à 300 000 GNF" },
];

// Filtres de recherche d'enseignants — vivent dans TrouverEnseignant (donc
// uniquement sur /repetiteurs, là où ils ont un effet visible) et pilotent
// les résultats via le store partagé useFiltreEnseignantStore.
export default function FiltreEnseignantBar({ vertical = false }: { vertical?: boolean }) {
  const { matiere, tarifMax, ville, disponibilite, setMatiere, setTarifMax, setVille, setDisponibilite } = useFiltreEnseignantStore();

  return (
    <div className={vertical ? 'flex flex-col gap-2' : 'flex items-center gap-1.5'}>
      <MiniSelect vertical={vertical} label="Matière" value={matiere} onChange={setMatiere}
        options={[{ value: '', label: 'Toutes les matières' }, ...MATIERES.map(m => ({ value: m, label: m }))]} />
      <MiniSelect vertical={vertical} label="Tarif maximum" value={tarifMax} onChange={setTarifMax} options={TARIF_MAX_OPTIONS} />
      <MiniSelect vertical={vertical} label="Ville" value={ville} onChange={setVille}
        options={[{ value: '', label: 'Toutes les villes' }, ...ALL_CITIES.map(c => ({ value: c, label: c }))]} />
      <MiniSelect vertical={vertical} label="Disponibilité" value={disponibilite} onChange={setDisponibilite}
        options={[{ value: '', label: 'Toutes les heures' }, ...DISPONIBILITES]} />
    </div>
  );
}

function MiniSelect({ label, value, onChange, options, vertical }: {
  label: string; value: string; onChange: (v: string) => void; options: Array<{ value: string; label: string }>; vertical?: boolean;
}) {
  return (
    <div className={`relative ${vertical ? 'w-full' : ''}`}>
      {/* Le libellé visible du filtre ("Toutes les matières"...) ne suffit pas
          seul de nom accessible : une fois une valeur choisie, plus rien
          n'indique à un lecteur d'écran qu'il s'agit du filtre "matière". */}
      <select aria-label={label} value={value} onChange={e => onChange(e.target.value)}
        className={`appearance-none bg-sand/70 hover:bg-sand border border-ink/10 rounded-full text-xs font-semibold text-ink pl-3 pr-6 py-1.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-1 ${vertical ? 'w-full' : 'max-w-[130px]'}`}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink/40 pointer-events-none" />
    </div>
  );
}
