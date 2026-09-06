const mongoose = require('mongoose');

// Le rendu d'un élève pour un exercice donné (un seul rendu par élève et par
// exercice — un nouvel envoi remplace le précédent tant qu'il n'est pas corrigé).
const SoumissionSchema = new mongoose.Schema({
  exerciceId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Exercice', required: true },
  eleveId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reponseTexte: { type: String },
  fichierUrl:   { type: String }, // Cloudinary (pièce jointe optionnelle)
  statut:       { type: String, enum: ['rendu', 'corrige'], default: 'rendu' },
  note:         { type: Number },
  commentaire:  { type: String },
}, { timestamps: true });

SoumissionSchema.index({ exerciceId: 1, eleveId: 1 }, { unique: true });

module.exports = mongoose.model('Soumission', SoumissionSchema);
