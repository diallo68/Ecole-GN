const mongoose = require('mongoose');
const { NIVEAUX_VALUES } = require('../utils/niveaux');

// Vidéo de cours uploadée par un répétiteur pour ses propres élèves.
const VideoSchema = new mongoose.Schema({
  repetiteurId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  titre:        { type: String, required: true },
  description:  { type: String },
  matiere:      { type: String, required: true },
  niveau:       { type: String, enum: NIVEAUX_VALUES, required: true },
  chapitre:     { type: String },
  url:          { type: String, required: true }, // Cloudinary
  dureeSecondes:{ type: Number },
  vues:         { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Video', VideoSchema);
