import type { Niveau, Cycle } from '@/types';

export const MATIERES = ['Mathématiques', 'Français', 'Sciences Physiques', 'Biologie', 'Histoire', 'Géographie'];

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

// Liste des villes/préfectures/communes de Guinée (même référentiel que YouGouYouGou,
// découpage issu du décret présidentiel du 20 août 2026).
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
