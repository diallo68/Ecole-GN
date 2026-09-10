import { create } from 'zustand';
import { authApi } from '@/lib/api';

// État partagé des favoris (élève uniquement) — chargé une seule fois et
// réutilisé par tous les boutons cœur affichés sur une page (accueil,
// recherche, fiche enseignant...), plutôt qu'un fetch par carte.
interface FavorisState {
  ids: Set<string>;
  loaded: boolean;
  load: () => Promise<void>;
  toggle: (repetiteurId: string) => Promise<void>;
  isFavori: (repetiteurId: string) => boolean;
}

export const useFavorisStore = create<FavorisState>((set, get) => ({
  ids: new Set(),
  loaded: false,

  load: async () => {
    if (get().loaded) return;
    try {
      const { favoris } = await authApi.mesFavoris();
      set({ ids: new Set(favoris.map(f => f._id)), loaded: true });
    } catch {
      set({ loaded: true }); // échec silencieux : le cœur reste vide, pas bloquant
    }
  },

  toggle: async (repetiteurId) => {
    const before = get().ids;
    const estFavori = before.has(repetiteurId);
    // Optimiste : le cœur change immédiatement, on annule seulement si la
    // requête échoue.
    const apres = new Set(before);
    if (estFavori) apres.delete(repetiteurId); else apres.add(repetiteurId);
    set({ ids: apres });
    try {
      if (estFavori) await authApi.retirerFavori(repetiteurId);
      else await authApi.ajouterFavori(repetiteurId);
    } catch {
      set({ ids: before });
    }
  },

  isFavori: (repetiteurId) => get().ids.has(repetiteurId),
}));
