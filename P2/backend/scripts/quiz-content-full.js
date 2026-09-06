// Banque complète de quiz — un quiz de 5 questions par matière et par classe,
// alignée sur le système éducatif guinéen (primaire CP1→CM2, collège 7e→10e,
// lycée 11e→Terminale). Contenu réel écrit pour l'occasion (pas de test).
const Q = (question, choix, reponseCorrecte, explication) => ({ question, choix, reponseCorrecte, explication });

const quizzes = [];
const add = (titre, matiere, niveau, questions) => quizzes.push({ titre, matiere, niveau, questions });

// ══════════════════════════ MATHÉMATIQUES ══════════════════════════

add('Compter et additionner', 'Mathématiques', 'cp1', [
  Q('Combien font 2 + 3 ?', ['4', '5', '6', '7'], 1, '2 + 3 = 5.'),
  Q('Quel nombre vient juste après 9 ?', ['8', '10', '11', '7'], 1, 'Après 9 vient 10.'),
  Q('Combien font 4 + 4 ?', ['6', '7', '8', '9'], 2, '4 + 4 = 8.'),
  Q('Parmi ces nombres, lequel est le plus grand ?', ['3', '7', '5', '1'], 1, '7 est le plus grand.'),
  Q('Combien font 10 - 3 ?', ['6', '7', '8', '5'], 1, '10 - 3 = 7.'),
]);

add('Additions et soustractions', 'Mathématiques', 'cp2', [
  Q('Combien font 12 + 5 ?', ['15', '16', '17', '18'], 2, '12 + 5 = 17.'),
  Q('Combien font 18 - 6 ?', ['10', '11', '12', '13'], 2, '18 - 6 = 12.'),
  Q('Quel est le double de 7 ?', ['12', '13', '14', '15'], 2, 'Le double de 7 est 14.'),
  Q('Combien font 9 + 9 ?', ['16', '17', '18', '19'], 2, '9 + 9 = 18.'),
  Q('Combien font 20 - 8 ?', ['10', '11', '12', '13'], 2, '20 - 8 = 12.'),
]);

add('Additions, soustractions et tables', 'Mathématiques', 'ce1', [
  Q('Combien font 25 + 17 ?', ['40', '41', '42', '43'], 2, '25 + 17 = 42.'),
  Q('Combien font 5 × 2 ?', ['8', '10', '12', '9'], 1, '5 × 2 = 10.'),
  Q('Combien font 3 × 5 ?', ['12', '15', '18', '10'], 1, '3 × 5 = 15.'),
  Q('Combien font 40 - 15 ?', ['23', '24', '25', '26'], 2, '40 - 15 = 25.'),
  Q('Combien font 10 × 4 ?', ['30', '40', '400', '14'], 1, '10 × 4 = 40.'),
]);

add('Multiplication, division et mesures', 'Mathématiques', 'ce2', [
  Q('Combien font 7 × 6 ?', ['36', '42', '48', '40'], 1, '7 × 6 = 42.'),
  Q('Combien font 56 ÷ 8 ?', ['6', '7', '8', '9'], 1, '56 ÷ 8 = 7.'),
  Q('Combien de centimètres dans un mètre ?', ['10', '100', '1000', '50'], 1, '1 mètre = 100 centimètres.'),
  Q('Combien font 9 × 9 ?', ['72', '81', '90', '99'], 1, '9 × 9 = 81.'),
  Q('Combien font 100 - 37 ?', ['53', '63', '73', '67'], 1, '100 - 37 = 63.'),
]);

add('Fractions et périmètres', 'Mathématiques', 'cm1', [
  Q('Que représente 1/2 d\'un gâteau ?', ['Le quart', 'La moitié', 'Le tiers', 'Le tout'], 1, '1/2 signifie une part sur deux, soit la moitié.'),
  Q('Quel est le périmètre d\'un rectangle de 5 cm sur 3 cm ?', ['8 cm', '15 cm', '16 cm', '18 cm'], 2, 'Périmètre = 2×(5+3) = 16 cm.'),
  Q('Combien font 3/4 + 1/4 ?', ['1/2', '1', '4/8', '2/4'], 1, '3/4 + 1/4 = 4/4 = 1.'),
  Q('Combien font 6 × 12 ?', ['62', '72', '68', '82'], 1, '6 × 12 = 72.'),
  Q('Quelle est l\'aire d\'un carré de côté 4 cm ?', ['8 cm²', '12 cm²', '16 cm²', '20 cm²'], 2, 'Aire = 4 × 4 = 16 cm².'),
]);

add('Fractions, décimaux et pourcentages', 'Mathématiques', 'cm2', [
  Q('Combien font 1/2 + 1/4 ?', ['2/6', '3/4', '2/4', '1/6'], 1, '1/2 = 2/4, donc 2/4 + 1/4 = 3/4.'),
  Q('Combien font 3,5 + 2,7 ?', ['5,2', '6,0', '6,2', '5,7'], 2, '3,5 + 2,7 = 6,2.'),
  Q('50% d\'une quantité représente...', ['Le quart', 'La moitié', 'Le tiers', 'Le tout'], 1, '50% = 1/2, soit la moitié.'),
  Q('Combien font 12 × 15 ?', ['160', '170', '180', '190'], 2, '12 × 15 = 180.'),
  Q('Quelle est l\'aire d\'un rectangle de 8 m sur 5 m ?', ['13 m²', '26 m²', '40 m²', '45 m²'], 2, 'Aire = 8 × 5 = 40 m².'),
]);

add('Nombres relatifs et proportionnalité', 'Mathématiques', '7e', [
  Q('Combien font (-3) + 5 ?', ['-8', '2', '-2', '8'], 1, '(-3) + 5 = 2.'),
  Q('Combien font (-4) × (-2) ?', ['-8', '8', '-6', '6'], 1, 'Le produit de deux nombres négatifs est positif : 8.'),
  Q('Si 3 kg coûtent 6000 GNF, combien coûtent 5 kg (même prix au kg) ?', ['8000 GNF', '9000 GNF', '10000 GNF', '12000 GNF'], 2, 'Prix au kg = 2000 GNF, donc 5 × 2000 = 10000 GNF.'),
  Q('Combien font 3/5 en pourcentage ?', ['30%', '50%', '60%', '65%'], 2, '3/5 = 0,6 = 60%.'),
  Q('Combien font (-7) - (-2) ?', ['-9', '-5', '5', '9'], 1, '(-7) - (-2) = -7 + 2 = -5.'),
]);

add('Puissances, équations et Pythagore', 'Mathématiques', '8e', [
  Q('Combien vaut 3² ?', ['6', '9', '12', '3'], 1, '3² = 3 × 3 = 9.'),
  Q('Résous : x + 5 = 12. Que vaut x ?', ['5', '6', '7', '17'], 2, 'x = 12 - 5 = 7.'),
  Q('Dans un triangle rectangle de côtés 3 et 4, combien vaut l\'hypoténuse ?', ['5', '6', '7', '25'], 0, 'D\'après Pythagore : √(3²+4²) = √25 = 5.'),
  Q('Combien vaut 2⁴ ?', ['8', '12', '16', '32'], 2, '2⁴ = 2×2×2×2 = 16.'),
  Q('Résous : 3x = 21. Que vaut x ?', ['6', '7', '8', '9'], 1, 'x = 21 ÷ 3 = 7.'),
]);

add('Équations, Thalès et fonctions', 'Mathématiques', '9e', [
  Q('Résous : 2x + 3 = 11. Que vaut x ?', ['3', '4', '5', '7'], 1, '2x = 8, donc x = 4.'),
  Q('Dans le théorème de Thalès, les triangles obtenus sont...', ['Isométriques', 'Semblables', 'Rectangles', 'Équilatéraux'], 1, 'Le théorème de Thalès donne des triangles semblables (proportionnels).'),
  Q('Pour f(x) = 2x + 1, combien vaut f(3) ?', ['5', '6', '7', '8'], 2, 'f(3) = 2×3 + 1 = 7.'),
  Q('Combien font √49 ?', ['6', '7', '8', '9'], 1, '√49 = 7 car 7² = 49.'),
  Q('Quelle est la somme des angles d\'un triangle ?', ['90°', '180°', '270°', '360°'], 1, 'La somme des angles d\'un triangle vaut toujours 180°.'),
]);

