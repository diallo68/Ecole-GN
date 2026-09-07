// Contenu pour les matières identifiées comme manquantes après correction
// du programme réel (collège + 3 séries du lycée guinéen) : Anglais et
// Éducation civique et Morale au collège ; Anglais, Philosophie et Économie
// au lycée. Un quiz "de base" par (matière, classe) — dupliqué vers les
// filières concernées par le script de publication (voir
// publish-quiz-nouvelles-matieres.js), car le contenu ne diffère pas
// d'une série à l'autre pour ces matières.
const Q = (question, choix, reponseCorrecte, explication) => ({ question, choix, reponseCorrecte, explication });

const quizzes = [];
const add = (titre, matiere, niveau, questions) => quizzes.push({ titre, matiere, niveau, questions });

// ══════════════════════════ ANGLAIS — COLLÈGE ══════════════════════════

add('Greetings and everyday words', 'Anglais', '7e', [
  Q('Comment dit-on « Bonjour » en anglais (le matin) ?', ['Good night', 'Good morning', 'Goodbye', 'Good afternoon'], 1, '« Good morning » se dit le matin.'),
  Q('Que signifie « Thank you » ?', ['Bonjour', 'Pardon', 'Merci', 'S\'il vous plaît'], 2, '« Thank you » signifie « merci ».'),
  Q('Comment traduit-on « Je m\'appelle... » ?', ['I am from...', 'My name is...', 'I have...', 'I like...'], 1, '« My name is... » veut dire « Je m\'appelle... ».'),
  Q('Quel est le pluriel de « book » ?', ['Books', 'Bookes', 'Bookies', 'Book'], 0, 'On ajoute un « s » : books.'),
  Q('Comment dit-on « rouge » en anglais ?', ['Blue', 'Green', 'Red', 'Yellow'], 2, '« Red » signifie rouge.'),
]);

add('Present simple: to be and to have', 'Anglais', '8e', [
  Q('Complète : « She ___ a teacher. »', ['am', 'is', 'are', 'be'], 1, 'Avec « she » (3e pers. sing.), on utilise « is ».'),
  Q('Quelle est la forme correcte : « They ___ two brothers. »', ['has', 'have', 'having', 'is'], 1, 'Avec « they », on utilise « have ».'),
  Q('Quel jour vient après « Monday » ?', ['Sunday', 'Wednesday', 'Tuesday', 'Friday'], 2, '« Tuesday » (mardi) suit « Monday » (lundi).'),
  Q('« My father\'s brother » s\'appelle en anglais...', ['My cousin', 'My uncle', 'My nephew', 'My grandfather'], 1, 'Le frère du père est « uncle » (oncle).'),
  Q('Complète : « I ___ not hungry. »', ['am', 'is', 'are', 'do'], 0, 'Avec « I », on utilise « am ».'),
]);

add('Past simple and prepositions', 'Anglais', '9e', [
  Q('Quelle est la forme passée de « go » ?', ['Goed', 'Went', 'Gone', 'Going'], 1, '« Go » est irrégulier : went au passé.'),
  Q('Complète : « She ___ to school yesterday. »', ['walk', 'walks', 'walked', 'walking'], 2, 'Au passé simple, on ajoute « -ed » : walked.'),
  Q('Quelle préposition complète : « The book is ___ the table. »', ['in', 'on', 'at', 'under'], 1, '« On » indique une position au-dessus d\'une surface.'),
  Q('Quelle est la forme passée de « eat » ?', ['Eated', 'Ate', 'Eaten', 'Eating'], 1, '« Eat » est irrégulier : ate au passé simple.'),
  Q('« Last week » signifie...', ['La semaine prochaine', 'Cette semaine', 'La semaine dernière', 'Aujourd\'hui'], 2, '« Last week » veut dire « la semaine dernière ».'),
]);

