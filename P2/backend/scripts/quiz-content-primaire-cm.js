// Contenu quiz pour les 3 matières que le programme officiel ajoute en
// CM1/CM2 (fin du primaire) par rapport aux classes précédentes : Sciences
// (éveil scientifique), Histoire, Géographie. Un quiz de 5 questions par
// matière et par classe (CM1, CM2). Contenu réel écrit pour l'occasion
// (pas de test), centré sur la Guinée quand c'est pertinent.
const Q = (question, choix, reponseCorrecte, explication) => ({ question, choix, reponseCorrecte, explication });

const quizzes = [];
const add = (titre, matiere, niveau, questions) => quizzes.push({ titre, matiere, niveau, questions });

// ══════════════════════════ SCIENCES ══════════════════════════

add('Le corps humain et la matière', 'Sciences', 'cm1', [
  Q('Combien de sens principaux possède le corps humain ?', ['3', '4', '5', '6'], 2, 'Les 5 sens sont : la vue, l\'ouïe, l\'odorat, le goût et le toucher.'),
  Q('Quel organe fait circuler le sang dans le corps ?', ['Le cœur', 'Le foie', 'L\'estomac', 'Le poumon'], 0, 'Le cœur pompe le sang dans tout le corps.'),
  Q('L\'eau à l\'état solide s\'appelle...', ['La vapeur', 'La glace', 'La pluie', 'Le brouillard'], 1, 'L\'eau gelée, solide, s\'appelle la glace.'),
  Q('Quelle partie de la plante absorbe l\'eau dans le sol ?', ['La fleur', 'La feuille', 'La racine', 'La tige'], 2, 'Les racines absorbent l\'eau et les minéraux du sol.'),
  Q('Que devient l\'eau quand on la fait chauffer très fort ?', ['De la glace', 'De la vapeur', 'Du sel', 'De l\'huile'], 1, 'En chauffant, l\'eau se transforme en vapeur (état gazeux).'),
]);

add('Le corps, la santé et l\'énergie', 'Sciences', 'cm2', [
  Q('Quel organe permet de respirer l\'air ?', ['Les poumons', 'Les reins', 'L\'estomac', 'Le foie'], 0, 'Les poumons permettent de faire entrer et sortir l\'air du corps.'),
  Q('Comment se protège-t-on le mieux du paludisme la nuit ?', ['En dormant sous une moustiquaire', 'En laissant les fenêtres ouvertes', 'En buvant beaucoup d\'eau froide', 'En ne mangeant pas le soir'], 0, 'La moustiquaire empêche les piqûres du moustique responsable du paludisme.'),
  Q('Quel organe digère les aliments dans le ventre ?', ['Le cœur', 'L\'estomac', 'Le cerveau', 'Le poumon'], 1, 'L\'estomac est l\'organe principal de la digestion des aliments.'),
  Q('Pour qu\'une ampoule électrique s\'allume, le circuit doit être...', ['Ouvert', 'Fermé', 'Coupé', 'Mouillé'], 1, 'Le courant ne circule que si le circuit électrique est fermé, sans coupure.'),
  Q('Se laver les mains avant de manger sert surtout à...', ['Se rafraîchir', 'Éliminer les microbes', 'Gagner du temps', 'Faire plaisir aux parents'], 1, 'Le lavage des mains élimine les microbes qui pourraient rendre malade.'),
]);

// ══════════════════════════ HISTOIRE ══════════════════════════

add('Les grands empires d\'Afrique de l\'Ouest', 'Histoire', 'cm1', [
  Q('Quel grand empire ouest-africain a été fondé par Soundiata Keïta ?', ['L\'empire du Ghana', 'L\'empire du Mali', 'L\'empire Songhaï', 'L\'empire Mossi'], 1, 'Soundiata Keïta fonde l\'empire du Mali au 13ème siècle.'),
  Q('Un "griot" est une personne qui...', ['Cultive la terre', 'Transmet l\'histoire orale et la musique', 'Commande l\'armée', 'Fabrique des outils'], 1, 'Le griot est le gardien de la tradition orale, de l\'histoire et de la musique.'),
  Q('Quel empire a précédé l\'empire du Mali dans la région ?', ['L\'empire du Ghana', 'L\'empire romain', 'L\'empire ottoman', 'L\'empire du Congo'], 0, 'L\'empire du Ghana (Wagadou) est l\'un des plus anciens grands empires de la région.'),
  Q('L\'empire Songhaï s\'est développé surtout autour de quel fleuve ?', ['Le Niger', 'Le Nil', 'Le Congo', 'La Volta'], 0, 'L\'empire Songhaï, avec Gao et Tombouctou, s\'étendait le long du fleuve Niger.'),
  Q('Ces grands empires étaient surtout connus pour le commerce de...', ['L\'or et le sel', 'Le pétrole', 'Le café', 'Le coton uniquement'], 0, 'Le commerce transsaharien de l\'or et du sel a fait la richesse de ces empires.'),
]);

