// Contenu quiz pour le vrai programme du primaire guinéen (fourni par
// l'utilisateur) : Lecture, Langage, Écriture, Calcul, Dessin, Récitation,
// Chant — remplace l'ancien découpage (Calcul & Problèmes, Français,
// Biologie, Histoire, Géographie) qui ne correspondait pas au programme
// officiel de ce cycle. Un quiz de 5 questions par matière et par classe
// (CP1 à CM2). Contenu réel écrit pour l'occasion (pas de test).
//
// Le contenu de "Calcul" reprend celui déjà validé pour l'ancienne matière
// "Calcul & Problèmes" (même progression numérique, seul le nom change).
const Q = (question, choix, reponseCorrecte, explication) => ({ question, choix, reponseCorrecte, explication });

const quizzes = [];
const add = (titre, matiere, niveau, questions) => quizzes.push({ titre, matiere, niveau, questions });

// ══════════════════════════ CALCUL ══════════════════════════

add('Compter et additionner', 'Calcul', 'cp1', [
  Q('Combien font 2 + 3 ?', ['4', '5', '6', '7'], 1, '2 + 3 = 5.'),
  Q('Quel nombre vient juste après 9 ?', ['8', '10', '11', '7'], 1, 'Après 9 vient 10.'),
  Q('Combien font 4 + 4 ?', ['6', '7', '8', '9'], 2, '4 + 4 = 8.'),
  Q('Parmi ces nombres, lequel est le plus grand ?', ['3', '7', '5', '1'], 1, '7 est le plus grand.'),
  Q('Combien font 10 - 3 ?', ['6', '7', '8', '5'], 1, '10 - 3 = 7.'),
]);

add('Additions et soustractions', 'Calcul', 'cp2', [
  Q('Combien font 12 + 5 ?', ['15', '16', '17', '18'], 2, '12 + 5 = 17.'),
  Q('Combien font 18 - 6 ?', ['10', '11', '12', '13'], 2, '18 - 6 = 12.'),
  Q('Quel est le double de 7 ?', ['12', '13', '14', '15'], 2, 'Le double de 7 est 14.'),
  Q('Combien font 9 + 9 ?', ['16', '17', '18', '19'], 2, '9 + 9 = 18.'),
  Q('Combien font 20 - 8 ?', ['10', '11', '12', '13'], 2, '20 - 8 = 12.'),
]);

add('Additions, soustractions et tables', 'Calcul', 'ce1', [
  Q('Combien font 25 + 17 ?', ['40', '41', '42', '43'], 2, '25 + 17 = 42.'),
  Q('Combien font 5 × 2 ?', ['8', '10', '12', '9'], 1, '5 × 2 = 10.'),
  Q('Combien font 3 × 5 ?', ['12', '15', '18', '10'], 1, '3 × 5 = 15.'),
  Q('Combien font 40 - 15 ?', ['23', '24', '25', '26'], 2, '40 - 15 = 25.'),
  Q('Combien font 10 × 4 ?', ['30', '40', '400', '14'], 1, '10 × 4 = 40.'),
]);

add('Multiplication, division et mesures', 'Calcul', 'ce2', [
  Q('Combien font 7 × 6 ?', ['36', '42', '48', '40'], 1, '7 × 6 = 42.'),
  Q('Combien font 56 ÷ 8 ?', ['6', '7', '8', '9'], 1, '56 ÷ 8 = 7.'),
  Q('Combien de centimètres dans un mètre ?', ['10', '100', '1000', '50'], 1, '1 mètre = 100 centimètres.'),
  Q('Combien font 9 × 9 ?', ['72', '81', '90', '99'], 1, '9 × 9 = 81.'),
  Q('Combien font 100 - 37 ?', ['53', '63', '73', '67'], 1, '100 - 37 = 63.'),
]);

add('Fractions et périmètres', 'Calcul', 'cm1', [
  Q('Que représente 1/2 d\'un gâteau ?', ['Le quart', 'La moitié', 'Le tiers', 'Le tout'], 1, '1/2 signifie une part sur deux, soit la moitié.'),
  Q('Quel est le périmètre d\'un rectangle de 5 cm sur 3 cm ?', ['8 cm', '15 cm', '16 cm', '18 cm'], 2, 'Périmètre = 2×(5+3) = 16 cm.'),
  Q('Combien font 3/4 + 1/4 ?', ['1/2', '1', '4/8', '2/4'], 1, '3/4 + 1/4 = 4/4 = 1.'),
  Q('Combien font 6 × 12 ?', ['62', '72', '68', '82'], 1, '6 × 12 = 72.'),
  Q('Quelle est l\'aire d\'un carré de côté 4 cm ?', ['8 cm²', '12 cm²', '16 cm²', '20 cm²'], 2, 'Aire = 4 × 4 = 16 cm².'),
]);

add('Fractions, décimaux et pourcentages', 'Calcul', 'cm2', [
  Q('Combien font 1/2 + 1/4 ?', ['2/6', '3/4', '2/4', '1/6'], 1, '1/2 = 2/4, donc 2/4 + 1/4 = 3/4.'),
  Q('Combien font 3,5 + 2,7 ?', ['5,2', '6,0', '6,2', '5,7'], 2, '3,5 + 2,7 = 6,2.'),
  Q('50% d\'une quantité représente...', ['Le quart', 'La moitié', 'Le tiers', 'Le tout'], 1, '50% = 1/2, soit la moitié.'),
  Q('Combien font 12 × 15 ?', ['160', '170', '180', '190'], 2, '12 × 15 = 180.'),
  Q('Quelle est l\'aire d\'un rectangle de 8 m sur 5 m ?', ['13 m²', '26 m²', '40 m²', '45 m²'], 2, 'Aire = 8 × 5 = 40 m².'),
]);

// ══════════════════════════ LECTURE ══════════════════════════

