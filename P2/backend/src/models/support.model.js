const mongoose = require('mongoose');
const { NIVEAUX_VALUES } = require('../utils/niveaux');

// Support de cours (fiche PDF, image...) publié par un répétiteur.
const SupportSchema = new mongoose.Schema({
  repetiteurId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  titre:        { type: String, required: true },
  matiere:      { type: String, required: true },
  niveau:       { type: String, enum: NIVEAUX_VALUES, required: true },
  chapitre:     { type: String },
  fichierUrl:   { type: String, required: true }, // Cloudinary (raw/pdf)
  type:         { type: String, enum: ['pdf', 'image', 'autre'], default: 'pdf' },
}, { timestamps: true });

module.exports = mongoose.model('Support', SupportSchema);