add('Fonctions, statistiques et trigonométrie', 'Mathématiques', '10e', [
  Q('Pour f(x) = x² - 1, combien vaut f(3) ?', ['6', '7', '8', '9'], 2, 'f(3) = 9 - 1 = 8.'),
  Q('Quelle est la moyenne de 10, 12 et 14 ?', ['11', '12', '13', '14'], 1, '(10+12+14)/3 = 36/3 = 12.'),
  Q('Dans un triangle rectangle, sin(angle) = ...', ['Opposé/Hypoténuse', 'Adjacent/Hypoténuse', 'Opposé/Adjacent', 'Hypoténuse/Opposé'], 0, 'sin = côté opposé / hypoténuse.'),
  Q('Quelle est la médiane de 3, 7, 9, 12, 15 ?', ['7', '9', '12', '15'], 1, 'La médiane est la valeur centrale : 9.'),
  Q('Combien vaut 5³ ?', ['15', '25', '125', '75'], 2, '5³ = 5×5×5 = 125.'),
]);

add('Second degré, suites et vecteurs', 'Mathématiques', '11e', [
  Q('Résous : x² = 16. Quelles sont les solutions ?', ['4 seulement', '-4 seulement', '4 et -4', '8 et -8'], 2, 'x² = 16 donne x = 4 ou x = -4.'),
  Q('Dans une suite arithmétique de raison 3 commençant à 2, quel est le 4e terme ?', ['8', '9', '10', '11'], 3, '2, 5, 8, 11 : le 4e terme est 11.'),
  Q('Le vecteur AB a pour coordonnées (xB-xA, yB-yA). Vrai ou faux ?', ['Vrai', 'Faux', 'Seulement si A=B', 'Seulement en 3D'], 0, 'C\'est la définition des coordonnées d\'un vecteur.'),
  Q('Quel est le discriminant de x² - 5x + 6 = 0 ?', ['1', '2', '3', '4'], 0, 'Δ = 25 - 24 = 1.'),
  Q('Combien vaut la somme des 3 premiers termes de la suite 1, 2, 4 (géométrique de raison 2) ?', ['6', '7', '8', '9'], 1, '1+2+4 = 7.'),
]);

add('Dérivées, exponentielles et probabilités', 'Mathématiques', '12e', [
  Q('Quelle est la dérivée de f(x) = x² ?', ['x', '2x', 'x²', '2'], 1, 'f\'(x) = 2x.'),
  Q('Quelle est la dérivée de f(x) = 3x + 5 ?', ['3', '5', '3x', '8'], 0, 'La dérivée d\'une fonction affine ax+b est a, donc 3.'),
  Q('Combien vaut e⁰ ?', ['0', '1', 'e', 'Indéfini'], 1, 'Tout nombre (non nul) à la puissance 0 vaut 1.'),
  Q('En lançant un dé, quelle est la probabilité d\'obtenir un 6 ?', ['1/2', '1/3', '1/6', '1/4'], 2, 'Un dé a 6 faces équiprobables, donc 1/6.'),
  Q('Quelle est la dérivée de f(x) = x³ ?', ['x²', '2x²', '3x²', '3x'], 2, 'f\'(x) = 3x².'),
]);

add('Limites, intégrales et probabilités', 'Mathématiques', 'terminale', [
  Q('Quelle est la limite de 1/x quand x tend vers +∞ ?', ['+∞', '0', '1', 'Indéfini'], 1, '1/x tend vers 0 quand x devient très grand.'),
  Q('Quelle est une primitive de f(x) = 2x ?', ['x', 'x²', '2x²', 'x²+1'], 1, 'La dérivée de x² est 2x, donc x² est une primitive (parmi x²+C).'),
  Q('Deux événements sont indépendants si...', ['Ils ne peuvent pas se produire ensemble', 'La réalisation de l\'un n\'influence pas l\'autre', 'Ils ont la même probabilité', 'Leur somme fait 1'], 1, 'C\'est la définition de l\'indépendance en probabilités.'),
  Q('Quelle est la partie réelle du nombre complexe 3 + 4i ?', ['3', '4', '5', '7'], 0, 'Dans a + bi, la partie réelle est a = 3.'),
  Q('Quelle est l\'intégrale de 1 à 2 de la fonction constante f(x) = 3 ?', ['1', '2', '3', '6'], 2, 'Aire d\'un rectangle de largeur 1 et hauteur 3 = 3.'),
]);

// ══════════════════════════ FRANÇAIS ══════════════════════════

add('Les sons et les syllabes', 'Français', 'cp1', [
  Q('Combien de syllabes dans "papa" ?', ['1', '2', '3', '4'], 1, '"pa-pa" : 2 syllabes.'),
  Q('Quelle lettre commence le mot "chat" ?', ['C', 'H', 'A', 'T'], 0, 'Le mot "chat" commence par la lettre C.'),
  Q('Quel mot rime avec "bateau" ?', ['Chapeau', 'Table', 'Fleur', 'Maison'], 0, '"Bateau" et "chapeau" se terminent par le même son.'),
  Q('Combien de syllabes dans "maison" ?', ['1', '2', '3', '4'], 1, '"mai-son" : 2 syllabes.'),
  Q('Quelle est la voyelle dans "lit" ?', ['L', 'I', 'T', 'Aucune'], 1, 'La voyelle du mot "lit" est le I.'),
]);

add('Lecture de mots et phrases simples', 'Français', 'cp2', [
  Q('Quel est le contraire de "grand" ?', ['Petit', 'Fort', 'Rapide', 'Beau'], 0, '"Petit" est le contraire de "grand".'),
  Q('Complète : "Le chien ___ dans le jardin."', ['courent', 'court', 'courir', 'courrai'], 1, 'Sujet singulier "le chien" → verbe au singulier "court".'),
  Q('Quel mot désigne un animal ?', ['Table', 'Chat', 'Voiture', 'Maison'], 1, '"Chat" est un animal.'),
  Q('Combien de mots dans la phrase "Le soleil brille" ?', ['2', '3', '4', '5'], 1, '"Le / soleil / brille" : 3 mots.'),
  Q('Quel est le pluriel de "un chat" ?', ['Un chats', 'Des chat', 'Des chats', 'Les chat'], 2, 'Le pluriel de "un chat" est "des chats".'),
]);

add('Conjugaison et accords de base', 'Français', 'ce1', [
  Q('Conjugue "chanter" au présent avec "je" :', ['je chante', 'je chantes', 'je chantent', 'je chantais'], 0, 'Au présent, "je chante" (1er groupe).'),
  Q('Quel est le féminin de "petit" ?', ['Petite', 'Petitte', 'Petit', 'Petis'], 0, 'Le féminin de "petit" est "petite".'),
  Q('Complète : "Les enfants ___ dans la cour."', ['joue', 'jouent', 'joues', 'jouer'], 1, 'Sujet pluriel "les enfants" → verbe au pluriel "jouent".'),
  Q('Quel est le pluriel de "un cheval" ?', ['Des chevals', 'Des chevaux', 'Des cheval', 'Les cheval'], 1, 'Le pluriel de "cheval" est "chevaux" (cas particulier).'),
  Q('Conjugue "être" au présent avec "tu" :', ['tu es', 'tu êtes', 'tu est', 'tu être'], 0, 'Au présent, "tu es" (verbe être).'),
]);

add('Conjugaison, phrases et synonymes', 'Français', 'ce2', [
  Q('Conjugue "manger" au passé composé avec "il" :', ['il a mangé', 'il mangea', 'il mange', 'il mangeait'], 0, 'Passé composé : auxiliaire "avoir" + participe passé.'),
  Q('Quel type de phrase est "Range ta chambre !" ?', ['Déclarative', 'Interrogative', 'Impérative', 'Exclamative'], 2, 'C\'est un ordre, donc une phrase impérative.'),
  Q('Quel est un synonyme de "content" ?', ['Triste', 'Heureux', 'Fatigué', 'Fâché'], 1, '"Heureux" a le même sens que "content".'),
  Q('Quel est le contraire de "commencer" ?', ['Continuer', 'Terminer', 'Débuter', 'Ouvrir'], 1, '"Terminer" est le contraire de "commencer".'),
  Q('Quel signe termine une phrase interrogative ?', ['.', '!', '?', ','], 2, 'Une phrase interrogative se termine par un point d\'interrogation.'),
]);

