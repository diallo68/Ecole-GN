'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { ChevronDown } from 'lucide-react';
import { contentApi, soumissionApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import FileUploadField from '@/components/FileUploadField';
import { NIVEAUX, niveauLabel, matieresDuNiveau } from '@/lib/constants';
import type { ContentItem, Niveau, Soumission } from '@/types';

type ContentType = 'video' | 'support' | 'exercice';
const TYPES: { value: ContentType; label: string }[] = [
  { value: 'video', label: 'Vidéos' },
  { value: 'support', label: 'Supports de cours' },
  { value: 'exercice', label: 'Exercices' },
];

export default function RepetiteurContenuPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [type, setType] = useState<ContentType>('video');
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Champs du formulaire — pertinents selon le type sélectionné
  const [titre, setTitre] = useState('');
  const [niveau, setNiveau] = useState<Niveau>('7e');
  const matieresDisponibles = matieresDuNiveau(niveau);
  const [matiere, setMatiere] = useState(matieresDisponibles[0]);
  const [chapitre, setChapitre] = useState('');

  const changerNiveau = (v: Niveau) => {
    setNiveau(v);
    const options = matieresDuNiveau(v);
    if (!options.includes(matiere)) setMatiere(options[0]);
  };
  const [url, setUrl] = useState('');       // vidéo / support
  const [enonce, setEnonce] = useState(''); // exercice
  const [correction, setCorrection] = useState(''); // exercice

  useEffect(() => {
    if (user && user.role !== 'repetiteur') router.push('/dashboard');
  }, [user, router]);

  const charger = () => {
    contentApi.mine(type).then(setItems).catch(() => setItems([]));
  };
  useEffect(charger, [type]);

  const publier = async () => {
    if (!titre || (type !== 'exercice' && !url) || (type === 'exercice' && !enonce)) {
      toast.error('Remplis au moins le titre et le contenu principal');
      return;
    }
    setLoading(true);
    try {
      const body: Record<string, unknown> = { titre, matiere, niveau, chapitre };
      if (type === 'video') body.url = url;
      if (type === 'support') { body.fichierUrl = url; body.type = 'pdf'; }
      if (type === 'exercice') { body.enonce = enonce; body.correction = correction; body.fichierUrl = url || undefined; }

      await contentApi.create(type, body);
      toast.success('Publié !');
      setTitre(''); setChapitre(''); setUrl(''); setEnonce(''); setCorrection('');
      charger();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  const supprimer = async (id: string) => {
    if (!confirm('Supprimer ce contenu ?')) return;
    try {
      await contentApi.remove(type, id);
      setItems(prev => prev.filter(i => i._id !== id));
      toast.success('Supprimé');
    } catch { toast.error('Erreur'); }
  };

  if (!user || user.role !== 'repetiteur') return null;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Mon contenu pédagogique</h1>

      <div className="flex gap-2 mb-6">
        {TYPES.map(t => (
          <button key={t.value} onClick={() => setType(t.value)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold ${type === t.value ? 'bg-brand text-white' : 'bg-white border border-ink/15'}`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white rounded-xl border border-ink/10 p-4 h-fit">
          <h2 className="font-bold mb-3">Publier {type === 'video' ? 'une vidéo' : type === 'support' ? 'un support' : 'un exercice'}</h2>
          <div className="space-y-2">
            <input placeholder="Titre" value={titre} onChange={e => setTitre(e.target.value)} className="w-full border border-ink/15 rounded-lg px-3 py-2 text-sm" />
            <select value={niveau} onChange={e => changerNiveau(e.target.value as Niveau)} className="w-full border border-ink/15 rounded-lg px-3 py-2 text-sm">
              {NIVEAUX.map(n => <option key={n.value} value={n.value}>{n.label}</option>)}
            </select>
            <select value={matiere} onChange={e => setMatiere(e.target.value)} className="w-full border border-ink/15 rounded-lg px-3 py-2 text-sm">
              {matieresDisponibles.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <input placeholder="Chapitre (optionnel)" value={chapitre} onChange={e => setChapitre(e.target.value)} className="w-full border border-ink/15 rounded-lg px-3 py-2 text-sm" />

            {type !== 'exercice' && (
              <FileUploadField value={url} onChange={setUrl}
                accept={type === 'video' ? 'video/*' : '.pdf,image/*'}
                label={type === 'video' ? 'Ajouter la vidéo' : 'Ajouter le support (PDF, image)'} />
            )}
            {type === 'exercice' && (
              <>
                <textarea placeholder="Énoncé" value={enonce} onChange={e => setEnonce(e.target.value)} rows={3} className="w-full border border-ink/15 rounded-lg px-3 py-2 text-sm" />
                <textarea placeholder="Correction (optionnelle)" value={correction} onChange={e => setCorrection(e.target.value)} rows={2} className="w-full border border-ink/15 rounded-lg px-3 py-2 text-sm" />
                <FileUploadField value={url} onChange={setUrl} accept=".pdf,image/*" label="Ajouter une pièce jointe (optionnel)" />
              </>
            )}

            <button onClick={publier} disabled={loading} className="w-full bg-brand text-white rounded-lg py-2 text-sm font-semibold hover:bg-brand-dark disabled:opacity-50">
              {loading ? 'Publication...' : 'Publier'}
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-3">
          {items.length === 0 ? (
            <p className="text-ink/60 text-sm">Rien de publié pour l'instant dans cette catégorie.</p>
          ) : items.map(item => (
            type === 'exercice'
              ? <ExerciceCard key={item._id} item={item} onDelete={() => supprimer(item._id)} />
              : (
                <div key={item._id} className="bg-white rounded-xl border border-ink/10 p-4 flex items-start justify-between">
                  <div>
                    <p className="font-semibold">{item.titre}</p>
                    <p className="text-sm text-ink/60">{item.matiere} · {niveauLabel(item.niveau)}{item.chapitre ? ` · ${item.chapitre}` : ''}</p>
                  </div>
                  <button onClick={() => supprimer(item._id)} className="text-red-500 text-sm hover:underline shrink-0 ml-3">Supprimer</button>
                </div>
              )
          ))}
        </div>
      </div>
    </div>
  );
}

function ExerciceCard({ item, onDelete }: { item: ContentItem; onDelete: () => void }) {
  const [open, setOpen] = useState(false);
  const [soumissions, setSoumissions] = useState<Soumission[] | null>(null);

  const charger = () => {
    soumissionApi.byExercice(item._id).then(d => setSoumissions(d.soumissions)).catch(() => setSoumissions([]));
  };

  const toggle = () => {
    if (!open && soumissions === null) charger();
    setOpen(!open);
  };

  const rendus = soumissions?.filter(s => s.statut === 'rendu').length ?? null;

  return (
    <div className="bg-white rounded-xl border border-ink/10 overflow-hidden">
      <div className="p-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold">{item.titre}</p>
          <p className="text-sm text-ink/60">{item.matiere} · {niveauLabel(item.niveau)}{item.chapitre ? ` · ${item.chapitre}` : ''}</p>
          {item.enonce && <p className="text-sm text-ink/70 mt-1">{item.enonce}</p>}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button onClick={onDelete} className="text-red-500 text-sm hover:underline">Supprimer</button>
        </div>
      </div>
      <button onClick={toggle} className="w-full flex items-center justify-between px-4 py-2.5 border-t border-ink/5 bg-sand/50 text-sm font-semibold text-ink/70 hover:bg-sand">
        <span>Voir les copies{rendus !== null && rendus > 0 ? ` (${rendus} à corriger)` : soumissions ? ` (${soumissions.length})` : ''}</span>
        <ChevronDown size={15} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="p-4 border-t border-ink/5 space-y-2">
          {soumissions === null ? (
            <p className="text-sm text-ink/50">Chargement...</p>
          ) : soumissions.length === 0 ? (
            <p className="text-sm text-ink/50">Aucune copie rendue pour l'instant.</p>
          ) : soumissions.map(s => <CopieRow key={s._id} soumission={s} onCorrigee={charger} />)}
        </div>
      )}
    </div>
  );
}

function CopieRow({ soumission, onCorrigee }: { soumission: Soumission; onCorrigee: () => void }) {
  const eleve = typeof soumission.eleveId === 'object' ? soumission.eleveId : null;
  const [note, setNote] = useState(soumission.note?.toString() || '');
  const [commentaire, setCommentaire] = useState(soumission.commentaire || '');
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(soumission.statut === 'rendu');

  const corriger = async () => {
    setSaving(true);
    try {
      await soumissionApi.corriger(soumission._id, { note: note ? Number(note) : undefined, commentaire: commentaire || undefined });
      toast.success('Copie corrigée !');
      setEditing(false);
      onCorrigee();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-sand rounded-lg p-3 space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-ink">{eleve ? `${eleve.prenom} ${eleve.nom}` : 'Élève'}</p>
        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${soumission.statut === 'corrige' ? 'bg-brand-light text-brand-dark' : 'bg-accent/15 text-[#8a6400]'}`}>
          {soumission.statut === 'corrige' ? `Corrigé — ${soumission.note ?? '—'}/20` : 'À corriger'}
        </span>
      </div>
      {soumission.reponseTexte && <p className="text-sm text-ink/70 whitespace-pre-wrap">{soumission.reponseTexte}</p>}
      {soumission.fichierUrl && (
        <a href={soumission.fichierUrl} target="_blank" rel="noreferrer" className="text-xs font-semibold text-brand hover:underline">Pièce jointe →</a>
      )}
      {editing ? (
        <div className="flex flex-col sm:flex-row gap-2 pt-1">
          <input type="number" min={0} max={20} placeholder="Note /20" value={note} onChange={e => setNote(e.target.value)}
            className="w-full sm:w-24 border border-ink/15 rounded-lg px-2.5 py-1.5 text-sm bg-white" />
          <input placeholder="Commentaire (optionnel)" value={commentaire} onChange={e => setCommentaire(e.target.value)}
            className="flex-1 border border-ink/15 rounded-lg px-2.5 py-1.5 text-sm bg-white" />
          <button onClick={corriger} disabled={saving} className="bg-brand text-white rounded-lg px-3 py-1.5 text-xs font-semibold hover:bg-brand-dark disabled:opacity-50 shrink-0">
            {saving ? '...' : 'Valider'}
          </button>
        </div>
      ) : (
        <button onClick={() => setEditing(true)} className="text-xs font-semibold text-brand hover:underline">Modifier la note</button>
      )}
    </div>
  );
}