add('Comparatives and questions', 'Anglais', '10e', [
  Q('Quelle est la forme comparative de « big » ?', ['Biger', 'Bigger', 'More big', 'Most big'], 1, 'Adjectif court : on double la consonne et ajoute « -er » : bigger.'),
  Q('Complète : « This exercise is ___ than the last one. »', ['difficult', 'more difficult', 'difficulter', 'most difficult'], 1, 'Adjectif long : « more + adjectif » pour comparer.'),
  Q('Quel mot interrogatif utilise-t-on pour demander un lieu ?', ['When', 'Why', 'Where', 'Who'], 2, '« Where » interroge sur le lieu.'),
  Q('Quelle est la forme superlative de « good » ?', ['Gooder', 'More good', 'Best', 'Goodest'], 2, '« Good » est irrégulier : best au superlatif.'),
  Q('Complète : « ___ do you live? » — « In Conakry. »', ['What', 'Where', 'Who', 'When'], 1, 'La réponse donne un lieu, donc la question utilise « Where ».'),
]);

// ═══════════════════ ÉDUCATION CIVIQUE ET MORALE — COLLÈGE ═══════════════════

add('Les symboles de la République de Guinée', 'Éducation civique et Morale', '7e', [
  Q('Quelles sont les trois couleurs du drapeau guinéen ?', ['Vert, jaune, rouge', 'Rouge, jaune, vert', 'Bleu, blanc, rouge', 'Jaune, vert, rouge'], 1, 'Le drapeau guinéen est rouge, jaune, vert (de la hampe vers l\'extérieur).'),
  Q('Quelle est la devise de la République de Guinée ?', ['Unité, Travail, Justice', 'Liberté, Égalité, Fraternité', 'Paix, Travail, Patrie', 'Un peuple, un but, une foi'], 0, 'La devise de la Guinée est « Travail, Justice, Solidarité ».'),
  Q('Comment s\'appelle l\'hymne national de la Guinée ?', ['La Marseillaise', 'Liberté', 'Le Chant de la Guinée', 'Union'], 2, 'L\'hymne national guinéen s\'intitule « Le Chant de la Guinée ».'),
  Q('Respecter le règlement intérieur de son école est un exemple de...', ['Devoir civique', 'Loisir', 'Punition', 'Privilège'], 0, 'Respecter les règles de vie collective est un devoir civique.'),
  Q('La capitale de la République de Guinée est...', ['Kankan', 'Labé', 'Conakry', 'Nzérékoré'], 2, 'Conakry est la capitale de la Guinée.'),
]);

add('Droits et devoirs du citoyen', 'Éducation civique et Morale', '8e', [
  Q('Un droit fondamental de chaque enfant est...', ['Travailler dès le plus jeune âge', 'Aller à l\'école', 'Ne rien faire', 'Voter'], 1, 'L\'éducation est un droit fondamental reconnu à tout enfant.'),
  Q('Que signifie « civisme » ?', ['Vivre seul', 'Le respect des lois et de la vie en société', 'Faire ce que l\'on veut', 'Éviter les autres'], 1, 'Le civisme désigne le respect des règles et des autres dans la vie collective.'),
  Q('Payer les taxes et impôts quand on en a l\'obligation est un exemple de...', ['Droit', 'Devoir du citoyen', 'Punition', 'Cadeau'], 1, 'C\'est un devoir civique qui finance les services publics.'),
  Q('La tolérance envers les personnes différentes de soi est une valeur...', ['Inutile', 'Négative', 'Civique importante', 'Réservée aux adultes'], 2, 'La tolérance est une valeur civique essentielle au vivre-ensemble.'),
  Q('Un exemple de devoir envers sa famille est...', ['L\'ignorer', 'Respecter et aider ses parents', 'Ne jamais rentrer à la maison', 'Ne rien partager'], 1, 'Respecter et aider ses parents fait partie des devoirs familiaux.'),
]);

