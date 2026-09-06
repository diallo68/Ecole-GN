export const Colors = {
  brand: '#2563eb',
  brandLight: '#dbeafe',
  ink: '#0f172a',
  inkMuted: '#64748b',
  inkSubtle: '#94a3b8',
  surfaceBg: '#f8fafc',
  surfaceBorder: '#e2e8f0',
  white: '#ffffff',
  success: '#16a34a',
  warning: '#d97706',
  danger: '#dc2626',
};

export const MATIERES = ['Mathématiques', 'Français', 'Sciences Physiques', 'SVT'];
export const NIVEAUX: Array<{ value: 'primaire' | 'college' | 'lycee'; label: string }> = [
  { value: 'primaire', label: 'Primaire' },
  { value: 'college', label: 'Collège' },
  { value: 'lycee', label: 'Lycée' },
];

export const GNF = (n: number): string => new Intl.NumberFormat('fr-GN').format(n) + ' GNF';
