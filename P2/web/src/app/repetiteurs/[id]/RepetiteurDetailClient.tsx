'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { MessageCircle, Flag } from 'lucide-react';
import { repetiteurApi, reservationApi, messagingApi, authApi, ApiError } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { niveauLabel, tarifLabel, DISPONIBILITES } from '@/lib/constants';
import ErrorState from '@/components/ErrorState';
import type { Repetiteur, Enfant } from '@/types';

// Composant client (interactions, réservation, état d'auth) — séparé de
// page.tsx pour que page.tsx reste un composant serveur capable d'exporter
// generateMetadata (impossible depuis un composant 'use client').
export default function RepetiteurDetailClient() {
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

  const signaler = () => {
    if (!repetiteur) return;
    const subject = encodeURIComponent(`Signalement profil Gandal — ${repetiteur.prenom} ${repetiteur.nom}`);
    const body = encodeURIComponent(`Profil concerné : ${window.location.href}\n\nDécrivez le problème :\n`);
    window.location.href = `mailto:support.yougouyougou@gmail.com?subject=${subject}&body=${body}`;
  };

  const reserver = async () => {
    if (!isLoggedIn()) { router.push('/login'); return; }
    if (!matiere || !dateHeure) { toast.error('Choisissez une matière et une date'); return; }
    if (user?.role === 'parent' && !eleveId) { toast.error('Choisissez pour quel enfant réserver'); return; }
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
        <p className="text-ink-muted mb-4">Ce profil enseignant n&apos;est plus disponible.</p>
        <Link href="/repetiteurs" className="text-sm font-semibold text-brand hover:underline">← Retour aux résultats</Link>
      </div>
    );
  }
  if (loadError) return <ErrorState message="Impossible de charger ce profil enseignant." onRetry={chargerRepetiteur} />;
  if (!repetiteur) return <p className="text-ink-muted">Chargement...</p>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white rounded-xl border border-ink/10 p-6">
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-2xl font-bold">{repetiteur.prenom} {repetiteur.nom}</h1>
          {repetiteur.repetiteur.valide ? (
            <span title="Un membre de l'équipe Gandal a examiné ce profil (coordonnées, pièce d'identité si fournie) avant sa mise en ligne."
              className="inline-flex items-center gap-1 bg-brand-light text-brand-dark text-xs font-semibold px-2 py-1 rounded-full">
              ✓ Profil vérifié par Gandal
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 text-xs font-semibold px-2 py-1 rounded-full">
              En attente de vérification
            </span>
          )}
        </div>
        <p className="text-ink-muted">{repetiteur.city}</p>
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
        <div className="mt-4 flex items-center gap-4 flex-wrap">
          <button onClick={contacter} className="inline-flex items-center gap-2 text-sm font-semibold text-brand hover:text-brand-dark">
            <MessageCircle size={16} /> Contacter {repetiteur.prenom}
          </button>
          {/* Adresse de contact réelle (déjà utilisée dans le footer) — pas de
              nouvelle adresse "gandal.net" fabriquée qui n'existerait pas
              vraiment. Calculé au clic (pas au rendu) pour éviter tout écart
              serveur/client sur window.location. */}
          <button onClick={signaler} className="inline-flex items-center gap-2 text-sm font-semibold text-ink-muted hover:text-ink/70">
            <Flag size={14} /> Signaler ce profil
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-ink/10 p-6 h-fit">
        <h2 className="font-bold mb-3">Réserver une session</h2>

        {parentSansEnfant ? (
          <div className="text-sm">
            <p className="text-ink-muted mb-3">Liez d&apos;abord le compte de votre enfant à votre profil parent pour pouvoir réserver une séance pour lui.</p>
            <Link href="/profil" className="inline-flex items-center gap-1.5 bg-brand text-white rounded-lg px-4 py-2 font-semibold hover:bg-brand-dark">
              Lier mon enfant →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {user?.role === 'parent' && enfants.length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-ink-muted mb-1">Pour quel enfant ?</label>
                <select value={eleveId} onChange={e => setEleveId(e.target.value)} className="w-full border border-ink/15 rounded-lg px-3 py-2">
                  {enfants.map(e => <option key={e._id} value={e._id}>{e.prenom} {e.nom}</option>)}
                </select>
              </div>
            )}
            <div>
              <label htmlFor="reservation-matiere" className="block text-xs font-semibold text-ink-muted mb-1">Matière</label>
              <select id="reservation-matiere" value={matiere} onChange={e => setMatiere(e.target.value)} className="w-full border border-ink/15 rounded-lg px-3 py-2">
                {repetiteur.repetiteur.matieres?.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="reservation-niveau" className="block text-xs font-semibold text-ink-muted mb-1">Classe</label>
              <select id="reservation-niveau" value={niveau} onChange={e => setNiveau(e.target.value)} className="w-full border border-ink/15 rounded-lg px-3 py-2">
                {repetiteur.repetiteur.niveaux?.map(n => <option key={n} value={n}>{niveauLabel(n)}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="reservation-mode" className="block text-xs font-semibold text-ink-muted mb-1">Mode</label>
              <select id="reservation-mode" value={mode} onChange={e => setMode(e.target.value as 'presentiel' | 'en_ligne')} className="w-full border border-ink/15 rounded-lg px-3 py-2">
                <option value="en_ligne">En ligne (visio)</option>
                <option value="presentiel">Présentiel</option>
              </select>
            </div>
            {mode === 'presentiel' && (
              <div>
                <label htmlFor="reservation-adresse" className="block text-xs font-semibold text-ink-muted mb-1">Adresse</label>
                <input id="reservation-adresse" placeholder="Adresse" value={adresse} onChange={e => setAdresse(e.target.value)} className="w-full border border-ink/15 rounded-lg px-3 py-2" />
              </div>
            )}
            <div>
              <label htmlFor="reservation-date" className="block text-xs font-semibold text-ink-muted mb-1">Date et heure</label>
              <input id="reservation-date" type="datetime-local" value={dateHeure} onChange={e => setDateHeure(e.target.value)} className="w-full border border-ink/15 rounded-lg px-3 py-2" />
            </div>
            <button onClick={reserver} disabled={loading} aria-busy={loading} className="w-full bg-brand text-white rounded-lg py-2 font-semibold hover:bg-brand-dark disabled:opacity-50">
              {loading ? 'Envoi...' : 'Réserver'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