add('Les institutions de la République', 'Éducation civique et Morale', '9e', [
  Q('Qui est le chef de l\'État en République de Guinée ?', ['Le Premier ministre', 'Le Président de la République', 'Le maire de Conakry', 'Le chef du village'], 1, 'Le Président de la République est le chef de l\'État.'),
  Q('Le texte fondamental qui organise les pouvoirs d\'un État s\'appelle...', ['Le règlement intérieur', 'La Constitution', 'Le calendrier', 'Le dictionnaire'], 1, 'La Constitution organise les institutions et les pouvoirs de l\'État.'),
  Q('La démocratie est un système où...', ['Un seul homme décide de tout', 'Le pouvoir appartient au peuple', 'Il n\'y a pas de lois', 'Personne ne vote'], 1, 'En démocratie, le pouvoir vient du peuple, notamment par le vote.'),
  Q('Voter à une élection est un exemple de...', ['Devoir religieux', 'Droit et devoir civique', 'Loisir sans importance', 'Obligation scolaire'], 1, 'Voter est à la fois un droit et un devoir du citoyen.'),
  Q('Le pouvoir chargé de faire appliquer et respecter les lois est le pouvoir...', ['Législatif', 'Exécutif', 'Judiciaire', 'Spirituel'], 2, 'Le pouvoir judiciaire fait respecter les lois et rend la justice.'),
]);

add('Droits de l\'enfant, paix et environnement', 'Éducation civique et Morale', '10e', [
  Q('La Convention internationale des droits de l\'enfant protège notamment...', ['Le droit au travail forcé', 'Le droit à l\'éducation et à la protection', 'Le droit de ne pas aller à l\'école', 'Aucun droit particulier'], 1, 'Elle protège l\'éducation, la santé et la protection de l\'enfant.'),
  Q('Le dialogue est un moyen privilégié pour...', ['Créer des conflits', 'Résoudre pacifiquement les conflits', 'Éviter de se comprendre', 'Punir les autres'], 1, 'Le dialogue permet de résoudre les désaccords de façon pacifique.'),
  Q('Protéger l\'environnement (ne pas jeter les déchets n\'importe où) est un acte...', ['Sans importance', 'Citoyen', 'Interdit', 'Réservé aux adultes'], 1, 'La protection de l\'environnement est un devoir civique de chacun.'),
  Q('La discrimination envers une personne à cause de son ethnie est...', ['Acceptable', 'Un comportement contraire aux droits humains', 'Encouragée', 'Une preuve de civisme'], 1, 'La discrimination viole le principe d\'égalité entre tous les citoyens.'),
  Q('La paix sociale repose notamment sur...', ['Le rejet des autres', 'Le respect mutuel et la solidarité', 'La violence', 'L\'indifférence'], 1, 'Respect mutuel et solidarité sont des piliers de la paix sociale.'),
]);

// ══════════════════════════ ANGLAIS — LYCÉE ══════════════════════════

add('Present perfect and passive voice', 'Anglais', '11e', [
  Q('Quelle est la structure du present perfect ?', ['Subject + verb + ed', 'Subject + have/has + past participle', 'Subject + will + verb', 'Subject + be + verb-ing'], 1, 'Le present perfect se forme avec have/has + participe passé.'),
  Q('Complète : « I ___ never been to England. »', ['have', 'has', 'had', 'am'], 0, 'Avec « I », on utilise « have ».'),
  Q('Mets à la voix passive : « The teacher corrects the exercise. »', ['The exercise is corrected by the teacher.', 'The exercise corrects the teacher.', 'The teacher is corrected.', 'The exercise was correct.'], 0, 'À la voix passive : sujet + be + participe passé + by + agent.'),
  Q('Quel participe passé correspond au verbe « write » ?', ['Wrote', 'Writed', 'Written', 'Writing'], 2, '« Write » est irrégulier : written au participe passé.'),
  Q('« Since 2020 » et « for two years » indiquent tous les deux...', ['Une action future', 'Une durée liée au present perfect', 'Un ordre', 'Une interdiction'], 1, 'Since/for précisent la durée avec le present perfect.'),
]);