add('Nature des mots et imparfait', 'Français', 'cm1', [
  Q('Dans "le grand arbre vert", quel mot est un adjectif ?', ['le', 'arbre', 'grand', 'aucun'], 2, '"Grand" décrit l\'arbre : c\'est un adjectif.'),
  Q('Conjugue "avoir" à l\'imparfait avec "nous" :', ['nous avons', 'nous avions', 'nous aurons', 'nous eûmes'], 1, 'Imparfait de "avoir" avec "nous" : nous avions.'),
  Q('Quel mot est un verbe dans "elle chante bien" ?', ['elle', 'chante', 'bien', 'aucun'], 1, '"Chante" est l\'action : c\'est le verbe.'),
  Q('Quel est le nom commun dans "Mamadou aime le riz" ?', ['Mamadou', 'aime', 'riz', 'le'], 2, '"Riz" est un nom commun (Mamadou est un nom propre).'),
  Q('Quel est le contraire de "monter" ?', ['Descendre', 'Sauter', 'Courir', 'Tomber'], 0, '"Descendre" est le contraire de "monter".'),
]);

add('Futur, compléments et homophones', 'Français', 'cm2', [
  Q('Conjugue "finir" au futur avec "je" :', ['je finis', 'je finirai', 'je finissais', 'je finirais'], 1, 'Futur simple : je finirai.'),
  Q('Dans "Il mange une pomme", quel est le COD ?', ['Il', 'mange', 'une pomme', 'aucun'], 2, '"Une pomme" répond à la question "mange quoi ?" : c\'est le COD.'),
  Q('Quelle orthographe est correcte : "il ___ tard" ?', ['ai', 'es', 'est', 'et'], 2, '"Il est tard" (verbe être).'),
  Q('Quel homophone complète "___ ballon est rouge" ?', ['son', 'sont', 'c\'est', 'sa'], 0, '"Son ballon" (possessif).'),
  Q('Quel est le COI dans "Il parle à son ami" ?', ['Il', 'parle', 'à son ami', 'aucun'], 2, '"À son ami" est introduit par "à" : c\'est un COI.'),
]);

add('Classes grammaticales et conjugaison', 'Français', '7e', [
  Q('Quelle est la classe grammaticale de "rapidement" ?', ['Nom', 'Adjectif', 'Adverbe', 'Verbe'], 2, '"Rapidement" modifie un verbe : c\'est un adverbe.'),
  Q('Conjugue "aller" au présent avec "nous" :', ['nous allons', 'nous allez', 'nous vont', 'nous irons'], 0, 'Présent de "aller" avec "nous" : nous allons.'),
  Q('Quel est le pluriel de "un journal" ?', ['Des journals', 'Des journaux', 'Des journale', 'Les journal'], 1, 'Le pluriel de "journal" est "journaux".'),
  Q('Dans "le livre de Fatou", quel mot est une préposition ?', ['le', 'livre', 'de', 'Fatou'], 2, '"De" relie deux groupes nominaux : c\'est une préposition.'),
  Q('Quel est un antonyme de "rapide" ?', ['Lent', 'Vite', 'Pressé', 'Agile'], 0, '"Lent" est le contraire de "rapide".'),
]);

add('Figures de style et participe passé', 'Français', '8e', [
  Q('"Il pleut des cordes" est une...', ['Comparaison', 'Métaphore', 'Personnification', 'Antithèse'], 1, 'C\'est une métaphore (comparaison sans "comme").'),
  Q('Accorde : "Les fleurs que j\'ai ___" (cueillir)', ['cueilli', 'cueillies', 'cueillie', 'cueillis'], 1, 'Le COD "que" (fleurs, fém. plur.) est placé avant : accord au féminin pluriel.'),
  Q('"Fort comme un lion" est une...', ['Métaphore', 'Comparaison', 'Personnification', 'Hyperbole'], 1, 'Le mot "comme" introduit une comparaison.'),
  Q('Quelle figure de style est "Le vent chuchote" ?', ['Métaphore', 'Personnification', 'Comparaison', 'Antithèse'], 1, 'On attribue une action humaine (chuchoter) au vent : personnification.'),
  Q('Conjugue "voir" au passé composé avec "elle" :', ['elle a vu', 'elle a vue', 'elle voit', 'elle voyait'], 0, 'Passé composé de "voir" avec "elle" (sans COD avant) : elle a vu.'),
]);

add('Analyse de phrase et subordonnées', 'Français', '9e', [
  Q('Dans "Je pense que tu as raison", quelle est la proposition subordonnée ?', ['Je pense', 'que tu as raison', 'tu as', 'raison'], 1, '"Que tu as raison" dépend du verbe "pense" : c\'est la subordonnée.'),
  Q('Quel mot introduit une subordonnée relative ?', ['Et', 'Qui', 'Mais', 'Donc'], 1, '"Qui" est un pronom relatif qui introduit une relative.'),
  Q('Conjugue "faire" au subjonctif présent avec "il faut que je" :', ['je fais', 'je fasse', 'je ferai', 'je faisais'], 1, 'Subjonctif présent de "faire" : que je fasse.'),
  Q('Quelle est la fonction de "hier" dans "Hier, il a plu" ?', ['Sujet', 'COD', 'Complément circonstanciel de temps', 'Attribut'], 2, '"Hier" indique le moment : complément circonstanciel de temps.'),
  Q('Quel est le synonyme de "abandonner" ?', ['Continuer', 'Renoncer', 'Commencer', 'Réussir'], 1, '"Renoncer" a un sens proche d\'"abandonner".'),
]);

add('Analyse de texte et argumentation', 'Français', '10e', [
  Q('Un texte argumentatif cherche à...', ['Raconter une histoire', 'Convaincre le lecteur', 'Décrire un lieu', 'Expliquer une recette'], 1, 'Le texte argumentatif défend une thèse pour convaincre.'),
  Q('Quelle figure de style est une antithèse ?', ['Rapprocher deux mots opposés', 'Répéter un mot', 'Comparer avec "comme"', 'Exagérer une idée'], 0, 'L\'antithèse rapproche deux idées opposées dans une même phrase.'),
  Q('Quel connecteur logique introduit une opposition ?', ['Donc', 'Cependant', 'Ensuite', 'Ainsi'], 1, '"Cependant" marque une opposition ou une nuance.'),
  Q('Résumer un texte, c\'est...', ['Le recopier', 'En donner l\'essentiel en moins de mots', 'L\'allonger', 'Le traduire'], 1, 'Le résumé condense les idées principales.'),
  Q('Quel est le rôle d\'une thèse dans un texte argumentatif ?', ['Décorer le texte', 'L\'idée défendue par l\'auteur', 'Une figure de style', 'La conclusion uniquement'], 1, 'La thèse est l\'opinion défendue tout au long du texte.'),
]);

add('Mouvements littéraires et rhétorique', 'Français', '11e', [
  Q('Quel mouvement littéraire valorise la raison au 18e siècle ?', ['Le romantisme', 'Les Lumières', 'Le réalisme', 'Le symbolisme'], 1, 'Le mouvement des Lumières prône la raison et le savoir.'),
  Q('Le romantisme met en avant surtout...', ['La raison', 'Les sentiments et la nature', 'Les sciences', 'Le commerce'], 1, 'Le romantisme valorise l\'émotion, la nature et l\'individu.'),
  Q('Une hyperbole sert à...', ['Minimiser une idée', 'Exagérer pour marquer les esprits', 'Comparer deux choses', 'Opposer deux idées'], 1, 'L\'hyperbole est une exagération volontaire.'),
  Q('Qu\'est-ce qu\'un present de narration ?', ['Un présent utilisé pour raconter le passé avec vivacité', 'Un futur proche', 'Un temps du subjonctif', 'Un mode impératif'], 0, 'Le présent de narration rend le récit plus vivant.'),
  Q('Le réalisme cherche à...', ['Idéaliser la réalité', 'Décrire la réalité telle qu\'elle est', 'Inventer un monde imaginaire', 'Rimer les mots'], 1, 'Le réalisme dépeint la société sans l\'embellir.'),
]);

