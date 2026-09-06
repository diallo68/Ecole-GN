const mongoose = require('mongoose');

// Question à choix multiples d'un quiz.
const QuestionSchema = new mongoose.Schema({
  question:        { type: String, required: true },
  choix:           [{ type: String, required: true }],
  reponseCorrecte: { type: Number, required: true }, // index dans "choix"
  explication:     { type: String },
}, { _id: false });

// Quiz d'auto-évaluation, accessible à tout utilisateur inscrit depuis la
// page d'accueil. Contenu généré par IA puis relu/publié par un admin
// (voir cahier des charges §5.3 et §5.5).
const QuizSchema = new mongoose.Schema({
  titre:     { type: String, required: true },
  matiere:   { type: String, required: true },
  niveau:    { type: String, enum: ['primaire', 'college', 'lycee'], required: true },
  questions: [QuestionSchema],
  publie:    { type: Boolean, default: false }, // reste brouillon tant qu'un admin ne l'a pas relu/publié
  genereParIA: { type: Boolean, default: true },
  creePar:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // admin ayant publié
}, { timestamps: true });

module.exports = mongoose.model('Quiz', QuizSchema);