add('Conditionals and reported speech', 'Anglais', '12e', [
  Q('Quelle est la structure du first conditional ?', ['If + past simple, would + verb', 'If + present simple, will + verb', 'If + past perfect, would have + participle', 'If + will, present'], 1, 'Premier conditionnel : If + présent, will + verbe (fait probable/futur).'),
  Q('Complète : « If I had money, I ___ travel. »', ['will', 'would', 'would have', 'am'], 1, 'Second conditionnel (hypothèse irréelle au présent) : would + verbe.'),
  Q('Style indirect : « He said, "I am tired." » devient...', ['He said he is tired.', 'He said he was tired.', 'He say he was tired.', 'He said I am tired.'], 1, 'Au discours indirect, le présent devient prétérit : « he was tired ».'),
  Q('Quelle est la structure du third conditional (regret passé) ?', ['If + past perfect, would have + participle', 'If + present, will', 'If + past, would', 'If + future, would'], 0, 'Troisième conditionnel : If + past perfect, would have + participe passé.'),
  Q('« She asked me where I lived » est un exemple de...', ['Question directe', 'Discours rapporté (reported speech)', 'Impératif', 'Voix passive'], 1, 'C\'est une question rapportée au discours indirect.'),
]);

add('Advanced grammar and vocabulary', 'Anglais', 'terminale', [
  Q('Quelle est la différence entre « few » et « a few » ?', ['Aucune différence', '« few » = presque aucun, « a few » = quelques-uns', '« few » est pour le singulier', 'Elles ne s\'utilisent jamais avec les noms comptables'], 1, '« Few » a un sens négatif (presque aucun), « a few » un sens positif (quelques).'),
  Q('Quel connecteur logique exprime une conséquence ?', ['Although', 'Therefore', 'Whereas', 'Unless'], 1, '« Therefore » (donc) introduit une conséquence.'),
  Q('Complète avec la préposition correcte : « She is interested ___ history. »', ['on', 'at', 'in', 'for'], 2, 'On dit « interested in something ».'),
  Q('Quel est le sens de l\'expression idiomatique « to make up your mind » ?', ['Se maquiller', 'Se décider', 'Perdre la tête', 'Oublier quelque chose'], 1, '« To make up your mind » signifie « se décider ».'),
  Q('Quelle structure introduit une proposition relative sur une personne ?', ['Which', 'Who', 'What', 'Whose (uniquement)'], 1, '« Who » introduit une relative dont l\'antécédent est une personne.'),
]);

// ══════════════════════════ PHILOSOPHIE — LYCÉE ══════════════════════════

add('Qu\'est-ce que la philosophie ? La conscience', 'Philosophie', '11e', [
  Q('Étymologiquement, « philosophie » signifie...', ['La science des nombres', 'L\'amour de la sagesse', 'L\'étude des astres', 'L\'art de convaincre'], 1, 'Du grec « philo » (amour) et « sophia » (sagesse).'),
  Q('La philosophie se distingue de la religion notamment parce qu\'elle...', ['Repose sur la foi seule', 'Cherche à fonder ses affirmations par la raison', 'Interdit le doute', 'Rejette toute question'], 1, 'La philosophie privilégie l\'argumentation rationnelle plutôt que la croyance.'),
  Q('La conscience désigne...', ['L\'absence totale de pensée', 'La capacité de se percevoir soi-même et le monde', 'Un organe du corps', 'Un simple réflexe'], 1, 'La conscience est la faculté de se percevoir soi-même et son environnement.'),
  Q('« Douter » en philosophie signifie surtout...', ['Refuser de penser', 'Interroger ce qui semble évident pour mieux le comprendre', 'Être paresseux', 'Ne jamais conclure'], 1, 'Le doute philosophique est une méthode pour examiner ce qui paraît évident.'),
  Q('Un philosophe cherche avant tout à...', ['Répéter ce que d\'autres ont dit sans réfléchir', 'Questionner et argumenter rationnellement', 'Éviter toute discussion', 'Imposer ses opinions sans preuve'], 1, 'La philosophie repose sur le questionnement et l\'argumentation.'),
]);

