# Mobile — app enseignant & parent

Flutter, contre l'API décrite dans [`../docs/openapi.yaml`](../docs/openapi.yaml). Voir `../docs/architecture-technique.md` §02 pour le choix de stack (Flutter plutôt que React Native — performance sur Android bas de gamme, support hors-ligne natif).

Un compte direction/personnel administratif se connecte mais atterrit sur un écran de repli ("utilisez le portail web") — cette app cible enseignant (`lib/screens/mes_classes_screen.dart`) et parent (`lib/screens/mes_enfants_screen.dart`), le back-office reste sur `../web`. L'écran d'accueil est choisi par `AuthService.roleCourant` (`lib/main.dart`).

## Démarrer en local

Le backend doit tourner (`cd ../backend && php artisan serve --port=8123`, Postgres démarré).

```bash
flutter pub get
flutter run
```

`lib/api/api_client.dart` pointe sur `http://127.0.0.1:8123/api/v1` en dur — contrairement au web (proxy Vite), chaque plateforme Flutter résout `localhost` différemment :

- iOS / macOS / web (debug local) : `127.0.0.1` fonctionne tel quel.
- Émulateur Android : remplacer par `10.0.2.2` (alias vers l'hôte).
- Appareil physique : l'IP réseau locale de la machine qui fait tourner le backend.

## Structure

- `lib/api/api_client.dart` — client HTTP minimal (paquet `http`, pas dio), pose `Authorization` et `X-Etablissement-Id`. Token et établissement courant en `flutter_secure_storage`.
- `lib/auth/auth_service.dart` — `ChangeNotifier`, miroir de `web/src/auth/AuthContext.tsx`.
- `lib/screens/` — Connexion ; côté enseignant : Mes classes (`?enseignant_id=`), Appel, Matières → Évaluations → Notes, Écritures en erreur ; côté parent : Mes enfants (`GET /mes-enfants`), Détail enfant (bulletins + présences, lecture seule) ; partagés (accessibles des deux côtés) : Emploi du temps, Annonces.

## Mode hors-ligne

`AppelScreen` et `NotesScreen` écrivent **toujours** dans une file locale (`lib/offline/`, SQLite via `sqflite`) avant tout appel réseau — la validation réussit immédiatement, avec ou sans réseau. `SyncService` tente ensuite une synchronisation (`POST /sync/batch`) : immédiatement après l'écriture si le réseau répond, au lancement de l'app si le réseau est déjà là (`Connectivity().checkConnectivity()`, en plus de l'écoute des changements — un appareil déjà connecté au démarrage ne déclenche jamais `onConnectivityChanged`), ou manuellement via le bandeau affiché sur l'écran Mes classes tant qu'il reste des écritures en attente ou en erreur.

La création d'une évaluation elle-même (métadonnée : type, libellé, période) reste un appel réseau direct, pas mis en file — seule la saisie des notes qui s'y rattache passe par la file, au même titre que l'appel.

Une écriture rejetée par le serveur (période clôturée, autorisation retirée entre-temps…) ne se resynchronisera jamais toute seule — "Réessayer" rejouerait indéfiniment le même échec. Le bandeau d'erreur ouvre `FileErreursScreen`, qui liste chaque écriture rejetée avec son message et permet de l'ignorer (suppression définitive, confirmée) après l'avoir lue — jamais de purge automatique ou silencieuse : l'enseignant doit voir le message avant que l'écriture ne disparaisse.

## Côté parent

`mes_enfants_screen.dart` liste les élèves liés au compte connecté (`GET /mes-enfants`, ajouté le 30 août 2026 — jusque-là seul l'inverse élève→parents existait). `enfant_detail_screen.dart` affiche, en lecture seule, les bulletins et l'historique de présence de l'enfant sélectionné.

Cet écran a directement mené à trouver une vraie faille de sécurité : plusieurs endpoints élève (`bulletins`, `presences`, notes de classe, coordonnées des parents) n'avaient aucune vérification au-delà de la RLS établissement, qui ne scope pas à l'élève — n'importe quel utilisateur rattaché pouvait lire les données de n'importe quel élève de l'école. Corrigé côté backend avant de construire l'écran dessus (voir `db/README.md`, `AccesInterFamilleTest.php`). Un parent ne voit par ailleurs que les bulletins déjà **publiés** — un brouillon peut encore changer avant validation par la direction.

## Emploi du temps et Annonces

Les deux seuls écrans partagés enseignant/parent. Manquaient jusqu'ici côté mobile alors que l'API les autorisait déjà : l'écran web `EmploiDuTempsPage` existe depuis longtemps, mais aucun écran mobile — un parent sans accès web n'avait donc aucun moyen de consulter l'horaire de son enfant ni de lire une annonce de la direction (cahier des charges §4.7).

`emploi_du_temps_screen.dart` a nécessité d'enrichir GET /classes/{id}/emploi-du-temps côté API (`matiere`/`enseignant` imbriqués) : contrairement au web, qui résout `matiere_id`/`enseignant_id` en faisant un second appel à `GET /etablissements/{id}/utilisateurs`, l'app mobile n'a pas accès à cet endpoint (réservé à l'administration) — sans l'enrichissement, impossible d'afficher un nom lisible. `GET /mes-enfants` a été enrichi de la même façon avec le champ `classe` (l'inscription active la plus récente), sans quoi `EnfantDetailScreen` n'avait aucun moyen de savoir quelle classe interroger pour l'emploi du temps de l'enfant.

`annonces_screen.dart` filtre côté client : une annonce ciblant `'etablissement'` est toujours visible, une annonce ciblant une `'classe'` seulement si son `cible_id` est dans les classes de l'utilisateur (ses propres classes pour un enseignant, celles de ses enfants pour un parent, passées via `mesClasseIds`) — sans ce filtre, un parent verrait aussi les annonces d'une classe qui n'est pas celle de son enfant.

Écart de contrat trouvé en HTTP réel *avant* d'écrire l'écran (donc jamais expédié cassé) : le cast Postgres `time` sérialise `heure_debut`/`heure_fin` avec les secondes (`"08:00:00"`), pas au format `"HH:MM"` de l'exemple openapi.yaml — déjà contourné côté web (`EmploiDuTempsPage.tsx`, `.slice(0, 5)`), même correctif appliqué ici.

## Vérifié / non vérifié

Vérifié : `flutter analyze` (propre), `flutter test` (19 tests — dont l'interprétation des réponses `/sync/batch`, un vrai aller-retour SQLite via `sqflite_common_ffi`, le parsing des modèles Notes/Évaluations/Bulletins/Présences/Créneaux/Élèves, et `AuthService.roleCourant`), `flutter build web` (compilation réelle), et trois parcours complets rejoués contre un vrai serveur Laravel + Postgres local avec curl, en suivant exactement les appels que fait chaque écran (pas seulement écrits, exécutés) : Matières → créer une évaluation → saisir des notes → `/sync/batch` → relecture ; connexion parent → `/mes-enfants` → bulletins/présences de l'enfant, y compris un contrôle négatif (un parent tiers, non lié, reçoit 403 sur les quatre endpoints les plus sensibles) et la vérification que le filtre brouillon fonctionne réellement (bulletin non publié invisible au parent, visible à l'admin) ; et emploi du temps + annonces pour un enseignant et un parent, y compris la vérification que le filtre d'annonces par classe fonctionne (annonce d'une classe voisine masquée, annonce établissement et annonce de sa propre classe visibles). `ecrituresEnErreur()`/`ignorer()` (SyncService) et `FileErreursScreen` reposent uniquement sur des méthodes `BaseLocale` déjà couvertes par `base_locale_test.dart` (`marquerEnErreur`, `supprimer`, `lister`) — pas de test dédié en plus : construire un vrai `SyncService` en test exigerait `connectivity_plus`, qui exige un binding de plateforme réel comme `flutter_secure_storage`/`sqflite` (voir plus haut) et n'a pas de variante `_ffi` équivalente ; risque de reproduire le blocage `pumpAndSettle` déjà rencontré et évité ailleurs dans ce dossier plutôt qu'un gain de couverture réel sur une simple lecture-filtrée + suppression.

Deux vrais bugs trouvés en rejouant ce parcours contre l'API réelle (pas en relisant le code) :
- La factory SQLite injectable ne l'était pas vraiment — `_ouvrir()` passait par une fonction globale qui ignorait l'injection, donc les tests auraient silencieusement utilisé le vrai plugin de plateforme (et échoué) sans le détecter. Corrigé.
- `Note.valeur` est casté `decimal:2` côté Laravel, donc sérialisé en JSON comme une **chaîne** (`"15.50"`), pas un nombre — `Note.fromJson` avec `as num?` levait une exception au premier chargement d'une note déjà saisie (préremplissage de `NotesScreen`). Corrigé, avec un test de régression.

Un écart de contrat (pas un bug introduit ici, mais qui aurait cassé l'affichage) : les champs `date` Laravel (dont `Evaluation.date_evaluation`) sont sérialisés en ISO 8601 complet (`"2026-11-05T00:00:00.000000Z"`), pas au format `date` (`YYYY-MM-DD`) promis par `docs/openapi.yaml` — aucun `serializeDate` global dans l'API. Corrigé côté client mobile uniquement (troncature à l'affichage) plutôt que de changer la sérialisation globale de l'API, hors scope de cette session.

**Non vérifié dans cette session** : rendu et interactions sur un vrai appareil ou émulateur (aucun émulateur Android configuré dans cet environnement — seuls macOS/web/un iPhone physique apparaissent dans `flutter doctor`), et surtout — le support SQLite du plugin `sqflite` sur la cible web est incertain/limité ; `flutter build web` compile mais ne prouve rien sur le comportement réel de la file locale hors Android/iOS, les vraies cibles de cette fonctionnalité. À tester avec `flutter run` sur un appareil Android réel, y compris en coupant le réseau en cours d'appel, avant de considérer le mode hors-ligne comme validé.