add('Reconnaissance des lettres et des sons', 'Lecture', 'cp1', [
  Q('Quelle lettre commence le mot "arbre" ?', ['A', 'B', 'R', 'E'], 0, 'Le mot "arbre" commence par la lettre A.'),
  Q('Combien de syllabes dans le mot "banane" ?', ['1', '2', '3', '4'], 2, '"ba-na-ne" : 3 syllabes.'),
  Q('Quelle est la voyelle dans le mot "sac" ?', ['S', 'A', 'C', 'Aucune'], 1, 'La voyelle du mot "sac" est le A.'),
  Q('Quel son fait la lettre "M" ?', ['Meu', 'Feu', 'Reu', 'Leu'], 0, 'La lettre M fait le son "meu".'),
  Q('Quel mot commence par le son "ch" ?', ['Chat', 'Papa', 'Table', 'Robe'], 0, '"Chat" commence par le son "ch".'),
]);

add('Lecture de syllabes et de mots simples', 'Lecture', 'cp2', [
  Q('Quel mot rime avec "chapeau" ?', ['Bateau', 'Table', 'Fleur', 'Porte'], 0, '"Chapeau" et "bateau" se terminent par le même son.'),
  Q('Combien de mots dans la phrase "Le chat dort" ?', ['2', '3', '4', '5'], 1, '"Le / chat / dort" : 3 mots.'),
  Q('Quel mot désigne un fruit ?', ['Table', 'Mangue', 'Chaise', 'Cahier'], 1, '"Mangue" est un fruit.'),
  Q('Quelle phrase est correctement écrite ?', ['le chien court.', 'Le chien court.', 'Le Chien court', 'le Chien Court.'], 1, 'Une phrase commence par une majuscule et se termine par un point.'),
  Q('Quelle syllabe manque pour former "tomate" : "to___te" ?', ['ma', 'ba', 'pa', 'sa'], 0, '"to-ma-te" : la syllabe manquante est "ma".'),
]);

add('Lecture de phrases et compréhension', 'Lecture', 'ce1', [
  Q('Lis : "Fatoumata va au marché avec sa maman." Où va Fatoumata ?', ['À l\'école', 'Au marché', 'À la maison', 'Au fleuve'], 1, 'Le texte dit que Fatoumata va au marché.'),
  Q('Lis : "Le soleil brille et les oiseaux chantent." Que font les oiseaux ?', ['Ils dorment', 'Ils chantent', 'Ils mangent', 'Ils volent au loin'], 1, 'Le texte dit que les oiseaux chantent.'),
  Q('Quel mot veut dire la même chose que "content" ?', ['Triste', 'Joyeux', 'Fatigué', 'Malade'], 1, '"Joyeux" a le même sens que "content".'),
  Q('Dans la phrase "Moussa lit un livre", que fait Moussa ?', ['Il écrit', 'Il lit', 'Il dessine', 'Il chante'], 1, 'La phrase dit que Moussa lit.'),
  Q('Quel signe de ponctuation termine une question ?', ['.', '!', '?', ','], 2, 'Une question se termine par un point d\'interrogation.'),
]);

add('Lecture de petits textes', 'Lecture', 'ce2', [
  Q('Lis : "Aïssatou range sa chambre puis fait ses devoirs." Que fait-elle en premier ?', ['Ses devoirs', 'Elle range sa chambre', 'Elle dort', 'Elle joue'], 1, 'Le texte dit qu\'elle range sa chambre en premier.'),
  Q('Lis : "Il pleut, alors les enfants restent à la maison." Pourquoi restent-ils à la maison ?', ['Ils sont malades', 'Il pleut', 'C\'est un jour férié', 'Ils sont fatigués'], 1, 'La cause donnée est la pluie.'),
  Q('Quel est le contraire de "commencer un texte" ?', ['L\'introduire', 'Le terminer', 'Le lire', 'Le copier'], 1, '"Terminer" est le contraire de "commencer".'),
  Q('Dans un texte, le titre sert à...', ['Décorer la page', 'Annoncer le sujet du texte', 'Remplacer la conclusion', 'Compter les mots'], 1, 'Le titre annonce de quoi parle le texte.'),
  Q('Lis : "Le chasseur suit les traces de l\'animal dans la forêt." Où se trouve le chasseur ?', ['Au village', 'Dans la forêt', 'Au fleuve', 'À l\'école'], 1, 'Le texte situe l\'action dans la forêt.'),
]);

add('Compréhension de texte et vocabulaire', 'Lecture', 'cm1', [
  Q('Lis : "Malgré la fatigue, Sékou continua sa route jusqu\'au village." Que signifie "malgré" ici ?', ['À cause de', 'Bien que ce soit difficile', 'Après', 'Avant'], 1, '"Malgré" introduit une difficulté surmontée.'),
  Q('Quel est un synonyme de "rapide" ?', ['Lent', 'Vif', 'Fatigué', 'Calme'], 1, '"Vif" a un sens proche de "rapide".'),
  Q('Dans un texte, un paragraphe sert à...', ['Regrouper des idées liées', 'Décorer la page', 'Remplacer un titre', 'Compter les lignes'], 0, 'Un paragraphe regroupe des phrases sur une même idée.'),
  Q('Lis : "La rivière déborda après plusieurs jours de pluie." Quelle est la cause du débordement ?', ['La sécheresse', 'Les pluies répétées', 'Le vent', 'Un barrage'], 1, 'Le texte indique que les pluies ont causé le débordement.'),
  Q('Que signifie "résumer un texte" ?', ['Le recopier entièrement', 'En dire l\'essentiel en peu de mots', 'L\'agrandir', 'Le traduire'], 1, 'Résumer, c\'est donner l\'essentiel en peu de mots.'),
]);

add('Lecture expressive et résumé de texte', 'Lecture', 'cm2', [
  Q('Lire "expressivement" un texte, c\'est...', ['Le lire très vite', 'Le lire en respectant le ton et la ponctuation', 'Le lire sans le comprendre', 'Le lire les yeux fermés'], 1, 'La lecture expressive respecte le ton, les pauses et la ponctuation.'),
  Q('Quel est le rôle d\'une conclusion dans un texte ?', ['Présenter le sujet', 'Développer les idées', 'Clore et résumer l\'essentiel', 'Donner le titre'], 2, 'La conclusion clôt le texte en résumant l\'essentiel.'),
  Q('Lis : "Bien qu\'il fût pauvre, il partageait toujours son repas." Quel trait de caractère est montré ?', ['L\'avarice', 'La générosité', 'La colère', 'La paresse'], 1, 'Partager son repas malgré la pauvreté montre la générosité.'),
  Q('Quel est l\'antonyme de "généreux" ?', ['Avare', 'Gentil', 'Aimable', 'Poli'], 0, '"Avare" est le contraire de "généreux".'),
  Q('Que doit-on faire avant de résumer un texte ?', ['L\'apprendre par cœur', 'Bien le lire et le comprendre', 'Le recopier', 'Deviner son contenu'], 1, 'Il faut d\'abord bien lire et comprendre le texte pour le résumer correctement.'),
]);

