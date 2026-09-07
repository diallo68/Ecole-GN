// Le lycée guinéen se décline en 3 séries parallèles (Sciences Sociales,
// Sciences Expérimentales, Sciences Mathématiques) pour chaque classe
// (11ème, 12ème, Terminale). Les niveaux lycée passent donc de 3 valeurs
// plates ('11e','12e','terminale') à 9 valeurs '<classe>-<filière>'
// ('11e-ss','11e-se','11e-sm', ...).
//
// Ce script migre les données existantes créées sous l'ancien schéma :
//  - Quiz/Support/Exercice/Video (contenu pédagogique réutilisable) ayant
//    un niveau lycée plat sont dupliqués vers les 3 filières puis
//    l'original est supprimé (le contenu commun est jugé pertinent aux 3
//    séries tant qu'aucun contenu spécifique à une filière n'a été demandé).
//  - Reservation/ClasseVirtuelle sont des événements liés à un élève
//    précis : les dupliquer créerait de faux rendez-vous. On se contente
//    donc de les rapporter (aucun n'est attendu à ce stade du projet).
//  - User.repetiteur.niveaux : chaque valeur lycée plate est remplacée par
//    les 3 variantes filière (un enseignant démo est supposé couvrir les 3).
//  - User.eleve.niveau : simple rapport, pas de migration automatique
//    (impossible de deviner la filière réelle d'un élève sans lui demander).
require('dotenv').config();
const mongoose = require('mongoose');

const OLD_LYCEE = ['11e', '12e', 'terminale'];
const FILIERES = ['ss', 'se', 'sm'];
const expand = (v) => FILIERES.map(f => `${v}-${f}`);

async function migrateContentModel(Model, name) {
  const docs = await Model.find({ niveau: { $in: OLD_LYCEE } });
  let created = 0;
  for (const doc of docs) {
    const base = doc.toObject();
    delete base._id;
    delete base.__v;
    delete base.createdAt;
    delete base.updatedAt;
    for (const niveau of expand(doc.niveau)) {
      await Model.create({ ...base, niveau });
      created++;
    }
    await Model.deleteOne({ _id: doc._id });
  }
  console.log(`${name}: ${docs.length} document(s) migré(s) → ${created} créé(s).`);
}

async function run() {
  await mongoose.connect(process.env.MONGO_URI);

  const Quiz = require('../src/models/quiz.model');
  const Support = require('../src/models/support.model');
  const Exercice = require('../src/models/exercice.model');
  const Video = require('../src/models/video.model');
  const Reservation = require('../src/models/reservation.model');
  const ClasseVirtuelle = require('../src/models/classeVirtuelle.model');
  const User = require('../src/models/user.model');

  await migrateContentModel(Quiz, 'Quiz');
  await migrateContentModel(Support, 'Support');
  await migrateContentModel(Exercice, 'Exercice');
  await migrateContentModel(Video, 'Video');

  const reservationsAffectees = await Reservation.countDocuments({ niveau: { $in: OLD_LYCEE } });
  const classesAffectees = await ClasseVirtuelle.countDocuments({ niveau: { $in: OLD_LYCEE } });
  console.log(`Reservation: ${reservationsAffectees} document(s) avec niveau lycée plat (non modifié — événement lié à un élève précis).`);
  console.log(`ClasseVirtuelle: ${classesAffectees} document(s) avec niveau lycée plat (non modifié — événement lié à un élève précis).`);

  // Répétiteurs : étendre chaque niveau lycée plat vers les 3 filières.
  const repetiteurs = await User.find({ 'repetiteur.niveaux': { $in: OLD_LYCEE } });
  for (const rep of repetiteurs) {
    const niveaux = rep.repetiteur.niveaux;
    const nouveaux = new Set();
    for (const n of niveaux) {
      if (OLD_LYCEE.includes(n)) expand(n).forEach(v => nouveaux.add(v));
      else nouveaux.add(n);
    }
    rep.repetiteur.niveaux = Array.from(nouveaux);
    await rep.save();
    console.log(`Répétiteur ${rep.email}: niveaux lycée étendus →`, rep.repetiteur.niveaux.filter(v => v.includes('-')));
  }

  // Élèves : simple rapport, la filière réelle ne peut pas être devinée.
  const eleves = await User.find({ 'eleve.niveau': { $in: OLD_LYCEE } });
  if (eleves.length) {
    console.log(`⚠️  ${eleves.length} élève(s) avec un niveau lycée plat non migré (filière inconnue) :`);
    eleves.forEach(e => console.log(`   - ${e.email} : ${e.eleve.niveau}`));
    console.log('   → à corriger manuellement ou en leur redemandant leur série au prochain login.');
  } else {
    console.log('Aucun élève avec un niveau lycée plat à migrer.');
  }

  await mongoose.disconnect();
}

run().catch(err => { console.error(err); process.exit(1); });
