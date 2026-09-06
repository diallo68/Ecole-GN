// Migration ponctuelle : bascule les documents existants de l'ancien
// référentiel (primaire/college/lycee) vers les classes précises.
// Base Atlas partagée entre local et production — à exécuter UNE SEULE FOIS.
require('dotenv').config();
const mongoose = require('mongoose');

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection.db;

  // Élèves : 'college' -> '9e' (milieu du cycle), 'lycee' -> '11e'
  await db.collection('users').updateMany({ role: 'eleve', 'eleve.niveau': 'college' }, { $set: { 'eleve.niveau': '9e' } });
  await db.collection('users').updateMany({ role: 'eleve', 'eleve.niveau': 'lycee' }, { $set: { 'eleve.niveau': '11e' } });
  // Champ eleve.niveau résiduel sur des comptes non-élèves (ex: admin) : on l'efface, non utilisé
  await db.collection('users').updateMany(
    { role: { $ne: 'eleve' }, 'eleve.niveau': { $in: ['primaire', 'college', 'lycee'] } },
    { $unset: { 'eleve.niveau': '' } },
  );

  // Répétiteurs : niveaux enseignés -> éventail de classes du même cycle
  const repetiteurs = await db.collection('users').find({ role: 'repetiteur' }).toArray();
  for (const r of repetiteurs) {
    const anciens = r.repetiteur?.niveaux || [];
    const nouveaux = new Set();
    if (anciens.includes('primaire')) ['cp1', 'cp2', 'ce1', 'ce2', 'cm1', 'cm2'].forEach(n => nouveaux.add(n));
    if (anciens.includes('college')) ['7e', '8e', '9e', '10e'].forEach(n => nouveaux.add(n));
    if (anciens.includes('lycee')) ['11e', '12e', 'terminale'].forEach(n => nouveaux.add(n));
    if (nouveaux.size > 0) {
      await db.collection('users').updateOne({ _id: r._id }, { $set: { 'repetiteur.niveaux': [...nouveaux] } });
      console.log('Répétiteur', r.email, '-> niveaux', [...nouveaux]);
    }
  }

  // Anciens quiz/contenus de démo créés avant la refonte : supprimés (seront
  // remplacés par le nouveau lot complet, correctement gradué).
  const delQuiz = await db.collection('quizzes').deleteMany({ niveau: { $in: ['primaire', 'college', 'lycee'] } });
  const delSupports = await db.collection('supports').deleteMany({ niveau: { $in: ['primaire', 'college', 'lycee'] } });
  const delExercices = await db.collection('exercices').deleteMany({ niveau: { $in: ['primaire', 'college', 'lycee'] } });
  const delReservations = await db.collection('reservations').updateMany(
    { niveau: { $in: ['primaire', 'college', 'lycee'] } },
    [{ $set: { niveau: { $switch: {
      branches: [
        { case: { $eq: ['$niveau', 'primaire'] }, then: 'cm2' },
        { case: { $eq: ['$niveau', 'college'] }, then: '9e' },
        { case: { $eq: ['$niveau', 'lycee'] }, then: '11e' },
      ], default: '$niveau',
    } } } }],
  );

  console.log('Quiz supprimés:', delQuiz.deletedCount);
  console.log('Supports supprimés:', delSupports.deletedCount);
  console.log('Exercices supprimés:', delExercices.deletedCount);
  console.log('Réservations migrées:', delReservations.modifiedCount);

  await mongoose.disconnect();
  console.log('Migration terminée.');
}

run().catch(err => { console.error(err); process.exit(1); });
