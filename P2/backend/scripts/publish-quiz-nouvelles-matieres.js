// Publie quiz-content-nouvelles-matieres.js. Les quiz de collège (niveau
// déjà correct : 7e/8e/9e/10e) sont publiés tels quels. Les quiz de lycée
// sont écrits une fois avec un niveau "de base" (11e/12e/terminale) et
// dupliqués vers les filières où la matière existe réellement au programme
// (le contenu d'Anglais/Philosophie/Économie ne diffère pas d'une série à
// l'autre pour une même classe).
require('dotenv').config();
const mongoose = require('mongoose');

// Filières où chaque matière de lycée est réellement enseignée.
const FILIERES_PAR_MATIERE = {
  'Anglais': ['sm', 'ss', 'se'],
  'Philosophie': ['sm', 'ss'], // pas en Sciences Expérimentales
  'Économie': ['sm', 'ss', 'se'],
};
const NIVEAUX_LYCEE_BASE = ['11e', '12e', 'terminale'];

async function run() {
  await mongoose.connect(process.env.MONGO_URI);

  const Quiz = require('../src/models/quiz.model');
  const User = require('../src/models/user.model');
  const quizzes = require('./quiz-content-nouvelles-matieres');

  const admin = await User.findOne({ role: 'admin' });
  if (!admin) throw new Error('Aucun compte admin trouvé pour créer les quiz.');

  let created = 0, total = 0;
  for (const q of quizzes) {
    const estLycee = NIVEAUX_LYCEE_BASE.includes(q.niveau);
    const niveauxCibles = estLycee
      ? (FILIERES_PAR_MATIERE[q.matiere] || []).map(f => `${q.niveau}-${f}`)
      : [q.niveau];

    for (const niveau of niveauxCibles) {
      total++;
      const exists = await Quiz.findOne({ titre: q.titre, matiere: q.matiere, niveau });
      if (exists) { console.log('Déjà présent, ignoré:', q.titre, q.matiere, niveau); continue; }
      await Quiz.create({ titre: q.titre, matiere: q.matiere, niveau, questions: q.questions, publie: true, creePar: admin._id });
      created++;
    }
  }

  console.log(`${created} quiz créés sur ${total} au total (${quizzes.length} contenus uniques).`);
  await mongoose.disconnect();
}

run().catch(err => { console.error(err); process.exit(1); });
