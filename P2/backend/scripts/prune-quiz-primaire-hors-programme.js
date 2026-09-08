// Le programme réel du primaire guinéen (fourni par l'utilisateur) diffère
// de ce qui avait été supposé initialement : Lecture, Langage, Écriture,
// Calcul, Dessin, Récitation, Chant — et non "Calcul & Problèmes, Français,
// Biologie, Histoire, Géographie". Ce script supprime les quiz primaire
// créés sur les anciennes matières, devenues hors-programme.
require('dotenv').config();
const mongoose = require('mongoose');

const MATIERES_VALIDES = ['Lecture', 'Langage', 'Écriture', 'Calcul', 'Dessin', 'Récitation', 'Chant'];
const NIVEAUX_PRIMAIRE = ['cp1', 'cp2', 'ce1', 'ce2', 'cm1', 'cm2'];

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const Quiz = require('../src/models/quiz.model');

  const primaireQuizzes = await Quiz.find({ niveau: { $in: NIVEAUX_PRIMAIRE } });
  let deleted = 0;
  for (const q of primaireQuizzes) {
    if (!MATIERES_VALIDES.includes(q.matiere)) {
      console.log('Supprimé (hors-programme primaire):', q.titre, '/', q.matiere, '/', q.niveau);
      await Quiz.deleteOne({ _id: q._id });
      deleted++;
    }
  }
  console.log(`${deleted} quiz supprimé(s) sur ${primaireQuizzes.length} quiz primaire examinés.`);
  await mongoose.disconnect();
}

run().catch(err => { console.error(err); process.exit(1); });
