export const Colors = {
  brand: '#0A7B4B',
  brandDark: '#065f39',
  brandLight: '#e6f5ee',
  accent: '#F5B700',
  flag: '#CE1126',
  ink: '#14201b',
  inkMuted: '#64748b',
  inkSubtle: '#94a3b8',
  surfaceBg: '#fbf7ee',
  surfaceBorder: '#e2e8f0',
  white: '#ffffff',
  success: '#16a34a',
  warning: '#d97706',
  danger: '#dc2626',
};

import type { Niveau, Cycle, Filiere, TarifPeriode, Disponibilite } from '@/types';

export const TARIF_PERIODES: Array<{ value: TarifPeriode; label: string }> = [
  { value: 'heure', label: '/ heure' },
  { value: 'mois', label: '/ mois' },
  { value: 'an', label: '/ an' },
];

export const DISPONIBILITES: Array<{ value: Disponibilite; label: string }> = [
  { value: 'matin', label: 'Matin' },
  { value: 'apres-midi', label: 'Après-midi' },
  { value: 'soir', label: 'Soir' },
  { value: 'weekend', label: 'Week-end' },
];

export const tarifLabel = (t?: { montant: number; periode: TarifPeriode }): string =>
  t?.montant ? `${t.montant.toLocaleString('fr-FR')} GNF ${TARIF_PERIODES.find(p => p.value === t.periode)?.label || ''}` : '';

// Le primaire n'a pas "Sciences Physiques" en tant que matière séparée, et
// utilise "Calcul & Problèmes" plutôt que "Mathématiques". Le secondaire
// distingue Physique et Chimie plutôt qu'une matière fusionnée.
export const MATIERES_PRIMAIRE = ['Calcul & Problèmes', 'Français', 'Biologie', 'Histoire', 'Géographie'];
export const MATIERES_SECONDAIRE = ['Mathématiques', 'Français', 'Physique', 'Chimie', 'Biologie', 'Histoire', 'Géographie'];
export const MATIERES = ['Mathématiques', 'Calcul & Problèmes', 'Français', 'Physique', 'Chimie', 'Biologie', 'Histoire', 'Géographie'];

export const matieresDuCycle = (cycle: Cycle) => cycle === 'primaire' ? MATIERES_PRIMAIRE : MATIERES_SECONDAIRE;

// Référentiel des classes selon le système éducatif guinéen — le secondaire
// continue le compte du primaire (7ème après le CM2), contrairement au
// système français (6ème, 5ème...). Au lycée, chaque classe se décline en
// 3 séries parallèles : Sciences Sociales, Sciences Expérimentales, Sciences Mathématiques.
export const LYCEE_FILIERES: Array<{ value: Filiere; label: string }> = [
  { value: 'ss', label: 'Sciences Sociales' },
  { value: 'se', label: 'Sciences Expérimentales' },
  { value: 'sm', label: 'Sciences Mathématiques' },
];

const LYCEE_GRADES: Array<{ value: string; label: string }> = [
  { value: '11e', label: '11ème' },
  { value: '12e', label: '12ème' },
  { value: 'terminale', label: 'Terminale' },
];

export const NIVEAUX: Array<{ value: Niveau; label: string; cycle: Cycle; filiere?: Filiere }> = [
  { value: 'cp1', label: 'CP1', cycle: 'primaire' },
  { value: 'cp2', label: 'CP2', cycle: 'primaire' },
  { value: 'ce1', label: 'CE1', cycle: 'primaire' },
  { value: 'ce2', label: 'CE2', cycle: 'primaire' },
  { value: 'cm1', label: 'CM1', cycle: 'primaire' },
  { value: 'cm2', label: 'CM2', cycle: 'primaire' },
  { value: '7e', label: '7ème', cycle: 'college' },
  { value: '8e', label: '8ème', cycle: 'college' },
  { value: '9e', label: '9ème', cycle: 'college' },
  { value: '10e', label: '10ème', cycle: 'college' },
  ...LYCEE_GRADES.flatMap(g => LYCEE_FILIERES.map(f => ({
    value: `${g.value}-${f.value}` as Niveau,
    label: `${g.label} · ${f.label}`,
    cycle: 'lycee' as Cycle,
    filiere: f.value,
  }))),
];

export const CYCLES: Array<{ value: Cycle; label: string; desc: string }> = [
  { value: 'primaire', label: 'Primaire', desc: 'CP1 au CM2' },
  { value: 'college', label: 'Collège', desc: '7ème à la 10ème' },
  { value: 'lycee', label: 'Lycée', desc: '11ème à la Terminale, 3 séries' },
];

export const niveauLabel = (v: string): string => NIVEAUX.find(n => n.value === v)?.label || v;
export const niveauxDuCycle = (cycle: Cycle) => NIVEAUX.filter(n => n.cycle === cycle);
export const niveauxDeLaFiliere = (filiere: Filiere) => NIVEAUX.filter(n => n.filiere === filiere);

export const GNF = (n: number): string => new Intl.NumberFormat('fr-GN').format(n) + ' GNF';

// Liste des villes/préfectures/communes de Guinée (même référentiel que YouGouYouGou).
export const ALL_CITIES: string[] = [
  'Beyla', 'Boké', 'Boffa', 'Conakry', 'Coyah', 'Dabola', 'Dalaba',
  'Dialakoro', 'Dinguiraye', 'Doko', 'Dubréka', 'Faranah', 'Forécariah',
  'Fria', 'Gaoual', 'Guéckédou', 'Kamsar', 'Kankan', 'Karala', 'Kérouané',
  'Kindia', 'Kintinian', 'Kissidougou', 'Koubia', 'Kouankan', 'Koundara',
  'Kouroussa', 'Labé', 'Lélouma', 'Lola', 'Macenta', 'Mali', 'Mamou',
  'Mandiana', "N'Zérékoré", 'Pita', 'Sabadou-Baranama', 'Siguiri',
  'Siguirini', 'Sinko', 'Télimélé', 'Timbo', 'Tokounou', 'Tougué', 'Yomou',
  // Communes de Conakry
  'Kaloum', 'Dixinn', 'Matam', 'Matoto', 'Ratoma', 'Gbéssia', 'Tombolia',
  'Sonfonia', 'Lambanyi', 'Kagbelen', 'Sanoyah', 'Manéah', 'Kassa',
];