// ══════════════════════════ LANGAGE ══════════════════════════

add('Le vocabulaire de la maison et de l\'école', 'Langage', 'cp1', [
  Q('Comment s\'appelle l\'endroit où l\'on dort ?', ['La cuisine', 'La chambre', 'La cour', 'Le marché'], 1, 'On dort dans la chambre.'),
  Q('Quel objet sert à écrire ?', ['Un crayon', 'Une assiette', 'Un ballon', 'Un seau'], 0, 'Le crayon sert à écrire.'),
  Q('Comment salue-t-on quelqu\'un le matin ?', ['Bonsoir', 'Bonne nuit', 'Bonjour', 'Au revoir'], 2, 'On dit "bonjour" le matin.'),
  Q('Quel est le nom de la personne qui enseigne en classe ?', ['Le médecin', 'Le maître ou la maîtresse', 'Le chauffeur', 'Le vendeur'], 1, 'C\'est le maître ou la maîtresse qui enseigne.'),
  Q('Où va-t-on pour apprendre à lire et à écrire ?', ['Au marché', 'À l\'école', 'Au fleuve', 'Au champ'], 1, 'On va à l\'école pour apprendre.'),
]);

add('Les salutations et la politesse', 'Langage', 'cp2', [
  Q('Que dit-on après avoir reçu un cadeau ?', ['Pardon', 'Merci', 'Bonjour', 'Au revoir'], 1, 'On dit "merci" pour remercier.'),
  Q('Que dit-on pour demander poliment quelque chose ?', ['Donne-moi ça !', 'S\'il te plaît', 'Tais-toi', 'Va-t\'en'], 1, '"S\'il te plaît" est une formule de politesse.'),
  Q('Que dit-on quand on gêne quelqu\'un par erreur ?', ['Merci', 'Pardon', 'Bravo', 'Salut'], 1, 'On dit "pardon" pour s\'excuser.'),
  Q('Comment dit-on au revoir à un ami ?', ['Bonjour', 'Merci', 'Au revoir', 'Pardon'], 2, '"Au revoir" se dit en partant.'),
  Q('Quel mot utilise-t-on pour féliciter quelqu\'un ?', ['Bravo', 'Pardon', 'Silence', 'Attention'], 0, '"Bravo" sert à féliciter.'),
]);

add('Le vocabulaire des animaux et de la nature', 'Langage', 'ce1', [
  Q('Quel animal donne du lait que l\'on boit ?', ['La poule', 'La vache', 'Le chat', 'Le serpent'], 1, 'La vache donne du lait.'),
  Q('Comment s\'appelle le petit du chien ?', ['Le chiot', 'Le poussin', 'Le veau', 'L\'agneau'], 0, 'Le petit du chien s\'appelle le chiot.'),
  Q('Quel est le nom de l\'endroit couvert d\'arbres ?', ['Le désert', 'La forêt', 'La mer', 'La ville'], 1, 'Un endroit couvert d\'arbres est une forêt.'),
  Q('Quel animal vit dans l\'eau ?', ['Le poisson', 'La chèvre', 'Le mouton', 'L\'âne'], 0, 'Le poisson vit dans l\'eau.'),
  Q('Comment appelle-t-on le cri du chien ?', ['Il miaule', 'Il aboie', 'Il chante', 'Il siffle'], 1, 'Le chien aboie.'),
]);

add('Construire une phrase correcte', 'Langage', 'ce2', [
  Q('Quelle phrase est bien construite ?', ['Manger je pomme une', 'Je mange une pomme', 'Une je mange pomme', 'Pomme mange je une'], 1, 'Sujet + verbe + complément : "Je mange une pomme".'),
  Q('Dans une phrase, qui fait l\'action ?', ['Le complément', 'Le sujet', 'L\'adjectif', 'La ponctuation'], 1, 'Le sujet est celui qui fait l\'action.'),
  Q('Complète : "Les élèves ___ leurs cahiers."', ['range', 'rangent', 'ranges', 'ranger'], 1, 'Sujet pluriel "les élèves" → verbe au pluriel "rangent".'),
  Q('Quel mot manque : "Le chien ___ son os." ?', ['mangent', 'mange', 'manger', 'mangeons'], 1, 'Sujet singulier "le chien" → "mange".'),
  Q('Quelle phrase pose une question ?', ['Il fait beau.', 'Quelle heure est-il ?', 'Range ta chambre.', 'Quelle chaleur !'], 1, 'Elle se termine par un point d\'interrogation.'),
]);

add('Enrichir son vocabulaire', 'Langage', 'cm1', [
  Q('Quel est un synonyme de "beau" ?', ['Laid', 'Joli', 'Sale', 'Triste'], 1, '"Joli" a un sens proche de "beau".'),
  Q('Quel est le contraire de "rapide" ?', ['Lent', 'Fort', 'Grand', 'Léger'], 0, '"Lent" est le contraire de "rapide".'),
  Q('Quel mot regroupe "pomme, mangue, banane" ?', ['Des légumes', 'Des fruits', 'Des animaux', 'Des outils'], 1, 'Ce sont tous des fruits.'),
  Q('Quel est le contraire de "propre" ?', ['Sale', 'Beau', 'Neuf', 'Clair'], 0, '"Sale" est le contraire de "propre".'),
  Q('Quel mot signifie la même chose que "courageux" ?', ['Peureux', 'Brave', 'Faible', 'Timide'], 1, '"Brave" a le même sens que "courageux".'),
]);

