// Référentiel partagé pour le tarif (montant + période) et les créneaux de
// disponibilité déclarés par les enseignants — utilisé par le modèle, les
// validateurs et le filtre de recherche.
const TARIF_PERIODES = ['heure', 'mois', 'an'];

const DISPONIBILITES = [
  { value: 'matin', label: 'Matin' },
  { value: 'apres-midi', label: 'Après-midi' },
  { value: 'soir', label: 'Soir' },
  { value: 'weekend', label: 'Week-end' },
];
const DISPONIBILITES_VALUES = DISPONIBILITES.map(d => d.value);

module.exports = { TARIF_PERIODES, DISPONIBILITES, DISPONIBILITES_VALUES };
