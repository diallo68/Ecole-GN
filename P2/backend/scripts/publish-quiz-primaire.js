// Publie quiz-content-primaire.js — nouveau programme du primaire
// (Lecture, Langage, Écriture, Calcul, Dessin, Récitation, Chant). Pas de
// filière à gérer pour ce cycle, donc publication directe comme
// publish-quiz-content.js.
require('dotenv').config();
const mongoose = require('mongoose');
const Quiz = require('../src/models/quiz.model');
const User = require('../src/models/user.model');
const quizzes = require('./quiz-content-primaire');

async function run() {
  await mongoose.connect(process.env.MONGO_URI);

  const admin = await User.findOne({ role: 'admin' });
  if (!admin) throw new Error('Aucun compte admin trouvé pour créer les quiz.');

  let created = 0;
  for (const q of quizzes) {
    const exists = await Quiz.findOne({ titre: q.titre, matiere: q.matiere, niveau: q.niveau });
    if (exists) { console.log('Déjà présent, ignoré:', q.titre, q.matiere, q.niveau); continue; }
    await Quiz.create({ ...q, publie: true, creePar: admin._id });
    created++;
  }

  console.log(`${created} quiz créés sur ${quizzes.length} au total.`);
  await mongoose.disconnect();
}

run().catch(err => { console.error(err); process.exit(1); });