add('S\'exprimer et argumenter à l\'oral', 'Langage', 'cm2', [
  Q('Pour convaincre quelqu\'un à l\'oral, il faut...', ['Parler très vite sans respirer', 'Donner des arguments clairs', 'Se taire', 'Répéter le même mot'], 1, 'Un bon exposé donne des arguments clairs.'),
  Q('Quel mot introduit une explication ?', ['Parce que', 'Ensuite', 'Enfin', 'Bonjour'], 0, '"Parce que" introduit une cause ou une explication.'),
  Q('Pendant un exposé, il est important de...', ['Parler bas et vite', 'Regarder ses pieds', 'Parler clairement et regarder son public', 'Lire sans s\'arrêter'], 2, 'Un bon orateur parle clairement en regardant son public.'),
  Q('Quel mot sert à donner son avis ?', ['Je pense que', 'Il était', 'Demain', 'Chez moi'], 0, '"Je pense que" introduit une opinion.'),
  Q('Quel mot permet d\'ajouter une idée à l\'oral ?', ['Mais', 'De plus', 'Non', 'Jamais'], 1, '"De plus" ajoute une idée supplémentaire.'),
]);

// ══════════════════════════ ÉCRITURE ══════════════════════════

add('Les lettres majuscules et minuscules', 'Écriture', 'cp1', [
  Q('Quelle est la majuscule du "a" ?', ['A', 'B', 'O', 'E'], 0, 'La majuscule de "a" est "A".'),
  Q('Quand utilise-t-on une lettre majuscule ?', ['Au milieu d\'un mot', 'Au début d\'une phrase', 'À la fin d\'un mot', 'Jamais'], 1, 'Une phrase commence toujours par une majuscule.'),
  Q('Quel prénom est bien écrit ?', ['mariam', 'Mariam', 'MariAm', 'mariaM'], 1, 'Un prénom commence par une majuscule : "Mariam".'),
  Q('Quelle lettre vient après "M" dans l\'alphabet ?', ['L', 'N', 'O', 'K'], 1, 'Après M vient N.'),
  Q('Combien de lettres a le mot "chat" ?', ['3', '4', '5', '6'], 1, 'C-H-A-T : 4 lettres.'),
]);

add('Copier et écrire des mots simples', 'Écriture', 'cp2', [
  Q('Comment écrit-on correctement le mot désignant sa "maman" ?', ['mama', 'maman', 'mamman', 'mamant'], 1, 'On écrit "maman".'),
  Q('Quel mot est mal écrit ?', ['école', 'ecole', 'étoile', 'table'], 1, '"École" prend un accent : "ecole" est mal écrit.'),
  Q('Où doit-on écrire quand on utilise un cahier ligné ?', ['Entre les lignes', 'En dehors du cahier', 'Sur la couverture', 'N\'importe où'], 0, 'On écrit entre les lignes pour rester bien aligné.'),
  Q('Quel signe met-on à la fin d\'une phrase simple ?', ['Une virgule', 'Un point', 'Un tiret', 'Rien'], 1, 'On termine une phrase par un point.'),
  Q('Quel mot commence par une majuscule dans "le chat de Fatou" ?', ['le', 'chat', 'de', 'Fatou'], 3, '"Fatou" est un prénom, donc il prend une majuscule.'),
]);

add('La ponctuation de base', 'Écriture', 'ce1', [
  Q('Quel signe utilise-t-on à la fin d\'une phrase qui exprime la surprise ?', ['.', '?', '!', ','], 2, 'Le point d\'exclamation exprime la surprise ou l\'émotion.'),
  Q('Quel signe sépare les éléments d\'une liste ?', ['Le point', 'La virgule', 'Le point d\'exclamation', 'Les deux points'], 1, 'La virgule sépare les éléments d\'une énumération.'),
  Q('Quel signe utilise-t-on pour poser une question ?', ['!', '?', '.', ';'], 1, 'Le point d\'interrogation termine une question.'),
  Q('Quel signe termine une phrase déclarative ordinaire ?', ['?', '!', '.', ','], 2, 'Une phrase déclarative se termine par un point.'),
  Q('Dans un dialogue, quel signe annonce que quelqu\'un parle ?', ['Le point', 'Le tiret', 'La virgule', 'Le point-virgule'], 1, 'Le tiret annonce une réplique dans un dialogue.'),
]);

add('L\'orthographe des mots courants', 'Écriture', 'ce2', [
  Q('Comment écrit-on correctement : "il ___ content" ?', ['ait', 'es', 'est', 'ai'], 2, '"Il est content" (verbe être).'),
  Q('Quelle est l\'orthographe correcte du mot pour "beaucoup de temps" ?', ['tan', 'temp', 'temps', 'tant'], 2, 'On écrit "temps" avec un "s" final muet.'),
  Q('Quel mot est correctement écrit ?', ['fôret', 'forêt', 'forais', 'forret'], 1, '"Forêt" prend un accent circonflexe.'),
  Q('Comment écrit-on le pluriel de "un cheval" ?', ['des chevals', 'des chevaux', 'des chevales', 'des chevaus'], 1, 'Le pluriel de "cheval" est "chevaux".'),
  Q('Quelle est l\'orthographe correcte de "ils ___ à l\'école" ?', ['von', 'vont', 'vons', 'vonts'], 1, '"Ils vont à l\'école" (verbe aller).'),
]);

add('Rédiger une phrase correcte', 'Écriture', 'cm1', [
  Q('Quelle phrase respecte l\'accord sujet-verbe ?', ['Les enfants joue dehors.', 'Les enfants jouent dehors.', 'Les enfant jouent dehors.', 'Le enfants jouent dehors.'], 1, 'Sujet pluriel "les enfants" → verbe "jouent".'),
  Q('Quel est l\'accord correct : "une ___ maison" ?', ['grand', 'grande', 'grands', 'grandes'], 1, '"Maison" est féminin singulier → "grande".'),
  Q('Quelle phrase est bien ponctuée ?', ['Comment vas tu.', 'Comment vas-tu ?', 'comment vas tu ?', 'Comment, vas-tu'], 1, 'Une question s\'écrit avec un tiret et un point d\'interrogation.'),
  Q('Quel est le féminin pluriel de "petit" ?', ['petit', 'petits', 'petite', 'petites'], 3, 'Féminin pluriel de "petit" : "petites".'),
  Q('Quelle phrase utilise correctement "et" ?', ['Fatou et sont amie jouent.', 'Fatou et son amie jouent.', 'Fatou é son amie jouent.', 'Fatou ai son amie jouent.'], 1, '"Et" relie deux éléments : "Fatou et son amie".'),
]);