add('La vérité et la liberté', 'Philosophie', '12e', [
  Q('Une vérité est généralement définie comme...', ['Ce qui plaît à tout le monde', 'L\'accord entre une idée et la réalité', 'Une opinion personnelle', 'Ce que dit la majorité'], 1, 'La vérité correspond classiquement à l\'adéquation entre le discours et le réel.'),
  Q('Être libre signifie uniquement...', ['Faire absolument tout ce que l\'on veut sans limite', 'Agir selon sa raison, souvent dans le respect des lois', 'Ne dépendre de personne', 'Vivre seul'], 1, 'La liberté philosophique s\'articule souvent avec la raison et la loi.'),
  Q('Le déterminisme est l\'idée selon laquelle...', ['Tout événement a une cause qui l\'explique', 'Rien n\'a de cause', 'Le hasard seul gouverne le monde', 'La liberté n\'a aucune limite'], 0, 'Le déterminisme affirme que tout phénomène est déterminé par des causes.'),
  Q('Selon de nombreux philosophes, la liberté sans aucune loi mène à...', ['Une société plus juste', 'Le désordre, voire la loi du plus fort', 'La paix automatique', 'Rien de particulier'], 1, 'L\'absence totale de règles peut conduire au chaos social.'),
  Q('Un jugement est dit « vrai » lorsqu\'il...', ['Fait plaisir à celui qui l\'énonce', 'Correspond à la réalité ou est démontré logiquement', 'Est répété souvent', 'N\'est jamais discuté'], 1, 'La vérité repose sur la correspondance au réel ou la démonstration.'),
]);

add('La morale, le devoir et le bonheur', 'Philosophie', 'terminale', [
  Q('La morale s\'intéresse principalement à...', ['Ce qui est beau', 'Ce qui est bien ou mal, juste ou injuste', 'Ce qui est rentable', 'Ce qui est amusant'], 1, 'La morale interroge le bien et le mal, le juste et l\'injuste.'),
  Q('Agir « par devoir » signifie...', ['Agir uniquement par intérêt personnel', 'Agir parce que c\'est moralement juste, indépendamment du résultat', 'Agir sans jamais réfléchir', 'Agir pour être admiré'], 1, 'Agir par devoir, c\'est agir parce que l\'action est moralement juste en elle-même.'),
  Q('Le bonheur est souvent défini en philosophie comme...', ['Un plaisir immédiat et passager uniquement', 'Un état de satisfaction durable de l\'existence', 'L\'absence totale de désir', 'La richesse matérielle seule'], 1, 'Le bonheur est généralement pensé comme une satisfaction stable et durable.'),
  Q('L\'État, selon plusieurs philosophes, a notamment pour rôle de...', ['Créer le désordre', 'Garantir l\'ordre, la justice et la sécurité des citoyens', 'Empêcher toute liberté', 'Remplacer la famille'], 1, 'L\'État est souvent pensé comme garant de l\'ordre et de la justice sociale.'),
  Q('Une action est-elle morale seulement si elle profite à celui qui l\'accomplit ?', ['Oui, toujours', 'Non, la morale considère aussi l\'intérêt d\'autrui', 'La morale ne concerne jamais autrui', 'La question est sans objet'], 1, 'La morale prend en compte le respect et le bien-être d\'autrui, pas seulement l\'intérêt personnel.'),
]);

// ══════════════════════════ ÉCONOMIE — LYCÉE ══════════════════════════

add('Besoins, biens et marché', 'Économie', '11e', [
  Q('Un besoin économique est...', ['Un désir impossible à satisfaire', 'Un sentiment de manque que l\'on cherche à satisfaire', 'Toujours illimité et sans importance', 'Réservé aux entreprises'], 1, 'Le besoin est un sentiment de manque que les individus cherchent à combler.'),
  Q('Un bien économique est dit « rare » lorsque...', ['Il existe en quantité illimitée et gratuite', 'Sa quantité disponible est limitée par rapport aux besoins', 'Il n\'intéresse personne', 'Il est produit uniquement par l\'État'], 1, 'La rareté vient d\'une quantité limitée face à des besoins qui existent.'),
  Q('Le marché est le lieu (réel ou non) où...', ['Seuls les vendeurs se rencontrent', 'L\'offre et la demande se rencontrent pour fixer un échange', 'On ne peut rien acheter', 'Les prix sont toujours fixés par la loi'], 1, 'Le marché met en relation offreurs et demandeurs autour d\'un prix.'),
  Q('Les trois grands agents économiques principaux sont...', ['Les ménages, les entreprises, l\'État', 'Les animaux, les plantes, les minéraux', 'Les écoles uniquement', 'Les banques seules'], 0, 'Ménages, entreprises et État sont les grands agents économiques.'),
  Q('Un bien dit « libre » (comme l\'air) se caractérise par...', ['Sa rareté extrême', 'Son abondance et sa gratuité naturelle', 'Son prix très élevé', 'Sa production industrielle'], 1, 'Un bien libre est disponible en abondance, sans qu\'il faille payer pour l\'obtenir.'),
]);

