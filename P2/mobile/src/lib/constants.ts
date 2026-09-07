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

import type { Niveau, Cycle } from '@/types';

// Le primaire n'a pas "Sciences Physiques" en tant que matière séparée, et
// utilise "Calcul & Problèmes" plutôt que "Mathématiques". Le secondaire
// distingue Physique et Chimie plutôt qu'une matière fusionnée.
export const MATIERES_PRIMAIRE = ['Calcul & Problèmes', 'Français', 'Biologie', 'Histoire', 'Géographie'];
export const MATIERES_SECONDAIRE = ['Mathématiques', 'Français', 'Physique', 'Chimie', 'Biologie', 'Histoire', 'Géographie'];
export const MATIERES = ['Mathématiques', 'Calcul & Problèmes', 'Français', 'Physique', 'Chimie', 'Biologie', 'Histoire', 'Géographie'];

export const matieresDuCycle = (cycle: Cycle) => cycle === 'primaire' ? MATIERES_PRIMAIRE : MATIERES_SECONDAIRE;

// Référentiel des classes selon le système éducatif guinéen — le secondaire
// continue le compte du primaire (7ème après le CM2), contrairement au
// système français (6ème, 5ème...).
export const NIVEAUX: Array<{ value: Niveau; label: string; cycle: Cycle }> = [
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
  { value: '11e', label: '11ème', cycle: 'lycee' },
  { value: '12e', label: '12ème', cycle: 'lycee' },
  { value: 'terminale', label: 'Terminale', cycle: 'lycee' },
];

export const CYCLES: Array<{ value: Cycle; label: string; desc: string }> = [
  { value: 'primaire', label: 'Primaire', desc: 'CP1 au CM2' },
  { value: 'college', label: 'Collège', desc: '7ème à la 10ème' },
  { value: 'lycee', label: 'Lycée', desc: '11ème à la Terminale' },
];

export const niveauLabel = (v: string): string => NIVEAUX.find(n => n.value === v)?.label || v;
export const niveauxDuCycle = (cycle: Cycle) => NIVEAUX.filter(n => n.cycle === cycle);

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
