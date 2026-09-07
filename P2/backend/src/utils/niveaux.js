// Référentiel des classes (niveaux) selon le système éducatif guinéen —
// numérotation officielle : le secondaire continue le compte du primaire
// (7ème après le CM2), contrairement au système français (6ème, 5ème...).
// Au lycée, chaque classe se décline en 3 séries/filières parallèles :
// Sciences Sociales (SS), Sciences Expérimentales (SE), Sciences Mathématiques (SM).
const LYCEE_FILIERES = [
  { value: 'ss', label: 'Sciences Sociales' },
  { value: 'se', label: 'Sciences Expérimentales' },
  { value: 'sm', label: 'Sciences Mathématiques' },
];

const LYCEE_GRADES = [
  { value: '11e', label: '11ème' },
  { value: '12e', label: '12ème' },
  { value: 'terminale', label: 'Terminale' },
];

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
  ...LYCEE_GRADES.flatMap(g => LYCEE_FILIERES.map(f => ({
    value: `${g.value}-${f.value}`,
    label: `${g.label} · ${f.label}`,
    cycle: 'lycee',
    filiere: f.value,
    grade: g.value,
  }))),
];

const NIVEAUX_VALUES = NIVEAUX.map(n => n.value);
const CYCLES = ['primaire', 'college', 'lycee'];

module.exports = { NIVEAUX, NIVEAUX_VALUES, CYCLES, LYCEE_FILIERES, LYCEE_GRADES };