add('Méthode du commentaire et mouvements', 'Français', '12e', [
  Q('Dans un commentaire de texte, un axe de lecture est...', ['Une citation', 'Un angle d\'analyse du texte', 'Le titre du livre', 'La biographie de l\'auteur'], 1, 'Un axe organise l\'analyse autour d\'une idée clé.'),
  Q('Le symbolisme privilégie...', ['La clarté et la logique', 'Les suggestions et symboles', 'Les faits historiques', 'Le comique'], 1, 'Les symbolistes préfèrent suggérer plutôt que décrire directement.'),
  Q('Une problématique dans une dissertation doit être...', ['Une affirmation', 'Une question qui guide l\'analyse', 'Un résumé du texte', 'La conclusion'], 1, 'La problématique est la question centrale à laquelle répond le devoir.'),
  Q('Quel est le rôle de la conclusion dans une dissertation ?', ['Poser le sujet', 'Répondre à la problématique et ouvrir', 'Citer l\'auteur', 'Résumer chaque paragraphe'], 1, 'La conclusion répond à la problématique et peut ouvrir vers une autre réflexion.'),
  Q('Le théâtre classique respecte la règle des trois unités : temps, lieu et...', ['Personnage', 'Action', 'Décor', 'Dialogue'], 1, 'Les trois unités classiques sont : temps, lieu, action.'),
]);

add('Littérature et argumentation avancée', 'Français', 'terminale', [
  Q('Quel est le but principal d\'un essai littéraire ?', ['Raconter une fiction', 'Développer une réflexion personnelle argumentée', 'Décrire un paysage', 'Rimer des vers'], 1, 'L\'essai expose une pensée personnelle sur un sujet.'),
  Q('Qu\'est-ce que l\'ironie ?', ['Dire le contraire de ce qu\'on pense pour se moquer', 'Exagérer une qualité', 'Répéter un son', 'Comparer deux objets'], 0, 'L\'ironie consiste à dire l\'inverse de sa pensée réelle, souvent pour critiquer.'),
  Q('Dans une argumentation, un exemple sert à...', ['Remplacer l\'argument', 'Illustrer et renforcer un argument', 'Conclure le texte', 'Poser une question'], 1, 'L\'exemple concrétise et appuie l\'argument développé.'),
  Q('Le théâtre de l\'absurde remet en cause...', ['La logique du langage et du monde', 'Les règles de la rime', 'L\'histoire officielle', 'Les mathématiques'], 0, 'Il questionne le non-sens de la condition humaine et du langage.'),
  Q('Une thèse et son antithèse s\'opposent dans un plan...', ['Chronologique', 'Dialectique', 'Thématique', 'Descriptif'], 1, 'Le plan dialectique confronte thèse, antithèse puis synthèse.'),
]);

// ══════════════════════════ SCIENCES PHYSIQUES (7e→Terminale) ══════════════════════════

add('États de la matière et mélanges', 'Sciences Physiques', '7e', [
  Q('Quel est l\'état de l\'eau à température ambiante ?', ['Solide', 'Liquide', 'Gazeux', 'Plasma'], 1, 'À température ambiante, l\'eau est liquide.'),
  Q('Comment appelle-t-on le passage de l\'état liquide à l\'état gazeux ?', ['Fusion', 'Solidification', 'Vaporisation', 'Condensation'], 2, 'Le passage liquide → gaz s\'appelle la vaporisation.'),
  Q('L\'eau salée est un mélange...', ['Hétérogène', 'Homogène', 'Solide', 'Gazeux'], 1, 'On ne distingue pas le sel dans l\'eau : c\'est un mélange homogène.'),
  Q('À quelle température l\'eau gèle-t-elle (à pression normale) ?', ['0°C', '10°C', '-10°C', '100°C'], 0, 'L\'eau gèle à 0°C.'),
  Q('Comment sépare-t-on le sable de l\'eau ?', ['Distillation', 'Filtration', 'Évaporation seule', 'Aimantation'], 1, 'La filtration retient le sable et laisse passer l\'eau.'),
]);

add('Électricité et énergie', 'Sciences Physiques', '8e', [
  Q('Dans un circuit en série, si une lampe grille, les autres...', ['Restent allumées', 'S\'éteignent aussi', 'Brillent plus fort', 'Explosent'], 1, 'En série, le circuit est coupé en un seul point : tout s\'éteint.'),
  Q('Quel appareil mesure l\'intensité du courant ?', ['Voltmètre', 'Ampèremètre', 'Thermomètre', 'Baromètre'], 1, 'L\'ampèremètre mesure l\'intensité en ampères.'),
  Q('Quelle est l\'unité de l\'énergie électrique facturée par les compteurs ?', ['Le watt', 'Le kilowattheure', 'L\'ampère', 'Le volt'], 1, 'L\'énergie consommée se mesure en kilowattheures (kWh).'),
  Q('Un générateur sert à...', ['Consommer de l\'énergie', 'Produire une tension électrique', 'Mesurer une résistance', 'Isoler un circuit'], 1, 'Le générateur fournit l\'énergie électrique au circuit.'),
  Q('Quel matériau est un bon isolant électrique ?', ['Le cuivre', 'Le fer', 'Le plastique', 'L\'aluminium'], 2, 'Le plastique ne laisse pas passer le courant : c\'est un isolant.'),
]);

add('Forces, densité et circuits', 'Sciences Physiques', '9e', [
  Q('Quelle est l\'unité de la force dans le Système International ?', ['Le kilogramme', 'Le newton', 'Le watt', 'Le joule'], 1, 'La force se mesure en newtons (N).'),
  Q('Un objet flotte sur l\'eau si sa densité est...', ['Supérieure à 1', 'Égale à 1', 'Inférieure à 1', 'Négative'], 2, 'Un objet moins dense que l\'eau (densité < 1) flotte.'),
  Q('Dans un circuit en parallèle, si une branche est coupée...', ['Tout le circuit s\'arrête', 'Les autres branches fonctionnent toujours', 'Le courant augmente à l\'infini', 'Rien ne change'], 1, 'Chaque branche en parallèle est indépendante.'),
  Q('Quelle grandeur mesure la "quantité de matière" contenue dans un volume ?', ['La masse volumique', 'La vitesse', 'La force', 'La tension'], 0, 'La masse volumique (densité) relie masse et volume.'),
  Q('Que représente le poids d\'un objet ?', ['Sa masse', 'La force exercée par la gravité sur lui', 'Son volume', 'Sa vitesse'], 1, 'Le poids est une force due à la gravité, contrairement à la masse.'),
]);

add('Optique et notions de chimie', 'Sciences Physiques', '10e', [
  Q('La lumière se propage en ligne...', ['Courbe', 'Droite', 'Circulaire', 'Aléatoire'], 1, 'Dans un milieu homogène, la lumière se propage en ligne droite.'),
  Q('Quelle est la plus petite unité de matière qui garde les propriétés d\'un élément ?', ['La molécule', 'L\'atome', 'Le noyau', 'L\'électron'], 1, 'L\'atome est l\'unité de base d\'un élément chimique.'),
  Q('Une molécule d\'eau est composée de...', ['1 oxygène et 1 hydrogène', '2 oxygènes et 1 hydrogène', '2 hydrogènes et 1 oxygène', '2 hydrogènes et 2 oxygènes'], 2, 'La formule de l\'eau est H₂O : 2 hydrogènes, 1 oxygène.'),
  Q('Un miroir plan donne une image...', ['Réelle et agrandie', 'Virtuelle et de même taille', 'Floue', 'Inversée en taille'], 1, 'L\'image dans un miroir plan est virtuelle, droite et de même taille.'),
  Q('Quel est le symbole chimique du carbone ?', ['Ca', 'C', 'Cb', 'Co'], 1, 'Le symbole du carbone est C.'),
]);

add('Mécanique et réactions chimiques', 'Sciences Physiques', '11e', [
  Q('La vitesse moyenne se calcule par...', ['Distance × temps', 'Distance ÷ temps', 'Temps ÷ distance', 'Distance + temps'], 1, 'Vitesse = distance parcourue / temps mis.'),
  Q('Une réaction chimique conserve toujours...', ['Le volume', 'La masse totale', 'La couleur', 'La température'], 1, 'La loi de conservation de la masse (Lavoisier) : rien ne se perd, rien ne se crée.'),
  Q('Quelle grandeur reste constante dans un mouvement rectiligne uniforme ?', ['L\'accélération', 'La vitesse', 'La position', 'La force'], 1, 'Dans un mouvement uniforme, la vitesse est constante.'),
  Q('Le pH d\'une solution acide est...', ['Supérieur à 7', 'Égal à 7', 'Inférieur à 7', 'Négatif'], 2, 'Une solution acide a un pH inférieur à 7.'),
  Q('Quelle force s\'oppose au mouvement d\'un objet sur une surface ?', ['La poussée', 'Le frottement', 'La gravité', 'La tension'], 1, 'Le frottement s\'oppose au mouvement relatif entre deux surfaces.'),
]);

