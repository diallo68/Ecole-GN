'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { MessageCircle } from 'lucide-react';
import { repetiteurApi, reservationApi, messagingApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import type { Repetiteur } from '@/types';

export default function RepetiteurDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { isLoggedIn } = useAuthStore();

  const [repetiteur, setRepetiteur] = useState<Repetiteur | null>(null);
  const [matiere, setMatiere] = useState('');
  const [niveau, setNiveau] = useState('college');
  const [mode, setMode] = useState<'presentiel' | 'en_ligne'>('en_ligne');
  const [dateHeure, setDateHeure] = useState('');
  const [adresse, setAdresse] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    repetiteurApi.getById(id).then(d => {
      setRepetiteur(d.repetiteur);
      setMatiere(d.repetiteur.repetiteur.matieres?.[0] || '');
    }).catch(() => toast.error('Enseignant introuvable'));
  }, [id]);

  const contacter = async () => {
    if (!isLoggedIn()) { router.push('/login'); return; }
    try {
      const { conversation } = await messagingApi.startOrGet(id);
      router.push(`/dashboard/messages?c=${conversation._id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur');
    }
  };

  const reserver = async () => {
    if (!isLoggedIn()) { router.push('/login'); return; }
    if (!matiere || !dateHeure) { toast.error('Choisis une matière et une date'); return; }
    setLoading(true);
    try {
      await reservationApi.create({ repetiteurId: id, matiere, niveau, mode, dateHeure, adresse: mode === 'presentiel' ? adresse : undefined });
      toast.success('Réservation envoyée !');
      router.push('/dashboard');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  if (!repetiteur) return <p className="text-ink/60">Chargement...</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2 bg-white rounded-xl border border-ink/10 p-6">
        <h1 className="text-2xl font-bold">{repetiteur.prenom} {repetiteur.nom}</h1>
        <p className="text-ink/60">{repetiteur.city}</p>
        {repetiteur.repetiteur.ratingCount > 0 && (
          <p className="text-amber-500 mt-1">★ {repetiteur.repetiteur.avgRating} ({repetiteur.repetiteur.ratingCount} avis)</p>
        )}
        <p className="mt-4 text-ink/80">{repetiteur.repetiteur.bio}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {repetiteur.repetiteur.matieres?.map(m => <span key={m} className="bg-ink/5 text-xs px-2.5 py-1 rounded-full">{m}</span>)}
        </div>
        {repetiteur.repetiteur.tarifHoraire && (
          <p className="mt-4 text-lg font-bold text-brand">{repetiteur.repetiteur.tarifHoraire.toLocaleString('fr-FR')} GNF / heure</p>
        )}
        <button onClick={contacter} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand hover:text-brand-dark">
          <MessageCircle size={16} /> Contacter {repetiteur.prenom}
        </button>
      </div>

      <div className="bg-white rounded-xl border border-ink/10 p-6 h-fit">
        <h2 className="font-bold mb-3">Réserver une session</h2>
        <div className="space-y-3">
          <select value={matiere} onChange={e => setMatiere(e.target.value)} className="w-full border border-ink/15 rounded-lg px-3 py-2">
            {repetiteur.repetiteur.matieres?.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <select value={niveau} onChange={e => setNiveau(e.target.value)} className="w-full border border-ink/15 rounded-lg px-3 py-2">
            {repetiteur.repetiteur.niveaux?.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
          <select value={mode} onChange={e => setMode(e.target.value as 'presentiel' | 'en_ligne')} className="w-full border border-ink/15 rounded-lg px-3 py-2">
            <option value="en_ligne">En ligne (visio)</option>
            <option value="presentiel">Présentiel</option>
          </select>
          {mode === 'presentiel' && (
            <input placeholder="Adresse" value={adresse} onChange={e => setAdresse(e.target.value)} className="w-full border border-ink/15 rounded-lg px-3 py-2" />
          )}
          <input type="datetime-local" value={dateHeure} onChange={e => setDateHeure(e.target.value)} className="w-full border border-ink/15 rounded-lg px-3 py-2" />
          <button onClick={reserver} disabled={loading} className="w-full bg-brand text-white rounded-lg py-2 font-semibold hover:bg-brand-dark disabled:opacity-50">
            {loading ? 'Envoi...' : 'Réserver'}
          </button>
        </div>
      </div>
    </div>
  );
}
