'use client';

import { useEffect, useState } from 'react';
import { FileText, Image as ImageIcon, File, Download, Video as VideoIcon, ExternalLink } from 'lucide-react';
import { contentApi } from '@/lib/api';
import { MATIERES, niveauLabel } from '@/lib/constants';
import { useAuthStore } from '@/store/authStore';
import type { ContentItem } from '@/types';

const TYPE_ICON = { pdf: FileText, image: ImageIcon, autre: File } as const;

export default function MesCoursPage() {
  const { user } = useAuthStore();
  const [items, setItems] = useState<ContentItem[]>([]);
  const [matiere, setMatiere] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = { matiere: matiere || undefined, niveau: user?.eleve?.niveau };
    Promise.all([
      contentApi.listAll('support', params),
      contentApi.listAll('video', params),
    ])
      .then(([supports, videos]) => {
        setItems([...videos, ...supports].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [matiere, user]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-extrabold text-ink">Mes cours</h1>
        <p className="text-sm text-ink/50">Supports de cours publiés par les enseignants Gandal{user?.eleve?.niveau ? ` — ${niveauLabel(user.eleve.niveau)}` : ''}.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <FilterPill active={!matiere} onClick={() => setMatiere('')} label="Toutes matières" />
        {MATIERES.map(m => <FilterPill key={m} active={matiere === m} onClick={() => setMatiere(m)} label={m} />)}
      </div>

      {loading ? (
        <p className="text-sm text-ink/50">Chargement...</p>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-ink/10 p-6 text-center text-sm text-ink/50">
          Aucun support de cours disponible pour le moment.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map(item => {
            const isVideo = item.url !== undefined;
            const Icon = isVideo ? VideoIcon : TYPE_ICON[item.type || 'autre'];
            const auteur = typeof item.repetiteurId === 'object' ? `${item.repetiteurId.prenom} ${item.repetiteurId.nom}` : null;
            return (
              <a key={item._id} href={isVideo ? item.url : item.fichierUrl} target="_blank" rel="noreferrer"
                className="bg-white rounded-2xl border border-ink/10 p-4 hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col gap-2">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-brand-light text-brand-dark grid place-items-center shrink-0">
                    <Icon size={18} strokeWidth={2.2} />
                  </div>
                  {isVideo ? <ExternalLink size={15} className="text-ink/30 mt-1" /> : <Download size={15} className="text-ink/30 mt-1" />}
                </div>
                <p className="font-semibold text-ink text-sm">{item.titre}</p>
                <p className="text-xs text-ink/50">{item.matiere}{item.chapitre ? ` · ${item.chapitre}` : ''}</p>
                {auteur && <p className="text-xs text-ink/40 mt-auto">Par {auteur}</p>}
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}

function FilterPill({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
        active ? 'bg-brand text-white border-brand' : 'bg-white border-ink/15 text-ink/70 hover:border-brand/40'
      }`}>
      {label}
    </button>
  );
}