add('L\'offre, la demande et la monnaie', 'Économie', '12e', [
  Q('Quand le prix d\'un bien augmente, la quantité demandée a tendance à...', ['Augmenter', 'Diminuer', 'Rester identique toujours', 'Disparaître totalement'], 1, 'Généralement, plus un bien est cher, moins on en demande (loi de la demande).'),
  Q('Quand le prix d\'un bien augmente, la quantité offerte par les producteurs a tendance à...', ['Diminuer', 'Augmenter', 'Rester nulle', 'Devenir négative'], 1, 'Un prix plus élevé incite généralement les producteurs à offrir davantage.'),
  Q('La monnaie remplit notamment la fonction de...', ['Intermédiaire des échanges', 'Nourriture', 'Vêtement', 'Outil agricole'], 0, 'La monnaie facilite les échanges en évitant le troc direct.'),
  Q('Le troc est un échange...', ['Utilisant uniquement la monnaie', 'Direct de biens contre d\'autres biens, sans monnaie', 'Interdit dans toutes les sociétés', 'Réservé aux banques'], 1, 'Le troc est l\'échange direct de biens ou services sans passer par la monnaie.'),
  Q('Le point où l\'offre et la demande se rejoignent détermine...', ['Le prix d\'équilibre du marché', 'La météo', 'La population d\'un pays', 'La langue officielle'], 0, 'L\'intersection de l\'offre et de la demande fixe le prix d\'équilibre.'),
]);

add('Croissance, développement et économie guinéenne', 'Économie', 'terminale', [
  Q('La croissance économique se mesure généralement par...', ['L\'évolution du PIB (Produit Intérieur Brut)', 'Le nombre d\'écoles uniquement', 'La météo annuelle', 'Le nombre de langues parlées'], 0, 'La croissance économique est mesurée par la variation du PIB.'),
  Q('Le développement économique, contrairement à la seule croissance, prend aussi en compte...', ['Uniquement la production industrielle', 'L\'amélioration des conditions de vie (santé, éducation...)', 'Le prix de l\'or uniquement', 'Rien de plus'], 1, 'Le développement intègre des dimensions humaines et sociales, pas seulement quantitatives.'),
  Q('La Guinée est un important exportateur mondial de...', ['Pétrole', 'Bauxite', 'Blé', 'Automobiles'], 1, 'La Guinée possède d\'importantes réserves de bauxite, minerai utilisé pour produire l\'aluminium.'),
  Q('La mondialisation désigne notamment...', ['La fermeture totale des frontières', 'L\'intensification des échanges économiques entre pays', 'L\'arrêt du commerce international', 'Un phénomène uniquement culturel'], 1, 'La mondialisation renvoie à l\'accroissement des échanges économiques mondiaux.'),
  Q('Diversifier une économie trop dépendante d\'une seule ressource permet notamment de...', ['Augmenter les risques économiques', 'Réduire la vulnérabilité face aux variations de prix d\'une seule ressource', 'Ne rien changer', 'Interdire les exportations'], 1, 'La diversification limite les risques liés à la dépendance à un seul secteur.'),
]);

module.exports = quizzes;
console.log(`Total: ${quizzes.length} quiz préparés (${quizzes.reduce((s, q) => s + q.questions.length, 0)} questions).`);