add('Électricité avancée et thermodynamique', 'Sciences Physiques', '12e', [
  Q('La loi d\'Ohm s\'écrit :', ['U = R + I', 'U = R × I', 'U = R ÷ I', 'U = R - I'], 1, 'La loi d\'Ohm : Tension = Résistance × Intensité.'),
  Q('Quelle est l\'unité de la résistance électrique ?', ['Le volt', 'L\'ampère', 'L\'ohm', 'Le watt'], 2, 'La résistance se mesure en ohms (Ω).'),
  Q('La chaleur se propage par conduction, convection et...', ['Réflexion', 'Rayonnement', 'Réfraction', 'Diffusion'], 1, 'Les trois modes de transfert de chaleur sont conduction, convection, rayonnement.'),
  Q('Que mesure la puissance électrique P = U × I ?', ['L\'énergie stockée', 'L\'énergie consommée par seconde', 'La résistance', 'La fréquence'], 1, 'La puissance est l\'énergie transférée par unité de temps.'),
  Q('Un système isolé thermiquement n\'échange pas de chaleur avec...', ['Lui-même', 'L\'extérieur', 'Ses molécules', 'Rien, il échange toujours'], 1, 'Un système isolé n\'a pas d\'échange thermique avec l\'extérieur.'),
]);

add('Mécanique newtonienne et chimie organique', 'Sciences Physiques', 'terminale', [
  Q('La première loi de Newton stipule qu\'un objet au repos...', ['Accélère toujours', 'Reste au repos sauf force extérieure', 'Se met toujours en mouvement', 'Perd sa masse'], 1, 'Principe d\'inertie : sans force extérieure, l\'état de repos ou de mouvement uniforme est conservé.'),
  Q('La deuxième loi de Newton s\'écrit :', ['F = m × a', 'F = m ÷ a', 'F = m + a', 'F = a ÷ m'], 0, 'F = m × a (force = masse × accélération).'),
  Q('Un composé organique contient obligatoirement l\'élément...', ['Oxygène', 'Azote', 'Carbone', 'Hydrogène'], 2, 'La chimie organique est basée sur le carbone.'),
  Q('Quelle est l\'unité de l\'énergie dans le Système International ?', ['Le watt', 'Le joule', 'Le newton', 'Le volt'], 1, 'L\'énergie se mesure en joules (J).'),
  Q('La troisième loi de Newton (action-réaction) dit que...', ['Les forces s\'additionnent toujours', 'Toute action entraîne une réaction égale et opposée', 'Les objets lourds tombent plus vite', 'L\'énergie se perd toujours'], 1, 'À toute action correspond une réaction de même intensité, de sens opposé.'),
]);

// ══════════════════════════ BIOLOGIE (SVT, 7e→Terminale) ══════════════════════════

add('La cellule et le vivant', 'Biologie', '7e', [
  Q('Quelle est l\'unité de base du vivant ?', ['L\'organe', 'La cellule', 'Le tissu', 'L\'organisme'], 1, 'La cellule est l\'unité structurale et fonctionnelle de base du vivant.'),
  Q('Qu\'est-ce qui distingue une cellule végétale d\'une cellule animale ?', ['Le noyau', 'La paroi cellulosique', 'La membrane', 'Le cytoplasme'], 1, 'La cellule végétale possède une paroi rigide en cellulose, absente chez l\'animal.'),
  Q('Quel organite produit l\'énergie de la cellule ?', ['Le noyau', 'La mitochondrie', 'Le chloroplaste', 'La vacuole'], 1, 'La mitochondrie est la "centrale énergétique" de la cellule.'),
  Q('Les êtres vivants sont classés en grands groupes appelés...', ['Familles uniquement', 'Règnes', 'Cellules', 'Organes'], 1, 'La classification du vivant utilise notamment les règnes (animal, végétal...).'),
  Q('Quel organite contient l\'information génétique ?', ['La mitochondrie', 'Le noyau', 'La membrane', 'Le cytoplasme'], 1, 'Le noyau contient l\'ADN, support de l\'information génétique.'),
]);

add('Digestion et respiration', 'Biologie', '8e', [
  Q('Où commence la digestion des aliments ?', ['L\'estomac', 'La bouche', 'L\'intestin', 'Le foie'], 1, 'La digestion débute dans la bouche avec la mastication et la salive.'),
  Q('Quel organe absorbe la majorité des nutriments ?', ['L\'estomac', 'Le gros intestin', 'L\'intestin grêle', 'Le foie'], 2, 'L\'intestin grêle est le principal site d\'absorption des nutriments.'),
  Q('Quel gaz est rejeté lors de la respiration ?', ['Oxygène', 'Azote', 'Dioxyde de carbone', 'Hydrogène'], 2, 'La respiration rejette du CO₂ produit par les cellules.'),
  Q('Quel organe permet les échanges gazeux dans le corps ?', ['Le cœur', 'Les poumons', 'Le foie', 'Les reins'], 1, 'Les poumons assurent les échanges d\'O₂ et de CO₂ avec le sang.'),
  Q('Quel organe produit la bile qui aide à digérer les graisses ?', ['Le foie', 'L\'estomac', 'Le pancréas', 'Le rein'], 0, 'Le foie produit la bile, stockée dans la vésicule biliaire.'),
]);

add('Reproduction et système nerveux', 'Biologie', '9e', [
  Q('Où se déroule la fécondation chez l\'être humain ?', ['L\'utérus', 'L\'ovaire', 'La trompe utérine', 'Le vagin'], 2, 'La fécondation a généralement lieu dans la trompe utérine.'),
  Q('Quelle cellule reproductrice est produite par l\'homme ?', ['L\'ovule', 'Le spermatozoïde', 'Le zygote', 'L\'embryon'], 1, 'L\'homme produit les spermatozoïdes.'),
  Q('Quel organe coordonne les informations du système nerveux ?', ['Le cœur', 'Le cerveau', 'Le foie', 'Le poumon'], 1, 'Le cerveau est le centre de commande du système nerveux.'),
  Q('Comment s\'appelle la cellule issue de la fécondation ?', ['Ovule', 'Spermatozoïde', 'Zygote', 'Follicule'], 2, 'La fusion ovule-spermatozoïde donne un zygote.'),
  Q('Quel type de cellule transmet l\'influx nerveux ?', ['Le globule rouge', 'Le neurone', 'La cellule musculaire', 'La cellule osseuse'], 1, 'Le neurone est la cellule spécialisée dans la transmission nerveuse.'),
]);

add('Génétique et écosystèmes', 'Biologie', '10e', [
  Q('Où se trouve l\'information génétique dans la cellule ?', ['Le cytoplasme', 'Les chromosomes du noyau', 'La membrane', 'Les ribosomes'], 1, 'L\'ADN est organisé en chromosomes, situés dans le noyau.'),
  Q('Combien de chromosomes possède une cellule humaine normale ?', ['23', '46', '48', '92'], 1, 'L\'être humain a 46 chromosomes (23 paires).'),
  Q('Qu\'est-ce qu\'un écosystème ?', ['Un seul animal', 'Un ensemble d\'êtres vivants et leur milieu', 'Une seule plante', 'Un laboratoire'], 1, 'Un écosystème regroupe les organismes vivants et leur environnement.'),
  Q('Un caractère héréditaire se transmet par...', ['Les gènes', 'Les muscles', 'La peau', 'Le sang uniquement'], 0, 'Les gènes, portés par l\'ADN, transmettent les caractères héréditaires.'),
  Q('Quel est le rôle des producteurs dans un écosystème ?', ['Manger les autres êtres vivants', 'Produire de la matière organique (ex: photosynthèse)', 'Décomposer les déchets', 'Ne rien faire'], 1, 'Les producteurs (végétaux) fabriquent leur matière organique par photosynthèse.'),
]);

