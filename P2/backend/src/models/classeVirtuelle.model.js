const mongoose = require('mongoose');

// Une session de classe virtuelle planifiée par un répétiteur — peut être
// liée à une réservation individuelle, ou ouverte à plusieurs élèves du
// même répétiteur (groupe).
const ClasseVirtuelleSchema = new mongoose.Schema({
  repetiteurId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  eleveIds:     [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  reservationId:{ type: mongoose.Schema.Types.ObjectId, ref: 'Reservation' },
  titre:        { type: String, required: true },
  matiere:      { type: String, required: true },
  niveau:       { type: String, enum: ['primaire', 'college', 'lycee'], required: true },
  dateHeure:    { type: Date, required: true },
  dureeMinutes: { type: Number, default: 60 },
  lienVisio:    { type: String, required: true }, // salle meet.jit.si générée
  statut:       { type: String, enum: ['planifiee', 'en_cours', 'terminee', 'annulee'], default: 'planifiee' },
}, { timestamps: true });

module.exports = mongoose.model('ClasseVirtuelle', ClasseVirtuelleSchema);
