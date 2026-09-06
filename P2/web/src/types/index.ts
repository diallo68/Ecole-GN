export type Role = 'eleve' | 'parent' | 'repetiteur' | 'admin';
export type Niveau = 'primaire' | 'college' | 'lycee';

export interface Eleve {
  niveau?: Niveau;
  classe?: string;
  parentId?: string;
}

export interface RepetiteurProfile {
  bio?: string;
  avatar?: string;
  matieres: string[];
  niveaux: Niveau[];
  tarifHoraire?: number;
  disponible: boolean;
  valide: boolean;
  avgRating: number;
  ratingCount: number;
}

export interface User {
  _id: string;
  prenom: string;
  nom: string;
  phone?: string;
  email: string;
  city?: string;
  role: Role;
  verified: boolean;
  eleve?: Eleve;
  repetiteur?: RepetiteurProfile;
}

export interface Repetiteur {
  _id: string;
  prenom: string;
  nom: string;
  email?: string; // présent seulement sur les listes admin
  city?: string;
  createdAt?: string;
  repetiteur: RepetiteurProfile;
}

export interface ContentItem {
  _id: string;
  repetiteurId: string;
  titre: string;
  matiere: string;
  niveau: Niveau;
  chapitre?: string;
  createdAt: string;
  // vidéo
  url?: string;
  description?: string;
  // support
  fichierUrl?: string;
  type?: 'pdf' | 'image' | 'autre';
  // exercice
  enonce?: string;
  correction?: string;
}

export interface ClasseVirtuelle {
  _id: string;
  repetiteurId: string;
  eleveIds: string[];
  titre: string;
  matiere: string;
  niveau: Niveau;
  dateHeure: string;
  dureeMinutes: number;
  lienVisio: string;
  statut: 'planifiee' | 'en_cours' | 'terminee' | 'annulee';
}

export interface Reservation {
  _id: string;
  eleveId: string;
  parentId?: string;
  repetiteurId: string | Repetiteur;
  matiere: string;
  niveau: Niveau;
  mode: 'presentiel' | 'en_ligne';
  dateHeure: string;
  dureeMinutes: number;
  adresse?: string;
  lienVisio?: string;
  statut: 'en_attente' | 'confirmee' | 'terminee' | 'annulee';
  prix?: number;
}

export interface QuizSummary {
  _id: string;
  titre: string;
  matiere: string;
  niveau: Niveau;
}

export interface QuizQuestion {
  question: string;
  choix: string[];
}

export interface QuizDetail extends QuizSummary {
  questions: QuizQuestion[];
}

export interface QuizQuestionFull extends QuizQuestion {
  reponseCorrecte: number;
  explication?: string;
}

// Vue admin : inclut les réponses correctes et le statut de publication
export interface QuizFull extends QuizSummary {
  questions: QuizQuestionFull[];
  publie: boolean;
  createdAt: string;
}

export interface QuizCorrection {
  reponseCorrecte: number;
  explication?: string;
  correct: boolean;
}