add('Rédiger un petit texte', 'Écriture', 'cm2', [
  Q('Un texte bien organisé comporte généralement...', ['Une seule phrase', 'Une introduction, un développement, une conclusion', 'Que des questions', 'Aucune ponctuation'], 1, 'Un texte structuré a une introduction, un développement et une conclusion.'),
  Q('Pour relier deux idées qui s\'opposent, on utilise...', ['Et', 'Mais', 'Donc', 'Puis'], 1, '"Mais" introduit une opposition.'),
  Q('Quel mot permet d\'indiquer l\'ordre des événements ?', ['Rouge', 'D\'abord', 'Table', 'Chat'], 1, '"D\'abord" indique le début d\'une suite d\'actions.'),
  Q('Avant de rendre un texte, il faut...', ['Le relire pour corriger les erreurs', 'Le jeter', 'Ne rien vérifier', 'L\'effacer'], 0, 'Se relire permet de corriger les fautes.'),
  Q('Quelle expression conclut bien un récit ?', ['Il était une fois', 'Finalement', 'Soudain', 'Un jour'], 1, '"Finalement" introduit souvent la fin d\'un récit.'),
]);

// ══════════════════════════ DESSIN ══════════════════════════

add('Les couleurs et les formes simples', 'Dessin', 'cp1', [
  Q('Quelle couleur obtient-on en mélangeant le bleu et le jaune ?', ['Rouge', 'Vert', 'Orange', 'Violet'], 1, 'Bleu + jaune donne du vert.'),
  Q('Quelle forme a un ballon ?', ['Un carré', 'Un rond', 'Un triangle', 'Un rectangle'], 1, 'Un ballon a une forme ronde.'),
  Q('Quelle couleur est au milieu du drapeau guinéen ?', ['Rouge', 'Jaune', 'Vert', 'Bleu'], 1, 'Le drapeau guinéen est rouge, jaune, vert - le jaune est au milieu.'),
  Q('Combien de côtés a un carré ?', ['2', '3', '4', '5'], 2, 'Un carré a 4 côtés.'),
  Q('Quelle couleur donne le mélange du rouge et du blanc ?', ['Rose', 'Vert', 'Marron', 'Noir'], 0, 'Rouge + blanc donne du rose.'),
]);

add('Les formes géométriques de base', 'Dessin', 'cp2', [
  Q('Combien de côtés a un triangle ?', ['2', '3', '4', '5'], 1, 'Un triangle a 3 côtés.'),
  Q('Quelle forme n\'a pas de côtés ?', ['Le carré', 'Le triangle', 'Le cercle', 'Le rectangle'], 2, 'Le cercle est une forme ronde sans côtés.'),
  Q('Quel objet a la forme d\'un rectangle ?', ['Une orange', 'Une porte', 'Une balle', 'Une roue'], 1, 'Une porte a généralement une forme rectangulaire.'),
  Q('Un carré a des côtés...', ['Tous égaux', 'Tous différents', 'Deux longs et deux courts', 'Aucun côté'], 0, 'Les 4 côtés d\'un carré ont la même longueur.'),
  Q('Quelle forme a une roue de vélo ?', ['Carrée', 'Triangulaire', 'Ronde', 'Rectangulaire'], 2, 'Une roue est ronde.'),
]);

add('Les couleurs primaires et secondaires', 'Dessin', 'ce1', [
  Q('Quelles sont les couleurs primaires ?', ['Rouge, jaune, bleu', 'Vert, orange, violet', 'Rose, marron, gris', 'Noir, blanc, gris'], 0, 'Les couleurs primaires sont le rouge, le jaune et le bleu.'),
  Q('Quelle couleur est une couleur secondaire ?', ['Le rouge', 'Le jaune', 'Le vert', 'Le bleu'], 2, 'Le vert est une couleur secondaire (mélange de bleu et jaune).'),
  Q('En mélangeant rouge et jaune, on obtient...', ['Du vert', 'De l\'orange', 'Du violet', 'Du marron'], 1, 'Rouge + jaune donne de l\'orange.'),
  Q('En mélangeant rouge et bleu, on obtient...', ['Du vert', 'De l\'orange', 'Du violet', 'Du jaune'], 2, 'Rouge + bleu donne du violet.'),
  Q('Quelle couleur n\'est pas une couleur primaire ?', ['Rouge', 'Bleu', 'Vert', 'Jaune'], 2, 'Le vert est obtenu par mélange, ce n\'est pas une couleur primaire.'),
]);

add('Le dessin d\'observation', 'Dessin', 'ce2', [
  Q('Dessiner "d\'observation", c\'est dessiner...', ['De mémoire uniquement', 'Ce que l\'on voit devant soi', 'Les yeux fermés', 'Sans modèle'], 1, 'Le dessin d\'observation reproduit ce que l\'on voit réellement.'),
  Q('Pour dessiner un arbre réaliste, il faut observer...', ['Sa forme et ses couleurs', 'Uniquement sa hauteur', 'Rien de particulier', 'Seulement ses racines'], 0, 'On observe la forme, les couleurs et les détails pour un dessin réaliste.'),
  Q('Quel outil permet d\'effacer un trait de crayon ?', ['La règle', 'La gomme', 'Les ciseaux', 'La colle'], 1, 'La gomme sert à effacer.'),
  Q('Quel outil aide à tracer des lignes bien droites ?', ['La gomme', 'La règle', 'Le pinceau', 'La craie'], 1, 'La règle sert à tracer des lignes droites.'),
  Q('Avant de colorier un dessin, il est utile de...', ['Le froisser', 'Faire d\'abord le contour au crayon', 'Le mouiller', 'Le déchirer'], 1, 'On trace d\'abord le contour avant de colorier.'),
]);

