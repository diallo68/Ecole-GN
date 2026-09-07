export type Role = 'eleve' | 'parent' | 'repetiteur' | 'admin';
export type Niveau =
  | 'cp1' | 'cp2' | 'ce1' | 'ce2' | 'cm1' | 'cm2'
  | '7e' | '8e' | '9e' | '10e'
  | '11e-ss' | '11e-se' | '11e-sm'
  | '12e-ss' | '12e-se' | '12e-sm'
  | 'terminale-ss' | 'terminale-se' | 'terminale-sm';
export type Cycle = 'primaire' | 'college' | 'lycee';
export type Filiere = 'ss' | 'se' | 'sm';
export type TarifPeriode = 'heure' | 'mois' | 'an';
export type Disponibilite = 'matin' | 'apres-midi' | 'soir' | 'weekend';

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
  tarif?: { montant: number; periode: TarifPeriode };
  disponibilites: Disponibilite[];
  disponible: boolean;
  valide: boolean;
  avgRating: number;
  ratingCount: number;
}

export interface User {
  _id: string;
  prenom: string;
  nom: string;
  age?: number;
  phone?: string;
  photo?: string;
  pieceIdentite?: string;
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
  city?: string;
  repetiteur: RepetiteurProfile;
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

export interface ClasseVirtuelle {
  _id: string;
  repetiteurId: string | { _id: string; prenom: string; nom: string };
  eleveIds: string[];
  titre: string;
  matiere: string;
  niveau: Niveau;
  dateHeure: string;
  dureeMinutes: number;
  lienVisio: string;
  statut: 'planifiee' | 'en_cours' | 'terminee' | 'annulee';
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

export interface QuizCorrection {
  reponseCorrecte: number;
  explication?: string;
  correct: boolean;
}
