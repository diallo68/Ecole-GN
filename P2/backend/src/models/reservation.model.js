const mongoose = require('mongoose');
const { NIVEAUX_VALUES } = require('../utils/niveaux');
const { TARIF_PERIODES } = require('../utils/repetiteurOptions');

const ReservationSchema = new mongoose.Schema({
  eleveId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  parentId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // si réservé par un parent
  repetiteurId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  matiere:      { type: String, required: true },
  niveau:       { type: String, enum: NIVEAUX_VALUES, required: true },
  mode:         { type: String, enum: ['presentiel', 'en_ligne'], required: true },
  dateHeure:    { type: Date, required: true },
  dureeMinutes: { type: Number, default: 60 },
  adresse:      { type: String }, // si présentiel
  lienVisio:    { type: String }, // si en ligne (salle Jitsi générée)
  statut:       { type: String, enum: ['en_attente', 'confirmee', 'terminee', 'annulee'], default: 'en_attente' },
  prix:         { type: Number }, // en GNF, snapshot de tarif.montant au moment de la réservation
  prixPeriode:  { type: String, enum: TARIF_PERIODES }, // snapshot de tarif.periode — le prix seul ne dit pas si c'est /heure, /mois ou /an
  notes:        { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Reservation', ReservationSchema);