add('Les lignes et les motifs', 'Dessin', 'cm1', [
  Q('Une ligne qui ne change jamais de direction est une ligne...', ['Courbe', 'Droite', 'Brisée', 'Ondulée'], 1, 'Une ligne droite garde toujours la même direction.'),
  Q('Un motif qui se répète régulièrement s\'appelle une...', ['Frise', 'Tache', 'Ombre', 'Esquisse'], 0, 'Une frise est un motif qui se répète.'),
  Q('Une ligne qui monte et descend comme des vagues est une ligne...', ['Droite', 'Brisée', 'Ondulée', 'Pointillée'], 2, 'Une ligne ondulée ressemble à des vagues.'),
  Q('Pour créer un dégradé de couleur, on...', ['Mélange progressivement deux couleurs', 'Utilise une seule couleur', 'Efface le dessin', 'Utilise uniquement du noir'], 0, 'Un dégradé mélange progressivement les teintes.'),
  Q('Une composition symétrique est...', ['Identique des deux côtés d\'un axe', 'Toujours en noir et blanc', 'Sans aucune forme', 'Faite au hasard'], 0, 'La symétrie signifie que les deux côtés se correspondent.'),
]);

add('Les proportions et la composition', 'Dessin', 'cm2', [
  Q('Respecter les "proportions" d\'un dessin signifie...', ['Dessiner très vite', 'Garder des tailles cohérentes entre les éléments', 'Utiliser une seule couleur', 'Ne dessiner que des ronds'], 1, 'Les proportions gardent des tailles réalistes entre les éléments.'),
  Q('Le "premier plan" d\'un dessin est...', ['Ce qui est le plus loin', 'Ce qui est le plus proche du spectateur', 'Le titre du dessin', 'La couleur de fond'], 1, 'Le premier plan représente les éléments les plus proches.'),
  Q('Une "composition" équilibrée répartit les éléments...', ['Tous dans un coin', 'De façon harmonieuse sur la feuille', 'En dehors de la feuille', 'Au hasard sans réflexion'], 1, 'Une bonne composition répartit les éléments harmonieusement.'),
  Q('Quelle couleur donne une impression de chaleur ?', ['Le bleu', 'Le rouge', 'Le gris', 'Le blanc'], 1, 'Le rouge est une couleur chaude.'),
  Q('L\'horizon dans un paysage sépare...', ['Le ciel et la terre (ou la mer)', 'Deux personnages', 'Deux couleurs identiques', 'Le titre et le dessin'], 0, 'L\'horizon est la ligne qui sépare le ciel de la terre ou de la mer.'),
]);

// ══════════════════════════ RÉCITATION ══════════════════════════

add('Comptines et petites poésies', 'Récitation', 'cp1', [
  Q('Une comptine est...', ['Un exercice de calcul', 'Un petit poème ou chanson pour enfants', 'Un livre d\'histoire', 'Un jeu de ballon'], 1, 'Une comptine est un petit poème rythmé destiné aux enfants.'),
  Q('Réciter un poème, c\'est...', ['Le lire à voix haute en le regardant', 'Le dire de mémoire à voix haute', 'L\'écrire sur un cahier', 'Le dessiner'], 1, 'Réciter, c\'est dire un texte appris par cœur.'),
  Q('Pourquoi apprend-on des comptines ?', ['Pour compter les moutons', 'Pour enrichir son langage et sa mémoire', 'Pour dormir', 'Pour faire du sport'], 1, 'Les comptines enrichissent le vocabulaire et la mémoire.'),
  Q('Quel mot rime avec "maison" ?', ['Poisson', 'Table', 'Fleur', 'Route'], 0, '"Maison" et "poisson" se terminent par le même son.'),
  Q('Avant de réciter, il faut d\'abord...', ['Apprendre le texte par cœur', 'Le déchirer', 'L\'oublier', 'Le cacher'], 0, 'Il faut mémoriser le texte avant de le réciter.'),
]);

add('Réciter avec le bon rythme', 'Récitation', 'cp2', [
  Q('Le "rythme" d\'un poème correspond à...', ['Sa longueur en pages', 'La cadence des sons et des pauses', 'Sa couleur', 'Son titre'], 1, 'Le rythme, c\'est la cadence des sons et des silences.'),
  Q('Quand on récite, il faut...', ['Parler trop vite pour finir vite', 'Articuler clairement chaque mot', 'Chuchoter sans être entendu', 'Réciter les yeux fermés'], 1, 'Une bonne récitation articule clairement.'),
  Q('Une "strophe" est...', ['Un groupe de vers dans un poème', 'Un instrument de musique', 'Un signe de ponctuation', 'Un dessin'], 0, 'Une strophe regroupe plusieurs vers d\'un poème.'),
  Q('Un "vers" dans un poème correspond à...', ['Une ligne du poème', 'Le titre du poème', 'L\'auteur du poème', 'La couverture du livre'], 0, 'Un vers est une ligne d\'un poème.'),
  Q('Pourquoi marque-t-on une pause à la virgule en récitant ?', ['Pour respirer et rythmer la phrase', 'Pour oublier la suite', 'Pour parler plus fort', 'Pour rire'], 0, 'La pause à la virgule aide à respirer et à donner du rythme.'),
]);

add('Les poèmes sur la nature', 'Récitation', 'ce1', [
  Q('Un poème qui parle des arbres, du soleil et de la pluie évoque...', ['La nature', 'Les mathématiques', 'La cuisine', 'Le sport'], 0, 'Ce poème évoque des éléments de la nature.'),
  Q('Quelle image poétique évoque la pluie ?', ['Des larmes du ciel', 'Un feu ardent', 'Une montagne de sable', 'Un livre fermé'], 0, 'On compare souvent la pluie à des larmes du ciel.'),
  Q('Dans un poème sur la nature, le soleil est souvent associé à...', ['La tristesse', 'La chaleur et la lumière', 'Le froid', 'Le silence'], 1, 'Le soleil évoque la chaleur et la lumière.'),
  Q('Une "image poétique" sert à...', ['Décrire les choses de façon imagée et sensible', 'Donner un ordre', 'Poser une question', 'Faire un calcul'], 0, 'L\'image poétique décrit les choses de manière imagée.'),
  Q('Quel mot évoque la saison des pluies en Guinée ?', ['L\'harmattan', 'L\'hivernage', 'La canicule', 'Le gel'], 1, 'En Guinée, la saison des pluies est appelée "hivernage".'),
]);

