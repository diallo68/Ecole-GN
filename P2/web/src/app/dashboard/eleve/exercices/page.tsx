'use client';

import { useEffect, useState } from 'react';
import { ChevronDown, Paperclip, CheckCircle2, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { contentApi, soumissionApi } from '@/lib/api';
import { MATIERES, niveauLabel } from '@/lib/constants';
import { useAuthStore } from '@/store/authStore';
import FileUploadField from '@/components/FileUploadField';
import type { ContentItem, Soumission } from '@/types';

export default function MesExercicesPage() {
  const { user } = useAuthStore();
  const [items, setItems] = useState<ContentItem[]>([]);
  const [soumissions, setSoumissions] = useState<Soumission[]>([]);
  const [matiere, setMatiere] = useState('');
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      contentApi.listAll('exercice', { matiere: matiere || undefined, niveau: user?.eleve?.niveau }),
      soumissionApi.mine().then(d => d.soumissions),
    ]).then(([exos, mine]) => { setItems(exos); setSoumissions(mine); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [matiere, user]);

  const soumissionPour = (exerciceId: string) => soumissions.find(s => (typeof s.exerciceId === 'object' ? s.exerciceId._id : s.exerciceId) === exerciceId);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-extrabold text-ink">Mes exercices</h1>
        <p className="text-sm text-ink-muted">Exercices publiés par les enseignants Gandal{user?.eleve?.niveau ? ` — ${niveauLabel(user.eleve.niveau)}` : ''}.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <FilterPill active={!matiere} onClick={() => setMatiere('')} label="Toutes matières" />
        {MATIERES.map(m => <FilterPill key={m} active={matiere === m} onClick={() => setMatiere(m)} label={m} />)}
      </div>

      {loading ? (
        <p className="text-sm text-ink-muted">Chargement...</p>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-ink/10 p-6 text-center text-sm text-ink-muted">
          Aucun exercice disponible pour le moment.
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(item => {
            const auteur = typeof item.repetiteurId === 'object' ? `${item.repetiteurId.prenom} ${item.repetiteurId.nom}` : null;
            const open = openId === item._id;
            const mySoumission = soumissionPour(item._id);
            return (
              <div key={item._id} className="bg-white rounded-2xl border border-ink/10 overflow-hidden">
                <button onClick={() => setOpenId(open ? null : item._id)} className="w-full flex items-center justify-between gap-3 p-4 text-left">
                  <div className="min-w-0">
                    <p className="font-semibold text-ink text-sm">{item.titre}</p>
                    <p className="text-xs text-ink-muted">{item.matiere}{item.chapitre ? ` · ${item.chapitre}` : ''}{auteur ? ` · Par ${auteur}` : ''}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {mySoumission && (
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${mySoumission.statut === 'corrige' ? 'bg-brand-light text-brand-dark' : 'bg-accent/15 text-[#8a6400]'}`}>
                        {mySoumission.statut === 'corrige' ? `Corrigé — ${mySoumission.note ?? '—'}/20` : 'Rendu'}
                      </span>
                    )}
                    <ChevronDown size={16} className={`text-ink-muted transition-transform ${open ? 'rotate-180' : ''}`} />
                  </div>
                </button>
                {open && (
                  <div className="px-4 pb-4 space-y-3 border-t border-ink/5 pt-3">
                    <p className="text-sm text-ink/80 whitespace-pre-wrap">{item.enonce}</p>
                    {item.fichierUrl && (
                      <a href={item.fichierUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand hover:text-brand-dark">
                        <Paperclip size={13} /> Pièce jointe
                      </a>
                    )}
                    {item.correction && (
                      <details className="text-sm">
                        <summary className="cursor-pointer font-semibold text-brand-dark">Voir la correction du modèle</summary>
                        <p className="mt-2 text-ink/70 whitespace-pre-wrap">{item.correction}</p>
                      </details>
                    )}

                    <SubmissionForm exerciceId={item._id} existing={mySoumission} onSubmitted={s => {
                      setSoumissions(prev => [s, ...prev.filter(p => p._id !== s._id)]);
                    }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SubmissionForm({ exerciceId, existing, onSubmitted }: { exerciceId: string; existing?: Soumission; onSubmitted: (s: Soumission) => void }) {
  const [reponse, setReponse] = useState(existing?.reponseTexte || '');
  const [fichierUrl, setFichierUrl] = useState(existing?.fichierUrl || '');
  const [loading, setLoading] = useState(false);

  const envoyer = async () => {
    if (!reponse.trim() && !fichierUrl.trim()) { toast.error('Écris ta réponse ou ajoute un lien de pièce jointe'); return; }
    setLoading(true);
    try {
      const { soumission } = await soumissionApi.create({ exerciceId, reponseTexte: reponse || undefined, fichierUrl: fichierUrl || undefined });
      toast.success(existing ? 'Réponse mise à jour !' : 'Devoir rendu !');
      onSubmitted(soumission);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-sand rounded-xl p-3 space-y-2">
      <p className="text-xs font-semibold text-ink-muted flex items-center gap-1.5">
        {existing ? <CheckCircle2 size={13} className="text-brand" /> : null}
        {existing ? (existing.statut === 'corrige' ? 'Ta réponse (corrigée)' : 'Ta réponse (rendue)') : 'Rendre ma réponse'}
      </p>
      {existing?.statut === 'corrige' && existing.commentaire && (
        <p className="text-xs text-brand-dark bg-brand-light rounded-lg px-2.5 py-2">💬 {existing.commentaire}</p>
      )}
      <textarea value={reponse} onChange={e => setReponse(e.target.value)} rows={3} placeholder="Écris ta réponse ici..."
        disabled={existing?.statut === 'corrige'}
        className="w-full border border-ink/15 rounded-lg px-3 py-2 text-sm bg-white disabled:opacity-60" />
      {existing?.statut === 'corrige' ? (
        fichierUrl && <a href={fichierUrl} target="_blank" rel="noreferrer" className="text-xs font-semibold text-brand hover:underline">Voir ma pièce jointe →</a>
      ) : (
        <FileUploadField value={fichierUrl} onChange={setFichierUrl} accept=".pdf,image/*" label="Joindre un fichier (optionnel)" />
      )}
      {existing?.statut !== 'corrige' && (
        <button onClick={envoyer} disabled={loading} className="inline-flex items-center gap-1.5 bg-brand text-white rounded-lg px-3 py-1.5 text-xs font-semibold hover:bg-brand-dark disabled:opacity-50">
          <Send size={13} /> {loading ? 'Envoi...' : existing ? 'Mettre à jour' : 'Envoyer'}
        </button>
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