add('Système immunitaire et évolution', 'Biologie', '11e', [
  Q('Quel est le rôle des globules blancs ?', ['Transporter l\'oxygène', 'Défendre l\'organisme contre les infections', 'Transporter les nutriments', 'Coaguler le sang'], 1, 'Les globules blancs (leucocytes) assurent la défense immunitaire.'),
  Q('Qu\'est-ce qu\'un vaccin ?', ['Un antibiotique', 'Une préparation qui stimule l\'immunité contre une maladie', 'Un traitement contre la douleur', 'Un aliment'], 1, 'Le vaccin entraîne le système immunitaire à reconnaître un agent pathogène.'),
  Q('La sélection naturelle favorise les individus...', ['Les plus grands uniquement', 'Les mieux adaptés à leur milieu', 'Les plus nombreux', 'Les plus anciens'], 1, 'Selon Darwin, les individus les mieux adaptés survivent et se reproduisent davantage.'),
  Q('Qu\'est-ce qu\'un anticorps ?', ['Une cellule osseuse', 'Une protéine qui neutralise un agent pathogène', 'Un type de globule rouge', 'Un organe'], 1, 'Les anticorps sont produits par le système immunitaire pour neutraliser les agents infectieux.'),
  Q('Une mutation génétique peut être source de...', ['Aucun changement possible', 'Variabilité génétique', 'Disparition immédiate de l\'espèce', 'Immortalité'], 1, 'Les mutations créent de la diversité génétique, matière première de l\'évolution.'),
]);

add('Génétique approfondie et physiologie', 'Biologie', '12e', [
  Q('L\'ADN est composé de deux brins formant une...', ['Sphère', 'Double hélice', 'Ligne droite', 'Étoile'], 1, 'La structure de l\'ADN est une double hélice (Watson et Crick).'),
  Q('Un allèle est...', ['Une cellule', 'Une version d\'un gène', 'Un chromosome entier', 'Un organe'], 1, 'Un allèle est une des versions possibles d\'un même gène.'),
  Q('Qu\'est-ce que l\'homéostasie ?', ['La reproduction des cellules', 'Le maintien de l\'équilibre interne de l\'organisme', 'La digestion des aliments', 'La croissance osseuse'], 1, 'L\'homéostasie régule les constantes internes (température, glycémie...).'),
  Q('Quel est le rôle de l\'insuline dans l\'organisme ?', ['Augmenter la glycémie', 'Diminuer la glycémie', 'Digérer les graisses', 'Transporter l\'oxygène'], 1, 'L\'insuline permet aux cellules d\'absorber le glucose, abaissant la glycémie.'),
  Q('Un caractère dominant s\'exprime...', ['Seulement si les deux allèles sont dominants', 'Dès qu\'un seul allèle dominant est présent', 'Jamais', 'Uniquement chez les femelles'], 1, 'Un allèle dominant masque l\'allèle récessif dès qu\'il est présent.'),
]);

add('Évolution, écologie et neurobiologie', 'Biologie', 'terminale', [
  Q('Selon la théorie de l\'évolution, les espèces actuelles descendent...', ['D\'ancêtres communs par transformation progressive', 'D\'une création instantanée et fixe', 'Du hasard sans lien entre elles', 'Toutes de la même espèce actuelle'], 0, 'L\'évolution explique la diversité du vivant par une descendance avec modification.'),
  Q('Qu\'est-ce que la biodiversité ?', ['Le nombre d\'humains sur Terre', 'La diversité des êtres vivants et des écosystèmes', 'La météo d\'une région', 'Le climat mondial'], 1, 'La biodiversité englobe la diversité génétique, des espèces et des écosystèmes.'),
  Q('Un synapse est...', ['Une zone de connexion entre deux neurones', 'Un type de muscle', 'Une partie de l\'œil', 'Un vaisseau sanguin'], 0, 'La synapse permet la transmission de l\'influx nerveux entre neurones.'),
  Q('La déforestation a pour conséquence directe...', ['Une augmentation de la biodiversité', 'Une perte d\'habitats et de biodiversité', 'Une baisse du CO₂ atmosphérique', 'Aucun impact'], 1, 'Détruire les forêts détruit les habitats et réduit la biodiversité.'),
  Q('Le neurotransmetteur permet...', ['La digestion des aliments', 'La transmission d\'un signal entre neurones', 'La coagulation du sang', 'La croissance osseuse'], 1, 'Les neurotransmetteurs transmettent l\'information chimique au niveau des synapses.'),
]);

// ══════════════════════════ HISTOIRE (7e→Terminale) ══════════════════════════

add('Préhistoire et civilisations anciennes', 'Histoire', '7e', [
  Q('Comment appelle-t-on la période avant l\'écriture ?', ['L\'Antiquité', 'La Préhistoire', 'Le Moyen Âge', 'L\'époque moderne'], 1, 'La Préhistoire précède l\'invention de l\'écriture.'),
  Q('Sur quel fleuve s\'est développée la civilisation égyptienne antique ?', ['Le Niger', 'Le Nil', 'Le Congo', 'Le Sénégal'], 1, 'L\'Égypte antique s\'est développée le long du Nil.'),
  Q('Quelle invention marque le début de l\'Antiquité ?', ['La roue', 'L\'écriture', 'Le feu', 'L\'agriculture'], 1, 'L\'apparition de l\'écriture marque la fin de la Préhistoire.'),
  Q('Que sont les pyramides d\'Égypte ?', ['Des temples religieux uniquement', 'Des tombeaux royaux', 'Des marchés', 'Des palais habités'], 1, 'Les pyramides étaient les tombeaux des pharaons.'),
  Q('Les premiers hommes vivaient principalement de...', ['L\'agriculture industrielle', 'La chasse et la cueillette', 'Le commerce maritime', 'L\'élevage intensif'], 1, 'Avant l\'agriculture, les hommes chassaient et cueillaient leur nourriture.'),
]);

add('Les grands empires ouest-africains', 'Histoire', '8e', [
  Q('Quel empire ouest-africain était réputé pour son commerce de l\'or et du sel ?', ['L\'empire du Ghana', 'L\'empire romain', 'L\'empire ottoman', 'L\'empire chinois'], 0, 'L\'empire du Ghana (Wagadou) prospérait grâce au commerce transsaharien de l\'or et du sel.'),
  Q('Quel empereur du Mali est célèbre pour son pèlerinage fastueux à La Mecque ?', ['Soundiata Keïta', 'Kankou Moussa', 'Askia Mohamed', 'Samory Touré'], 1, 'Kankou Moussa (Mansa Moussa) est célèbre pour son pèlerinage riche en or.'),
  Q('Quelle ville malienne était un grand centre du savoir islamique ?', ['Conakry', 'Tombouctou', 'Dakar', 'Abidjan'], 1, 'Tombouctou abritait de nombreuses universités et bibliothèques islamiques.'),
  Q('Quel empire a succédé à l\'empire du Mali dans la région ?', ['L\'empire Songhaï', 'L\'empire romain', 'L\'empire perse', 'L\'empire byzantin'], 0, 'L\'empire Songhaï, avec Gao pour capitale, a pris la relève après le Mali.'),
  Q('Le fondateur de l\'empire du Mali, vainqueur de Soumaoro Kanté, est...', ['Kankou Moussa', 'Soundiata Keïta', 'Askia Mohamed', 'Samory Touré'], 1, 'Soundiata Keïta a fondé l\'empire du Mali après sa victoire à Kirina.'),
]);

add('La colonisation de l\'Afrique', 'Histoire', '9e', [
  Q('Quelle conférence de 1884-1885 a organisé le partage colonial de l\'Afrique ?', ['La conférence de Berlin', 'La conférence de Paris', 'La conférence de Londres', 'La conférence de Genève'], 0, 'La conférence de Berlin (1884-1885) a fixé les règles du partage colonial de l\'Afrique.'),
  Q('Quel résistant guinéen s\'est opposé à la conquête coloniale française ?', ['Kankou Moussa', 'Samory Touré', 'Sékou Touré', 'Soundiata Keïta'], 1, 'Samory Touré a mené une longue résistance armée contre la colonisation française.'),
  Q('La colonisation a principalement été motivée par...', ['La recherche de nouvelles ressources et marchés', 'Le partage de la culture uniquement', 'Le hasard', 'La demande des populations colonisées'], 0, 'Les puissances européennes cherchaient ressources, marchés et prestige.'),
  Q('Quel pays européen a colonisé la Guinée ?', ['Le Portugal', 'La France', 'La Grande-Bretagne', 'L\'Espagne'], 1, 'La Guinée a été colonisée par la France (Afrique-Occidentale Française).'),
  Q('Le "code de l\'indigénat" était...', ['Un code commercial', 'Un régime juridique discriminatoire imposé aux colonisés', 'Une loi sur l\'éducation', 'Un traité de paix'], 1, 'Le code de l\'indigénat imposait des règles discriminatoires aux populations colonisées.'),
]);