add('La Guinée : colonisation et indépendance', 'Histoire', 'cm2', [
  Q('À quelle date la Guinée a-t-elle obtenu son indépendance ?', ['2 octobre 1958', '15 mai 1960', '3 avril 1984', '1er janvier 1958'], 0, 'La Guinée devient indépendante le 2 octobre 1958.'),
  Q('Qui a été le premier président de la République de Guinée ?', ['Ahmed Sékou Touré', 'Lansana Conté', 'Alpha Condé', 'Sékou Kaba'], 0, 'Ahmed Sékou Touré devient le premier président après l\'indépendance.'),
  Q('En 1958, la Guinée a voté "Non" à un référendum proposé par la France. Cela signifiait...', ['Rester une colonie française', 'Devenir indépendante immédiatement', 'Rejoindre un autre pays', 'Annuler les élections'], 1, 'Le "Non" guinéen au référendum de 1958 a mené directement à l\'indépendance.'),
  Q('Avant l\'indépendance, la Guinée faisait partie de...', ['L\'Afrique-Occidentale française (AOF)', 'L\'Empire britannique', 'L\'Afrique du Sud', 'Le Maroc'], 0, 'La Guinée était l\'une des colonies de l\'Afrique-Occidentale française.'),
  Q('La ville de Fria doit son importance historique surtout à...', ['Son usine d\'alumine, l\'une des premières du pays', 'Son port maritime', 'Son aéroport international', 'Ses mines de diamant'], 0, 'Fria abrite depuis 1960 l\'une des premières grandes usines d\'alumine de Guinée.'),
]);

// ══════════════════════════ GÉOGRAPHIE ══════════════════════════

add('La Guinée : régions et relief', 'Géographie', 'cm1', [
  Q('Combien de régions naturelles compte la Guinée ?', ['2', '3', '4', '5'], 2, 'La Guinée a 4 régions naturelles : Basse-Guinée, Moyenne-Guinée, Haute-Guinée, Guinée Forestière.'),
  Q('Quelle est la capitale de la Guinée ?', ['Kankan', 'Labé', 'Conakry', 'Nzérékoré'], 2, 'Conakry, sur la côte atlantique, est la capitale de la Guinée.'),
  Q('Le massif du Fouta Djalon se trouve dans quelle région ?', ['La Basse-Guinée', 'La Moyenne-Guinée', 'La Haute-Guinée', 'La Guinée Forestière'], 1, 'Le Fouta Djalon, massif montagneux, occupe la Moyenne-Guinée.'),
  Q('La Guinée est surnommée "château d\'eau de l\'Afrique de l\'Ouest" parce que...', ['Plusieurs grands fleuves y prennent leur source', 'Elle a le plus grand lac d\'Afrique', 'Elle ne connaît jamais la sécheresse', 'Elle exporte de l\'eau en bouteille'], 0, 'Le Niger, le Sénégal et la Gambie prennent tous leur source en Guinée.'),
  Q('Quel océan borde la Guinée à l\'ouest ?', ['L\'océan Indien', 'L\'océan Atlantique', 'La mer Méditerranée', 'La mer Rouge'], 1, 'La côte guinéenne s\'ouvre sur l\'océan Atlantique.'),
]);

add('La Guinée : ressources et pays voisins', 'Géographie', 'cm2', [
  Q('La Guinée possède les plus grandes réserves mondiales de...', ['Pétrole', 'Bauxite', 'Charbon', 'Blé'], 1, 'La Guinée détient les plus importantes réserves mondiales de bauxite.'),
  Q('La bauxite est surtout utilisée pour fabriquer...', ['De l\'aluminium', 'Du verre', 'Du ciment', 'Du sucre'], 0, 'La bauxite, une fois transformée en alumine, permet de produire de l\'aluminium.'),
  Q('Lequel de ces pays NE partage PAS de frontière avec la Guinée ?', ['Sénégal', 'Mali', 'Ghana', 'Sierra Leone'], 2, 'Le Ghana ne touche pas la Guinée ; contrairement au Sénégal, au Mali et à la Sierra Leone.'),
  Q('Simandou, dans le sud-est de la Guinée, est célèbre pour son gisement de...', ['Fer', 'Or', 'Sel', 'Diamant'], 0, 'Simandou abrite l\'un des plus grands gisements de fer au monde.'),
  Q('Quelle région guinéenne est couverte de forêts denses et de montagnes au sud-est ?', ['La Basse-Guinée', 'La Moyenne-Guinée', 'La Haute-Guinée', 'La Guinée Forestière'], 3, 'La Guinée Forestière, au sud-est du pays, est couverte de forêts et de montagnes.'),
]);

module.exports = quizzes;
