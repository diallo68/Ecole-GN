import { create } from 'zustand';

// Filtres de recherche d'enseignants — vivent dans TrouverEnseignant
// (/repetiteurs) et pilotent la requête côté serveur via ce store partagé.
interface FiltreEnseignantState {
  matiere: string;
  niveau: string;
  tarifMax: string;
  ville: string;
  disponibilite: string;
  setMatiere: (v: string) => void;
  setNiveau: (v: string) => void;
  setTarifMax: (v: string) => void;
  setVille: (v: string) => void;
  setDisponibilite: (v: string) => void;
  reset: () => void;
}

export const useFiltreEnseignantStore = create<FiltreEnseignantState>((set) => ({
  matiere: '',
  niveau: '',
  tarifMax: '',
  ville: '',
  disponibilite: '',
  setMatiere: (matiere) => set({ matiere }),
  setNiveau: (niveau) => set({ niveau }),
  setTarifMax: (tarifMax) => set({ tarifMax }),
  setVille: (ville) => set({ ville }),
  setDisponibilite: (disponibilite) => set({ disponibilite }),
  reset: () => set({ matiere: '', niveau: '', tarifMax: '', ville: '', disponibilite: '' }),
}));