add('Les poèmes sur la Guinée', 'Récitation', 'ce2', [
  Q('Un poème sur la Guinée peut évoquer...', ['Le drapeau et le fleuve Niger', 'Uniquement des chiffres', 'Des pays étrangers seulement', 'Rien en particulier'], 0, 'Un tel poème évoque des symboles et éléments guinéens comme le drapeau ou le fleuve Niger.'),
  Q('Pourquoi récite-t-on des poèmes sur son pays ?', ['Pour développer le sentiment d\'appartenance et la fierté nationale', 'Pour apprendre à cuisiner', 'Pour faire du sport', 'Pour dessiner'], 0, 'Cela renforce la fierté et l\'attachement au pays.'),
  Q('Quel fleuve important prend sa source en Guinée ?', ['Le Nil', 'Le Niger', 'L\'Amazone', 'Le Congo'], 1, 'Le fleuve Niger prend sa source en Guinée, au Fouta-Djalon.'),
  Q('Le Fouta-Djalon est connu comme...', ['Le désert de la Guinée', 'Le "château d\'eau" de l\'Afrique de l\'Ouest', 'Une ville côtière', 'Un pays voisin'], 1, 'Le Fouta-Djalon est surnommé le "château d\'eau" de l\'Afrique de l\'Ouest.'),
  Q('Quel élément apparaît souvent dans les poèmes patriotiques ?', ['Le drapeau et l\'unité nationale', 'Les jeux vidéo', 'Les voitures', 'Les avions'], 0, 'Les poèmes patriotiques évoquent souvent le drapeau et l\'unité du pays.'),
]);

add('La récitation expressive', 'Récitation', 'cm1', [
  Q('Une récitation "expressive" met en valeur...', ['Le ton, les gestes et les émotions du texte', 'Uniquement la vitesse', 'Le silence total', 'Le volume le plus fort possible'], 0, 'La récitation expressive utilise le ton et les émotions pour donner vie au texte.'),
  Q('Que faut-il éviter pendant une récitation devant la classe ?', ['Regarder son public', 'Bien articuler', 'Réciter d\'une voix monotone et sans expression', 'Respecter le rythme du poème'], 2, 'Une voix monotone rend la récitation moins vivante.'),
  Q('Quel geste peut accompagner une récitation ?', ['Un geste qui illustre le sens du texte', 'Tourner le dos au public', 'Fermer les yeux tout le temps', 'Courir dans la classe'], 0, 'Un geste illustratif renforce le sens du texte récité.'),
  Q('Pourquoi respecter la ponctuation quand on récite ?', ['Pour marquer les pauses et l\'intonation', 'Pour aller plus vite', 'Pour oublier des mots', 'Pour parler plus fort'], 0, 'La ponctuation guide les pauses et l\'intonation.'),
  Q('Un texte appris "par cœur" signifie qu\'on le...', ['Comprend sans le retenir', 'Retient de mémoire, mot pour mot', 'Lit toujours avec le livre', 'Invente à chaque fois'], 1, 'Apprendre par cœur, c\'est mémoriser un texte mot pour mot.'),
]);

add('Les grands poètes et textes guinéens/africains', 'Récitation', 'cm2', [
  Q('Comment s\'appelle l\'hymne national de la Guinée ?', ['La Marseillaise', 'Le Chant de la Guinée', 'Union Africaine', 'Liberté'], 1, 'L\'hymne national guinéen s\'intitule "Le Chant de la Guinée".'),
  Q('La littérature orale africaine transmet souvent ses récits par...', ['Les griots', 'Les journaux', 'La télévision', 'Internet uniquement'], 0, 'Les griots sont les gardiens traditionnels de la parole et des récits en Afrique de l\'Ouest.'),
  Q('Un "conte" traditionnel sert souvent à...', ['Transmettre une leçon de sagesse', 'Vendre des produits', 'Faire du calcul', 'Enseigner la géométrie'], 0, 'Les contes transmettent des valeurs et des leçons de sagesse.'),
  Q('Réciter un texte patrimonial permet de...', ['Préserver la culture et la mémoire collective', 'Oublier son histoire', 'Remplacer l\'école', 'Éviter de lire'], 0, 'Cela contribue à transmettre et préserver la culture.'),
  Q('Qu\'est-ce qu\'un proverbe ?', ['Une formule courte exprimant une sagesse populaire', 'Un long roman', 'Une chanson moderne', 'Un exercice de calcul'], 0, 'Un proverbe est une phrase courte qui exprime une sagesse populaire.'),
]);

// ══════════════════════════ CHANT ══════════════════════════

add('Chansons enfantines et rythme', 'Chant', 'cp1', [
  Q('Pour chanter en groupe, il faut...', ['Chanter chacun à un rythme différent', 'Suivre le même rythme que les autres', 'Crier le plus fort possible', 'Se taire'], 1, 'Chanter ensemble demande de suivre le même rythme.'),
  Q('Que peut-on utiliser pour marquer le rythme d\'une chanson ?', ['Taper des mains', 'Fermer les yeux', 'S\'asseoir', 'Ne rien faire'], 0, 'Taper des mains aide à marquer le rythme.'),
  Q('Une chanson "douce" se chante...', ['Très fort et vite', 'Calmement et doucement', 'En criant', 'En courant'], 1, 'Une chanson douce se chante calmement.'),
  Q('Pourquoi apprend-on des chansons à l\'école ?', ['Pour développer l\'oreille musicale et le langage', 'Pour faire du sport', 'Pour apprendre à compter uniquement', 'Pour dessiner'], 0, 'Les chansons développent l\'oreille musicale et le langage.'),
  Q('Un "refrain" dans une chanson est...', ['La partie qui revient plusieurs fois', 'Le titre de la chanson', 'L\'auteur de la chanson', 'Un instrument de musique'], 0, 'Le refrain est la partie répétée de la chanson.'),
]);

add('Les sons et le rythme musical', 'Chant', 'cp2', [
  Q('Un son "aigu" est...', ['Un son grave et bas', 'Un son haut et fin', 'Un silence', 'Un bruit fort uniquement'], 1, 'Un son aigu est haut et fin, contrairement au son grave.'),
  Q('Un son "grave" est...', ['Un son bas et profond', 'Un son très aigu', 'Un silence total', 'Une couleur'], 0, 'Un son grave est bas et profond.'),
  Q('Taper des mains en rythme régulier s\'appelle...', ['Une mélodie', 'Une pulsation', 'Un dessin', 'Une phrase'], 1, 'La pulsation est le battement régulier qui rythme la musique.'),
  Q('Le silence en musique sert à...', ['Faire une pause dans le son', 'Chanter plus fort', 'Changer de chanson', 'Rien du tout'], 0, 'Le silence marque une pause dans la musique.'),
  Q('Chanter "vite" correspond à un tempo...', ['Lent', 'Rapide', 'Silencieux', 'Aucun tempo'], 1, 'Un tempo rapide signifie chanter ou jouer vite.'),
]);

