'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { contentApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import type { ContentItem, Niveau } from '@/types';

type ContentType = 'video' | 'support' | 'exercice';
const TYPES: { value: ContentType; label: string }[] = [
  { value: 'video', label: 'Vidéos' },
  { value: 'support', label: 'Supports de cours' },
  { value: 'exercice', label: 'Exercices' },
];
const MATIERES = ['Mathématiques', 'Français', 'Sciences Physiques', 'SVT'];
const NIVEAUX: Niveau[] = ['primaire', 'college', 'lycee'];

export default function RepetiteurContenuPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [type, setType] = useState<ContentType>('video');
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Champs du formulaire — pertinents selon le type sélectionné
  const [titre, setTitre] = useState('');
  const [matiere, setMatiere] = useState(MATIERES[0]);
  const [niveau, setNiveau] = useState<Niveau>('college');
  const [chapitre, setChapitre] = useState('');
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
            className={`px-4 py-2 rounded-lg text-sm font-semibold ${type === t.value ? 'bg-brand text-white' : 'bg-white border border-slate-300'}`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 bg-white rounded-xl border border-slate-200 p-4 h-fit">
          <h2 className="font-bold mb-3">Publier {type === 'video' ? 'une vidéo' : type === 'support' ? 'un support' : 'un exercice'}</h2>
          <div className="space-y-2">
            <input placeholder="Titre" value={titre} onChange={e => setTitre(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
            <select value={matiere} onChange={e => setMatiere(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm">
              {MATIERES.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <select value={niveau} onChange={e => setNiveau(e.target.value as Niveau)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm">
              {NIVEAUX.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
            <input placeholder="Chapitre (optionnel)" value={chapitre} onChange={e => setChapitre(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />

            {type !== 'exercice' && (
              <input placeholder={type === 'video' ? 'URL de la vidéo (Cloudinary)' : 'URL du fichier (PDF)'} value={url} onChange={e => setUrl(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
            )}
            {type === 'exercice' && (
              <>
                <textarea placeholder="Énoncé" value={enonce} onChange={e => setEnonce(e.target.value)} rows={3} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
                <textarea placeholder="Correction (optionnelle)" value={correction} onChange={e => setCorrection(e.target.value)} rows={2} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
                <input placeholder="Pièce jointe (optionnelle, URL)" value={url} onChange={e => setUrl(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
              </>
            )}

            <button onClick={publier} disabled={loading} className="w-full bg-brand text-white rounded-lg py-2 text-sm font-semibold hover:bg-blue-700 disabled:opacity-50">
              {loading ? 'Publication...' : 'Publier'}
            </button>
          </div>
        </div>

        <div className="md:col-span-2 space-y-3">
          {items.length === 0 ? (
            <p className="text-slate-500 text-sm">Rien de publié pour l'instant dans cette catégorie.</p>
          ) : items.map(item => (
            <div key={item._id} className="bg-white rounded-xl border border-slate-200 p-4 flex items-start justify-between">
              <div>
                <p className="font-semibold">{item.titre}</p>
                <p className="text-sm text-slate-500">{item.matiere} · {item.niveau}{item.chapitre ? ` · ${item.chapitre}` : ''}</p>
                {item.enonce && <p className="text-sm text-slate-600 mt-1">{item.enonce}</p>}
              </div>
              <button onClick={() => supprimer(item._id)} className="text-red-500 text-sm hover:underline shrink-0 ml-3">Supprimer</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