add('Les indépendances africaines et la Guinée', 'Histoire', '10e', [
  Q('En quelle année la Guinée a-t-elle obtenu son indépendance ?', ['1958', '1960', '1962', '1965'], 0, 'La Guinée a proclamé son indépendance le 2 octobre 1958.'),
  Q('Qui était le premier président de la Guinée indépendante ?', ['Lansana Conté', 'Ahmed Sékou Touré', 'Alpha Condé', 'Samory Touré'], 1, 'Ahmed Sékou Touré a été le premier président de la République de Guinée.'),
  Q('Pourquoi la Guinée est-elle le seul pays à avoir voté "non" au référendum de 1958 de De Gaulle ?', ['Elle voulait rester colonie', 'Elle a choisi l\'indépendance immédiate plutôt que la Communauté française', 'Elle n\'a pas pu voter', 'Elle voulait s\'unir à un autre pays'], 1, 'La Guinée a préféré l\'indépendance immédiate à l\'autonomie proposée dans la Communauté française.'),
  Q('La décennie 1960 a vu la majorité des colonies africaines...', ['Rester colonisées', 'Accéder à l\'indépendance', 'Disparaître', 'Fusionner entre elles'], 1, 'De nombreux pays africains, dont plusieurs anciennes colonies françaises, sont devenus indépendants en 1960.'),
  Q('Quelle est la devise de la Guinée ?', ['Unité, Progrès, Justice', 'Travail, Justice, Solidarité', 'Liberté, Égalité, Fraternité', 'Paix, Travail, Patrie'], 1, 'La devise de la Guinée est "Travail, Justice, Solidarité".'),
]);

add('Guerre froide et décolonisation', 'Histoire', '11e', [
  Q('La Guerre froide oppose principalement deux blocs menés par...', ['La France et l\'Allemagne', 'Les États-Unis et l\'URSS', 'La Chine et le Japon', 'Le Royaume-Uni et l\'Inde'], 1, 'La Guerre froide oppose le bloc occidental (USA) et le bloc communiste (URSS).'),
  Q('Le mouvement des non-alignés cherchait à...', ['Rejoindre l\'un des deux blocs', 'Rester indépendant des deux blocs de la Guerre froide', 'Créer une troisième guerre mondiale', 'Recoloniser l\'Afrique'], 1, 'Les pays non-alignés refusaient de choisir entre les blocs américain et soviétique.'),
  Q('En quelle année le mur de Berlin a-t-il été construit ?', ['1949', '1961', '1975', '1989'], 1, 'Le mur de Berlin a été érigé en 1961.'),
  Q('La décolonisation en Asie et en Afrique s\'est intensifiée surtout...', ['Avant 1900', 'Après la Seconde Guerre mondiale', 'Pendant l\'Antiquité', 'Au Moyen Âge'], 1, 'La vague de décolonisation majeure a eu lieu après 1945.'),
  Q('Quel événement de 1989 marque la fin symbolique de la Guerre froide ?', ['La chute du mur de Berlin', 'La crise de Cuba', 'La guerre du Vietnam', 'La conférence de Berlin'], 0, 'La chute du mur de Berlin en 1989 symbolise la fin de la Guerre froide.'),
]);

add('Histoire contemporaine mondiale', 'Histoire', '12e', [
  Q('En quelle année a débuté la Première Guerre mondiale ?', ['1905', '1914', '1918', '1939'], 1, 'La Première Guerre mondiale a débuté en 1914.'),
  Q('En quelle année s\'est terminée la Seconde Guerre mondiale ?', ['1939', '1943', '1945', '1950'], 2, 'La Seconde Guerre mondiale s\'est terminée en 1945.'),
  Q('Quelle organisation internationale a été créée en 1945 pour maintenir la paix ?', ['L\'Union Africaine', 'L\'ONU', 'L\'OTAN', 'L\'Union Européenne'], 1, 'L\'Organisation des Nations Unies (ONU) a été fondée en 1945.'),
  Q('Le génocide juif pendant la Seconde Guerre mondiale est appelé...', ['La Shoah', 'La Terreur', 'La Commune', 'La Restauration'], 0, 'La Shoah désigne l\'extermination des Juifs par les nazis.'),
  Q('Quelle crise de 1929 a eu des répercussions économiques mondiales ?', ['La crise du pétrole', 'Le krach boursier de Wall Street', 'La crise des missiles', 'La crise asiatique'], 1, 'Le krach de 1929 a déclenché une grande dépression économique mondiale.'),
]);

add('Le monde contemporain et les relations internationales', 'Histoire', 'terminale', [
  Q('Que désigne la "mondialisation" ?', ['L\'isolement des pays', 'L\'intensification des échanges à l\'échelle mondiale', 'La fin du commerce international', 'Une guerre mondiale'], 1, 'La mondialisation est l\'intensification des échanges économiques, culturels et humains entre pays.'),
  Q('L\'Union Africaine a succédé en 2002 à...', ['La Société des Nations', 'L\'Organisation de l\'Unité Africaine (OUA)', 'L\'ONU', 'La CEDEAO'], 1, 'L\'Union Africaine remplace l\'OUA fondée en 1963.'),
  Q('Quel évènement du 11 septembre 2001 a marqué les relations internationales ?', ['La chute du mur de Berlin', 'Les attentats de New York', 'La crise de Cuba', 'La guerre du Golfe'], 1, 'Les attentats du 11 septembre 2001 ont profondément marqué la géopolitique mondiale.'),
  Q('Le multilatéralisme désigne...', ['La coopération entre plusieurs États via des institutions communes', 'La domination d\'un seul État', 'L\'isolement des nations', 'Un conflit entre deux pays'], 0, 'Le multilatéralisme repose sur la coopération entre plusieurs acteurs internationaux.'),
  Q('La CEDEAO est une organisation regroupant des pays de...', ['L\'Afrique de l\'Ouest', 'L\'Europe', 'L\'Asie', 'L\'Amérique du Sud'], 0, 'La CEDEAO (Communauté Économique des États de l\'Afrique de l\'Ouest) regroupe des pays ouest-africains, dont la Guinée.'),
]);

// ══════════════════════════ GÉOGRAPHIE (7e→Terminale) ══════════════════════════

add('Notions de base et continents', 'Géographie', '7e', [
  Q('Combien y a-t-il de continents dans le monde ?', ['4', '5', '6', '7'], 2, 'On distingue généralement 6 continents (Afrique, Amérique, Antarctique, Asie, Europe, Océanie).'),
  Q('Sur quel continent se trouve la Guinée ?', ['L\'Asie', 'L\'Afrique', 'L\'Europe', 'L\'Amérique'], 1, 'La Guinée se situe en Afrique de l\'Ouest.'),
  Q('Que représente une carte à petite échelle ?', ['Un très grand territoire avec peu de détails', 'Une petite zone très détaillée', 'Uniquement une ville', 'Un plan de maison'], 0, 'Une petite échelle montre un vaste territoire avec moins de détails.'),
  Q('Quel océan borde la côte guinéenne ?', ['L\'océan Indien', 'L\'océan Atlantique', 'L\'océan Pacifique', 'La mer Méditerranée'], 1, 'La Guinée est bordée par l\'océan Atlantique.'),
  Q('Qu\'indique la légende d\'une carte ?', ['Le titre de la carte', 'La signification des symboles utilisés', 'L\'échelle uniquement', 'Le nom de l\'auteur'], 1, 'La légende explique les symboles et couleurs représentés sur la carte.'),
]);

add('Géographie de la Guinée', 'Géographie', '8e', [
  Q('Combien de régions naturelles compte la Guinée ?', ['2', '3', '4', '5'], 2, 'La Guinée compte 4 régions naturelles : Basse-Guinée, Moyenne-Guinée, Haute-Guinée, Guinée forestière.'),
  Q('Quelle région guinéenne est aussi appelée le "Fouta Djalon" ?', ['La Basse-Guinée', 'La Moyenne-Guinée', 'La Haute-Guinée', 'La Guinée forestière'], 1, 'Le Fouta Djalon correspond à la Moyenne-Guinée, un massif montagneux.'),
  Q('Quelle est la capitale de la Guinée ?', ['Kankan', 'Labé', 'Conakry', 'Nzérékoré'], 2, 'Conakry est la capitale de la Guinée, située en Basse-Guinée.'),
  Q('Le fleuve Niger prend sa source en Guinée, dans quelle région ?', ['La Basse-Guinée', 'La Guinée forestière', 'La Haute-Guinée', 'Le Fouta Djalon'], 3, 'Le fleuve Niger prend sa source dans le massif du Fouta Djalon (Moyenne-Guinée).'),
  Q('Pourquoi la Guinée est-elle surnommée le "château d\'eau de l\'Afrique de l\'Ouest" ?', ['Elle a beaucoup de plages', 'Plusieurs grands fleuves d\'Afrique de l\'Ouest y prennent leur source', 'Elle produit de l\'eau minérale', 'Elle est très pluvieuse uniquement'], 1, 'Plusieurs grands fleuves (Niger, Sénégal, Gambie) prennent leur source en Guinée.'),
]);

