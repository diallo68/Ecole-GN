// Seed de démonstration — le compte élève test.gandal@example.com ne voyait
// ni exercice ni classe virtuelle car aucun n'existait encore en base (0
// Exercice, 0 ClasseVirtuelle). Ce script crée quelques exemples réalistes
// depuis le compte enseignant démo (Aïssatou Diallo, Mathématiques, 9ème)
// pour que les nouvelles pages "Mes exercices" / "Classes virtuelles" et le
// flux de rendu de devoir (avec pièce jointe) soient testables de bout en
// bout. Idempotent (vérifie l'existence par titre avant de créer).
require('dotenv').config();
const mongoose = require('mongoose');

async function run() {
  await mongoose.connect(process.env.MONGO_URI);

  const User = require('../src/models/user.model');
  const Exercice = require('../src/models/exercice.model');
  const ClasseVirtuelle = require('../src/models/classeVirtuelle.model');

  const rep = await User.findOne({ role: 'repetiteur' });
  const eleve = await User.findOne({ email: 'test.gandal@example.com' });
  if (!rep || !eleve) throw new Error('Compte(s) démo introuvable(s) — rien à faire.');

  const exercices = [
    {
      titre: 'Équations du premier degré',
      enonce: 'Résous les équations suivantes :\n1) 3x + 5 = 20\n2) 2(x - 4) = 10\n3) 5x - 3 = 2x + 12',
      correction: '1) x = 5\n2) x = 9\n3) x = 5',
      matiere: 'Mathématiques', niveau: '9e', chapitre: 'Équations',
    },
    {
      titre: 'Théorème de Pythagore — applications',
      enonce: "Un triangle rectangle a des côtés de l'angle droit mesurant 6 cm et 8 cm. Calcule la longueur de l'hypoténuse. Justifie ta réponse.",
      correction: "D'après le théorème de Pythagore : hypoténuse² = 6² + 8² = 36 + 64 = 100, donc hypoténuse = 10 cm.",
      matiere: 'Mathématiques', niveau: '9e', chapitre: 'Géométrie',
    },
    {
      titre: 'Calcul de pourcentages',
      enonce: "Un article coûte 150 000 GNF. Il est soldé à -20%. Quel est son nouveau prix ? Un autre article passe de 80 000 à 100 000 GNF : quel est le pourcentage d'augmentation ?",
      matiere: 'Mathématiques', niveau: '9e', chapitre: 'Proportionnalité',
    },
  ];

  let created = 0;
  for (const ex of exercices) {
    const exists = await Exercice.findOne({ titre: ex.titre, repetiteurId: rep._id });
    if (exists) { console.log('Exercice déjà présent, ignoré:', ex.titre); continue; }
    await Exercice.create({ ...ex, repetiteurId: rep._id });
    created++;
  }
  console.log(`${created} exercice(s) créé(s) sur ${exercices.length}.`);

  const titreClasse = 'Révisions — Équations et géométrie';
  const classeExiste = await ClasseVirtuelle.findOne({ titre: titreClasse, repetiteurId: rep._id });
  if (classeExiste) {
    console.log('Classe virtuelle déjà présente, ignorée.');
  } else {
    const dansSeptJours = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    dansSeptJours.setHours(17, 0, 0, 0);
    const room = `gandal-${require('crypto').randomBytes(8).toString('hex')}`;
    await ClasseVirtuelle.create({
      repetiteurId: rep._id,
      eleveIds: [eleve._id],
      titre: titreClasse,
      matiere: 'Mathématiques',
      niveau: '9e',
      dateHeure: dansSeptJours,
      dureeMinutes: 60,
      lienVisio: `https://meet.jit.si/${room}`,
    });
    console.log('Classe virtuelle créée pour le', dansSeptJours.toLocaleString('fr-FR'));
  }

  await mongoose.disconnect();
}

run().catch(err => { console.error(err); process.exit(1); });
