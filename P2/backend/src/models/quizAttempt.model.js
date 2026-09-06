const mongoose = require('mongoose');

// Une tentative d'un utilisateur sur un quiz.
const QuizAttemptSchema = new mongoose.Schema({
  userId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  quizId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  reponses: [{ type: Number }], // index choisi par question, même ordre que quiz.questions
  score:    { type: Number, required: true }, // nombre de bonnes réponses
  total:    { type: Number, required: true },
}, { timestamps: true });

module.exports = mongoose.model('QuizAttempt', QuizAttemptSchema);