add('Climat et végétation en Afrique', 'Géographie', '9e', [
  Q('Quel type de climat domine en Guinée forestière ?', ['Désertique', 'Équatorial/tropical humide', 'Méditerranéen', 'Polaire'], 1, 'La Guinée forestière a un climat tropical humide favorable à la forêt dense.'),
  Q('Qu\'est-ce que la saison sèche en Afrique de l\'Ouest ?', ['Une période sans aucune activité', 'Une période avec peu ou pas de précipitations', 'Une période de froid intense', 'Une saison de neige'], 1, 'La saison sèche se caractérise par l\'absence quasi totale de pluies.'),
  Q('Quel type de végétation domine dans le Sahel ?', ['La forêt dense', 'La savane et steppe semi-aride', 'La toundra', 'La forêt de conifères'], 1, 'Le Sahel est une zone de transition avec savane et végétation semi-aride.'),
  Q('Le désert du Sahara se situe...', ['Au sud de l\'Afrique', 'Au nord de l\'Afrique', 'À l\'est de l\'Asie', 'En Amérique du Sud'], 1, 'Le Sahara couvre une grande partie du nord de l\'Afrique.'),
  Q('Quel facteur influence fortement le climat de la Basse-Guinée ?', ['La proximité de l\'océan Atlantique', 'L\'altitude élevée', 'Le désert voisin', 'Les glaciers'], 0, 'La Basse-Guinée, côtière, a un climat influencé par l\'océan Atlantique.'),
]);

add('Population et urbanisation', 'Géographie', '10e', [
  Q('Qu\'est-ce que l\'urbanisation ?', ['La diminution des villes', 'L\'augmentation de la population vivant en ville', 'La construction de routes uniquement', 'La migration vers les campagnes'], 1, 'L\'urbanisation désigne la croissance de la population et des villes.'),
  Q('Quelle est la plus grande ville de Guinée ?', ['Kankan', 'Labé', 'Conakry', 'Kindia'], 2, 'Conakry est la ville la plus peuplée de Guinée.'),
  Q('L\'exode rural désigne...', ['Le départ des habitants des villes vers les campagnes', 'Le départ des habitants des campagnes vers les villes', 'L\'émigration internationale uniquement', 'Le tourisme rural'], 1, 'L\'exode rural est la migration des populations rurales vers les villes.'),
  Q('Quel est un défi majeur des grandes villes en forte croissance ?', ['Le manque d\'habitants', 'La gestion des infrastructures (logement, transport, eau)', 'L\'absence totale de commerce', 'Le manque de terres agricoles en ville'], 1, 'La croissance urbaine rapide pose des défis d\'infrastructures et de services.'),
  Q('La densité de population se calcule par...', ['Nombre d\'habitants × surface', 'Nombre d\'habitants ÷ surface', 'Surface ÷ nombre d\'habitants', 'Nombre de villes ÷ population'], 1, 'La densité = population / superficie du territoire.'),
]);

add('Économie et ressources naturelles', 'Géographie', '11e', [
  Q('Quelle ressource minière est particulièrement abondante en Guinée ?', ['Le pétrole', 'La bauxite', 'Le charbon', 'Le fer uniquement'], 1, 'La Guinée possède d\'importantes réserves mondiales de bauxite (minerai d\'aluminium).'),
  Q('Qu\'est-ce qu\'une matière première ?', ['Un produit fini vendu en magasin', 'Une ressource brute non transformée', 'Un service', 'Une monnaie'], 1, 'Une matière première est une ressource brute avant transformation industrielle.'),
  Q('Le secteur primaire de l\'économie regroupe notamment...', ['L\'industrie et le BTP', 'L\'agriculture, la pêche et les mines', 'Les banques et assurances', 'Le commerce de détail'], 1, 'Le secteur primaire concerne l\'exploitation directe des ressources naturelles.'),
  Q('Qu\'appelle-t-on un pays exportateur de matières premières ?', ['Un pays qui vend surtout des ressources brutes', 'Un pays qui n\'exporte rien', 'Un pays uniquement importateur', 'Un pays sans ressources'], 0, 'Ces pays vendent principalement des ressources non transformées à l\'étranger.'),
  Q('Pourquoi la transformation locale des matières premières est-elle importante pour un pays ?', ['Elle n\'apporte aucun avantage', 'Elle crée plus de valeur ajoutée et d\'emplois locaux', 'Elle réduit toujours la qualité', 'Elle empêche l\'exportation'], 1, 'Transformer sur place augmente la valeur ajoutée et crée des emplois.'),
]);

add('Mondialisation et échanges internationaux', 'Géographie', '12e', [
  Q('Qu\'est-ce qu\'une multinationale ?', ['Une entreprise présente dans plusieurs pays', 'Une organisation internationale politique', 'Un pays regroupant plusieurs nations', 'Une ONG uniquement'], 0, 'Une multinationale exerce ses activités dans plusieurs pays.'),
  Q('Que désigne la "balance commerciale" d\'un pays ?', ['Le nombre d\'habitants', 'La différence entre exportations et importations', 'Le taux de chômage', 'La superficie du pays'], 1, 'La balance commerciale compare la valeur des exportations et des importations.'),
  Q('Un pays a un excédent commercial quand...', ['Il importe plus qu\'il n\'exporte', 'Il exporte plus qu\'il n\'importe', 'Il n\'échange rien', 'Sa monnaie perd toute valeur'], 1, 'L\'excédent commercial survient quand les exportations dépassent les importations.'),
  Q('Les flux migratoires internationaux sont souvent liés à...', ['La recherche de meilleures conditions de vie', 'Le hasard uniquement', 'L\'absence de raison', 'La météo locale seulement'], 0, 'Les migrations sont souvent motivées par des raisons économiques, sociales ou politiques.'),
  Q('Qu\'est-ce qu\'un port en eau profonde comme celui de Conakry facilite ?', ['Uniquement la pêche artisanale', 'Le commerce maritime international', 'L\'agriculture locale', 'Le tourisme de montagne'], 1, 'Un port en eau profonde permet l\'accueil de grands navires pour le commerce international.'),
]);

add('Enjeux environnementaux et développement durable', 'Géographie', 'terminale', [
  Q('Que signifie le "développement durable" ?', ['Une croissance sans limite', 'Répondre aux besoins actuels sans compromettre ceux des générations futures', 'L\'arrêt total du développement', 'Le développement d\'un seul pays'], 1, 'Le développement durable équilibre besoins présents et préservation pour l\'avenir.'),
  Q('Quelle est une conséquence majeure du changement climatique en Afrique de l\'Ouest ?', ['L\'augmentation des glaciers', 'La désertification et l\'irrégularité des pluies', 'La baisse de la température moyenne', 'Aucun impact observé'], 1, 'Le changement climatique accentue la désertification et perturbe les régimes de pluie.'),
  Q('Qu\'est-ce que l\'érosion côtière ?', ['La formation de nouvelles côtes', 'Le recul du littoral sous l\'effet de la mer', 'La construction de ports', 'La pêche intensive'], 1, 'L\'érosion côtière désigne le recul progressif du trait de côte.'),
  Q('Les énergies renouvelables comprennent notamment...', ['Le charbon et le pétrole', 'Le solaire, l\'éolien et l\'hydraulique', 'Le gaz naturel uniquement', 'Le nucléaire uniquement'], 1, 'Solaire, éolien, hydraulique sont des sources d\'énergie renouvelables.'),
  Q('Pourquoi la déforestation en Guinée forestière est-elle préoccupante ?', ['Elle n\'a aucun impact', 'Elle menace la biodiversité et les sols', 'Elle augmente la pluie', 'Elle refroidit le climat local'], 1, 'La déforestation entraîne perte de biodiversité, érosion des sols et dérèglement climatique local.'),
]);

module.exports = quizzes;
console.log(`Total: ${quizzes.length} quiz préparés (${quizzes.reduce((s, q) => s + q.questions.length, 0)} questions).`);
