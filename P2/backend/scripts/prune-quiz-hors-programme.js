// Le programme réel des 3 séries du lycée guinéen (fourni par l'utilisateur)
// diffère de ce qui avait été supposé lors de la création des filières :
// chaque série n'étudie pas les mêmes matières. Ce script supprime les quiz
// créés hors-programme pour leur filière (dupliqués uniformément sur les 3
// séries avant qu'on connaisse le vrai programme).
//
// Programme réel :
//  - Sciences Mathématiques (sm) : Mathématiques, Physique, Chimie, Français,
//    Philosophie, Anglais, Économie
//  - Sciences Sociales (ss) : Français, Philosophie, Économie, Mathématiques,
//    Anglais, Géographie, Histoire
//  - Sciences Expérimentales (se) : Français, Biologie, Mathématiques,
//    Physique, Chimie, Anglais, Économie
require('dotenv').config();
const mongoose = require('mongoose');

const PROGRAMME = {
  sm: ['Mathématiques', 'Physique', 'Chimie', 'Français', 'Philosophie', 'Anglais', 'Économie'],
  ss: ['Français', 'Philosophie', 'Économie', 'Mathématiques', 'Anglais', 'Géographie', 'Histoire'],
  se: ['Français', 'Biologie', 'Mathématiques', 'Physique', 'Chimie', 'Anglais', 'Économie'],
};

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const Quiz = require('../src/models/quiz.model');

  const lyceeQuizzes = await Quiz.find({ niveau: { $regex: /-(ss|se|sm)$/ } });
  let deleted = 0;
  for (const q of lyceeQuizzes) {
    const filiere = q.niveau.split('-')[1];
    const matieresValides = PROGRAMME[filiere];
    if (matieresValides && !matieresValides.includes(q.matiere)) {
      console.log(`Supprimé (hors-programme ${filiere}):`, q.titre, '/', q.matiere, '/', q.niveau);
      await Quiz.deleteOne({ _id: q._id });
      deleted++;
    }
  }
  console.log(`${deleted} quiz supprimé(s) sur ${lyceeQuizzes.length} quiz lycée examinés.`);
  await mongoose.disconnect();
}

run().catch(err => { console.error(err); process.exit(1); });
