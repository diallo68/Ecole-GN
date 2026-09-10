'use client';

import { useEffect } from 'react';
import { Heart } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useFavorisStore } from '@/store/favorisStore';

// Cœur pour ajouter/retirer un enseignant des favoris — réservé aux élèves
// (demande explicite). N'affiche rien pour les autres rôles ou visiteurs
// anonymes plutôt que de renvoyer vers la connexion : garde les cartes
// enseignants simples pour le public qui n'a pas de compte élève.
export default function FavoriButton({ repetiteurId, className = '', onToggle }: { repetiteurId: string; className?: string; onToggle?: (favori: boolean) => void }) {
  const { user } = useAuthStore();
  const { load, toggle, isFavori } = useFavorisStore();

  useEffect(() => {
    if (user?.role === 'eleve') load();
  }, [user, load]);

  if (user?.role !== 'eleve') return null;

  const favori = isFavori(repetiteurId);

  return (
    <button
      onClick={e => { e.preventDefault(); e.stopPropagation(); toggle(repetiteurId); onToggle?.(!favori); }}
      aria-label={favori ? 'Retirer des favoris' : 'Ajouter aux favoris'}
      aria-pressed={favori}
      className={`shrink-0 transition-colors ${favori ? 'text-flag' : 'text-ink/25 hover:text-flag'} ${className}`}>
      <Heart size={18} strokeWidth={1.75} fill={favori ? 'currentColor' : 'none'} />
    </button>
  );
}
