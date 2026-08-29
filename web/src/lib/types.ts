// Types alignés sur docs/openapi.yaml — pas de génération automatique pour
// l'instant (le contrat évolue vite), donc gardés délibérément minimaux :
// juste les champs que cette app consomme réellement.

export type Role = 'admin_etablissement' | 'enseignant' | 'personnel_administratif' | 'parent'

export interface Utilisateur {
  id: number
  nom: string
  prenom: string
  telephone: string
  email: string | null
  langue_preferee: string
  est_super_admin: boolean
  statut: 'actif' | 'suspendu'
}

export interface Rattachement {
  id: number
  role: Role
  statut: string
  etablissement: Etablissement
}

export interface Etablissement {
  id: number
  nom: string
  cycle: 'primaire' | 'college' | 'lycee' | 'mixte'
  adresse: string | null
  ville: string | null
  region: string | null
  statut: 'actif' | 'inactif'
}

export interface AnneeScolaire {
  id: number
  libelle: string
  date_debut: string
  date_fin: string
  statut: 'en_preparation' | 'active' | 'archivee'
}

export interface Classe {
  id: number
  niveau: string
  libelle: string
  annee_scolaire_id: number
  enseignant_titulaire_id: number | null
  effectif_max: number | null
}

export interface PeriodeEvaluation {
  id: number
  libelle: string
  annee_scolaire_id: number
  date_debut: string
  date_fin: string
  statut: 'en_cours' | 'cloturee'
}

export interface Bulletin {
  id: number
  eleve_id: number
  periode_id: number
  moyenne_generale: string | null
  rang: number | null
  effectif_classe: number | null
  statut: 'brouillon' | 'valide' | 'publie'
}

export interface FraisScolarite {
  id: number
  niveau: string
  annee_scolaire_id: number
  montant_total: string
}

export interface Echeance {
  id: number
  eleve_id: number
  libelle: string
  montant_du: string
  date_echeance: string
  statut: 'paye' | 'partiel' | 'impaye'
}

export interface Paiement {
  id: number
  echeance_id: number
  montant: string
  mode: 'especes' | 'cheque'
  reference_recu: string
  date_paiement: string
}

export interface Matiere {
  id: number
  nom: string
  coefficient_defaut: string
}

export interface ClasseMatiereEnseignant {
  id: number
  classe_id: number
  matiere_id: number
  enseignant_id: number
  coefficient: string | null
  matiere: Matiere
  enseignant: Utilisateur
}

export interface CreneauEmploiDuTemps {
  id: number
  classe_id: number
  matiere_id: number
  enseignant_id: number
  jour_semaine: number
  heure_debut: string
  heure_fin: string
  salle: string | null
  conflits?: CreneauEmploiDuTemps[]
}

export interface Eleve {
  id: number
  matricule: string
  nom: string
  prenom: string
  date_naissance: string | null
  sexe: 'M' | 'F' | null
  statut: 'actif' | 'inactif' | 'diplome'
}

export interface Pagination {
  page: number
  per_page: number
  total: number
}

export interface ApiErrorBody {
  error: { code: string; message: string; details?: unknown }
}
