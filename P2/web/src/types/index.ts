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
  email?: string; // présent seulement sur les listes admin
  phone?: string; // présent seulement sur les listes admin
  photo?: string;
  pieceIdentite?: string; // présent seulement sur les listes admin (modération)
  city?: string;
  createdAt?: string;
  repetiteur: RepetiteurProfile;
}

export interface ContentItem {
  _id: string;
  repetiteurId: string | { _id: string; prenom: string; nom: string };
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

export interface ConversationParticipant {
  _id: string;
  prenom: string;
  nom: string;
  role?: Role;
  repetiteur?: RepetiteurProfile;
}

export interface Conversation {
  _id: string;
  participants: ConversationParticipant[];
  lastMessage?: string;
  lastMessageAt?: string;
}

export interface Message {
  _id: string;
  conversationId: string;
  senderId: string;
  text: string;
  createdAt: string;
}

export interface QuizAttempt {
  _id: string;
  quizId: QuizSummary | null;
  score: number;
  total: number;
  createdAt: string;
}

export interface Soumission {
  _id: string;
  exerciceId: { _id: string; titre: string; matiere: string; niveau: Niveau } | string;
  eleveId: { _id: string; prenom: string; nom: string } | string;
  reponseTexte?: string;
  fichierUrl?: string;
  statut: 'rendu' | 'corrige';
  note?: number;
  commentaire?: string;
  createdAt: string;
}

export interface AdminUser {
  _id: string;
  prenom: string;
  nom: string;
  email: string;
  phone?: string;
  photo?: string;
  pieceIdentite?: string;
  city?: string;
  role: Role;
  createdAt: string;
  eleve?: { niveau?: Niveau };
  repetiteur?: { valide?: boolean; matieres?: string[] };
}

export interface AdminStats {
  eleves: number;
  parents: number;
  enseignants: { valides: number; enAttente: number };
  reservations: { enAttente: number; confirmees: number; terminees: number; total: number };
  quiz: { publies: number; total: number };
}
