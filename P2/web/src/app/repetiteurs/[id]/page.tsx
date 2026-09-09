'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { MessageCircle } from 'lucide-react';
import { repetiteurApi, reservationApi, messagingApi, authApi, ApiError } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { niveauLabel, tarifLabel, DISPONIBILITES } from '@/lib/constants';
import ErrorState from '@/components/ErrorState';
import type { Repetiteur, Enfant } from '@/types';

export default function RepetiteurDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, isLoggedIn } = useAuthStore();

  const [repetiteur, setRepetiteur] = useState<Repetiteur | null>(null);
  // Distingue "pas encore chargé" de deux impasses possibles : ressource
  // absente (404 — pas la peine de proposer Réessayer) et panne réelle
  // (réseau/5xx — Réessayer a du sens). Avant ce fix, un échec laissait la
  // page bloquée indéfiniment sur "Chargement...".
  const [notFound, setNotFound] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [matiere, setMatiere] = useState('');
  const [niveau, setNiveau] = useState('');
  const [mode, setMode] = useState<'presentiel' | 'en_ligne'>('en_ligne');
  const [dateHeure, setDateHeure] = useState('');
  const [adresse, setAdresse] = useState('');
  const [loading, setLoading] = useState(false);

  // Un parent doit choisir pour quel enfant lié il réserve — le backend
  // exige eleveId et vérifie que l'enfant est bien lié à ce parent.
  const [enfants, setEnfants] = useState<Enfant[]>([]);
  const [enfantsLoaded, setEnfantsLoaded] = useState(false);
  const [eleveId, setEleveId] = useState('');

  const chargerRepetiteur = () => {
    setNotFound(false);
    setLoadError(false);
    repetiteurApi.getById(id).then(d => {
      setRepetiteur(d.repetiteur);
      setMatiere(d.repetiteur.repetiteur.matieres?.[0] || '');
      setNiveau(d.repetiteur.repetiteur.niveaux?.[0] || '');
    }).catch(err => {
      if (err instanceof ApiError && err.status === 404) setNotFound(true);
      else setLoadError(true);
    });
  };

  useEffect(chargerRepetiteur, [id]);

  useEffect(() => {
    if (user?.role !== 'parent') return;
    authApi.mesEnfants().then(d => {
      setEnfants(d.enfants);
      setEleveId(d.enfants[0]?._id || '');
    }).catch(() => {}).finally(() => setEnfantsLoaded(true));
  }, [user]);

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
    if (user?.role === 'parent' && !eleveId) { toast.error('Choisis pour quel enfant réserver'); return; }
    setLoading(true);
    try {
      await reservationApi.create({
        repetiteurId: id, matiere, niveau, mode, dateHeure,
        adresse: mode === 'presentiel' ? adresse : undefined,
        ...(user?.role === 'parent' ? { eleveId } : {}),
      });
      toast.success('Réservation envoyée !');
      router.push('/dashboard');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  // Un parent sans enfant lié ne peut pas réserver — pas de sélecteur vide,
  // on l'oriente directement vers l'endroit où lier un compte élève.
  const parentSansEnfant = user?.role === 'parent' && enfantsLoaded && enfants.length === 0;

  if (notFound) {
    return (
      <div className="max-w-md mx-auto text-center py-12">
        <p className="text-ink/60 mb-4">Ce profil enseignant n&apos;est plus disponible.</p>
        <Link href="/repetiteurs" className="text-sm font-semibold text-brand hover:underline">← Retour aux résultats</Link>
      </div>
    );
  }
  if (loadError) return <ErrorState message="Impossible de charger ce profil enseignant." onRetry={chargerRepetiteur} />;
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
        {repetiteur.repetiteur.tarif?.montant && (
          <p className="mt-4 text-lg font-bold text-brand">{tarifLabel(repetiteur.repetiteur.tarif)}</p>
        )}
        {repetiteur.repetiteur.disponibilites?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {repetiteur.repetiteur.disponibilites.map(d => (
              <span key={d} className="bg-brand-light text-brand-dark text-xs font-semibold px-2.5 py-1 rounded-full">
                {DISPONIBILITES.find(x => x.value === d)?.label || d}
              </span>
            ))}
          </div>
        )}
        <button onClick={contacter} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand hover:text-brand-dark">
          <MessageCircle size={16} /> Contacter {repetiteur.prenom}
        </button>
      </div>

      <div className="bg-white rounded-xl border border-ink/10 p-6 h-fit">
        <h2 className="font-bold mb-3">Réserver une session</h2>

        {parentSansEnfant ? (
          <div className="text-sm">
            <p className="text-ink/60 mb-3">Lie d&apos;abord le compte de ton enfant à ton profil parent pour pouvoir réserver une séance pour lui.</p>
            <Link href="/profil" className="inline-flex items-center gap-1.5 bg-brand text-white rounded-lg px-4 py-2 font-semibold hover:bg-brand-dark">
              Lier mon enfant →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {user?.role === 'parent' && enfants.length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-ink/50 mb-1">Pour quel enfant ?</label>
                <select value={eleveId} onChange={e => setEleveId(e.target.value)} className="w-full border border-ink/15 rounded-lg px-3 py-2">
                  {enfants.map(e => <option key={e._id} value={e._id}>{e.prenom} {e.nom}</option>)}
                </select>
              </div>
            )}
            <select value={matiere} onChange={e => setMatiere(e.target.value)} className="w-full border border-ink/15 rounded-lg px-3 py-2">
              {repetiteur.repetiteur.matieres?.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <select value={niveau} onChange={e => setNiveau(e.target.value)} className="w-full border border-ink/15 rounded-lg px-3 py-2">
              {repetiteur.repetiteur.niveaux?.map(n => <option key={n} value={n}>{niveauLabel(n)}</option>)}
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
        )}
      </div>
    </div>
  );
}
