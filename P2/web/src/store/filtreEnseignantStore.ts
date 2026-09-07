import { create } from 'zustand';

// Filtres de recherche d'enseignants — partagés entre la barre compacte de
// la navbar (où l'utilisateur les règle, sur toutes les pages) et le bloc
// de résultats "Trouver un enseignant" (accueil + page /repetiteurs).
interface FiltreEnseignantState {
  matiere: string;
  tarifMax: string;
  ville: string;
  disponibilite: string;
  setMatiere: (v: string) => void;
  setTarifMax: (v: string) => void;
  setVille: (v: string) => void;
  setDisponibilite: (v: string) => void;
}

export const useFiltreEnseignantStore = create<FiltreEnseignantState>((set) => ({
  matiere: '',
  tarifMax: '',
  ville: '',
  disponibilite: '',
  setMatiere: (matiere) => set({ matiere }),
  setTarifMax: (tarifMax) => set({ tarifMax }),
  setVille: (ville) => set({ ville }),
  setDisponibilite: (disponibilite) => set({ disponibilite }),
}));
