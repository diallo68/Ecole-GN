// Référentiel des classes (niveaux) selon le système éducatif guinéen —
// numérotation officielle : le secondaire continue le compte du primaire
// (7ème après le CM2), contrairement au système français (6ème, 5ème...).
const NIVEAUX = [
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

const NIVEAUX_VALUES = NIVEAUX.map(n => n.value);
const CYCLES = ['primaire', 'college', 'lycee'];

module.exports = { NIVEAUX, NIVEAUX_VALUES, CYCLES };