add('L\'hymne national de la Guinée', 'Chant', 'ce1', [
  Q('Comment s\'appelle l\'hymne national guinéen ?', ['Liberté', 'Le Chant de la Guinée', 'La Marseillaise', 'Unité Africaine'], 1, 'L\'hymne national de la Guinée s\'appelle "Le Chant de la Guinée".'),
  Q('Quand chante-t-on généralement l\'hymne national ?', ['Lors des cérémonies officielles et fêtes nationales', 'Uniquement en dormant', 'Jamais', 'Pendant les repas'], 0, 'L\'hymne national se chante lors des cérémonies officielles.'),
  Q('Comment doit-on se tenir pendant l\'hymne national ?', ['Assis et en parlant', 'Debout et respectueusement', 'Couché', 'En courant'], 1, 'On se tient debout et respectueusement pendant l\'hymne national.'),
  Q('Quelles sont les couleurs du drapeau qui accompagne souvent l\'hymne ?', ['Rouge, jaune, vert', 'Bleu, blanc, rouge', 'Noir, blanc, gris', 'Orange, violet, rose'], 0, 'Le drapeau guinéen est rouge, jaune, vert.'),
  Q('Chanter l\'hymne national exprime...', ['Le respect et l\'attachement à son pays', 'Le désintérêt pour son pays', 'Une simple habitude sans sens', 'Une chanson comme les autres'], 0, 'L\'hymne exprime le respect et l\'attachement à la nation.'),
]);

add('Chanter en groupe', 'Chant', 'ce2', [
  Q('Pour bien chanter en chœur, il faut...', ['Chacun chanter à son propre rythme', 'Écouter les autres et rester synchronisé', 'Chanter plus fort que tout le monde', 'Ne pas écouter les autres'], 1, 'Chanter en groupe demande d\'écouter et de rester synchronisé.'),
  Q('Quel est le rôle du meneur de chant ?', ['Donner le rythme et le départ du chant', 'Ne rien faire', 'Chanter seul sans les autres', 'Écrire les paroles'], 0, 'Le meneur donne le rythme et le signal de départ.'),
  Q('Que faut-il respecter pour bien chanter ensemble ?', ['Le même tempo et la même hauteur de voix', 'Des tempos différents', 'Le silence total', 'Rien en particulier'], 0, 'Chanter ensemble demande le même tempo et une harmonie de voix.'),
  Q('Comment appelle-t-on un groupe de personnes qui chantent ensemble ?', ['Un orchestre uniquement', 'Une chorale', 'Une équipe de football', 'Un conseil'], 1, 'Un groupe de chanteurs s\'appelle une chorale.'),
  Q('Pourquoi respirer correctement est important en chant ?', ['Pour tenir les notes et ne pas s\'essouffler', 'Pour chanter plus vite', 'Pour oublier les paroles', 'Ce n\'est pas important'], 0, 'Une bonne respiration permet de tenir les notes sans s\'essouffler.'),
]);

add('Les instruments de musique traditionnels guinéens', 'Chant', 'cm1', [
  Q('Quel est un instrument à cordes traditionnel utilisé par les griots ouest-africains ?', ['La kora', 'Le tambour', 'La flûte', 'Le xylophone'], 0, 'La kora est un instrument à cordes traditionnel des griots.'),
  Q('Le "balafon" est un instrument...', ['À cordes', 'À percussion (lames de bois)', 'À vent', 'Électronique'], 1, 'Le balafon est un instrument à percussion fait de lames de bois.'),
  Q('Le "djembé" est un instrument...', ['À percussion (tambour)', 'À cordes', 'À vent', 'À clavier'], 0, 'Le djembé est un tambour traditionnel d\'Afrique de l\'Ouest.'),
  Q('Qui joue traditionnellement de la kora en Afrique de l\'Ouest ?', ['Les griots', 'Les pêcheurs', 'Les enseignants', 'Les commerçants'], 0, 'Les griots sont traditionnellement les joueurs de kora.'),
  Q('Un instrument "à vent" produit du son en...', ['Étant soufflé', 'Étant frappé', 'Étant pincé', 'Étant secoué'], 0, 'Un instrument à vent produit du son quand on souffle dedans.'),
]);

add('Le rythme et la mélodie', 'Chant', 'cm2', [
  Q('La "mélodie" d\'une chanson correspond à...', ['La suite de notes qui forme l\'air de la chanson', 'Le rythme uniquement', 'Les paroles écrites', 'Le silence entre les chansons'], 0, 'La mélodie est la suite de notes qui forme l\'air musical.'),
  Q('Le "rythme" en musique désigne...', ['L\'organisation des sons dans le temps', 'La couleur des instruments', 'Le nombre de chanteurs', 'Le titre de la chanson'], 0, 'Le rythme organise les sons et les silences dans le temps.'),
  Q('Une chanson "polyphonique" signifie qu\'elle comporte...', ['Plusieurs voix ou parties chantées ensemble', 'Une seule voix', 'Aucun son', 'Uniquement des instruments'], 0, 'La polyphonie combine plusieurs voix ou parties musicales simultanément.'),
  Q('Quel élément permet de reconnaître facilement une chanson ?', ['Sa mélodie', 'La couleur du livre', 'Le nombre de pages', 'Le format du cahier'], 0, 'On reconnaît souvent une chanson grâce à sa mélodie.'),
  Q('Chanter "en harmonie" signifie...', ['Que les voix s\'accordent bien ensemble', 'Que chacun chante une chanson différente', 'Qu\'il n\'y a aucun son', 'Que l\'on chante très fort seulement'], 0, 'L\'harmonie, c\'est l\'accord agréable entre plusieurs voix ou sons.'),
]);

module.exports = quizzes;
