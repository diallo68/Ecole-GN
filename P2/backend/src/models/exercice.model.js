const mongoose = require('mongoose');
const { NIVEAUX_VALUES } = require('../utils/niveaux');

// Exercice créé par un répétiteur pour ses élèves.
const ExerciceSchema = new mongoose.Schema({
  repetiteurId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  titre:        { type: String, required: true },
  enonce:       { type: String, required: true },
  correction:   { type: String }, // optionnelle
  matiere:      { type: String, required: true },
  niveau:       { type: String, enum: NIVEAUX_VALUES, required: true },
  chapitre:     { type: String },
  fichierUrl:   { type: String }, // pièce jointe optionnelle (Cloudinary)
}, { timestamps: true });

module.exports = mongoose.model('Exercice', ExerciceSchema);
