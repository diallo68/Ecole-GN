# Mobile — app enseignant

Flutter, contre l'API décrite dans [`../docs/openapi.yaml`](../docs/openapi.yaml). Voir `../docs/architecture-technique.md` §02 pour le choix de stack (Flutter plutôt que React Native — performance sur Android bas de gamme, support hors-ligne natif).

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
- `lib/screens/` — Connexion, Mes classes (`?enseignant_id=`), Appel, Matières → Évaluations → Notes, Écritures en erreur.

## Mode hors-ligne

`AppelScreen` et `NotesScreen` écrivent **toujours** dans une file locale (`lib/offline/`, SQLite via `sqflite`) avant tout appel réseau — la validation réussit immédiatement, avec ou sans réseau. `SyncService` tente ensuite une synchronisation (`POST /sync/batch`) : immédiatement après l'écriture si le réseau répond, au lancement de l'app si le réseau est déjà là (`Connectivity().checkConnectivity()`, en plus de l'écoute des changements — un appareil déjà connecté au démarrage ne déclenche jamais `onConnectivityChanged`), ou manuellement via le bandeau affiché sur l'écran Mes classes tant qu'il reste des écritures en attente ou en erreur.

La création d'une évaluation elle-même (métadonnée : type, libellé, période) reste un appel réseau direct, pas mis en file — seule la saisie des notes qui s'y rattache passe par la file, au même titre que l'appel.

Une écriture rejetée par le serveur (période clôturée, autorisation retirée entre-temps…) ne se resynchronisera jamais toute seule — "Réessayer" rejouerait indéfiniment le même échec. Le bandeau d'erreur ouvre `FileErreursScreen`, qui liste chaque écriture rejetée avec son message et permet de l'ignorer (suppression définitive, confirmée) après l'avoir lue — jamais de purge automatique ou silencieuse : l'enseignant doit voir le message avant que l'écriture ne disparaisse.

## Vérifié / non vérifié

Vérifié : `flutter analyze` (propre), `flutter test` (14 tests — dont l'interprétation des réponses `/sync/batch`, un vrai aller-retour SQLite via `sqflite_common_ffi`, et le parsing des modèles Notes/Évaluations), `flutter build web` (compilation réelle), et le parcours complet Matières → créer une évaluation → saisir des notes → `/sync/batch` → relecture rejoué contre un vrai serveur Laravel + Postgres local (pas seulement écrit, exécuté avec curl en suivant exactement les appels que fait chaque écran). `ecrituresEnErreur()`/`ignorer()` (SyncService) et `FileErreursScreen` reposent uniquement sur des méthodes `BaseLocale` déjà couvertes par `base_locale_test.dart` (`marquerEnErreur`, `supprimer`, `lister`) — pas de test dédié en plus : construire un vrai `SyncService` en test exigerait `connectivity_plus`, qui exige un binding de plateforme réel comme `flutter_secure_storage`/`sqflite` (voir plus haut) et n'a pas de variante `_ffi` équivalente ; risque de reproduire le blocage `pumpAndSettle` déjà rencontré et évité ailleurs dans ce dossier plutôt qu'un gain de couverture réel sur une simple lecture-filtrée + suppression.

Deux vrais bugs trouvés en rejouant ce parcours contre l'API réelle (pas en relisant le code) :
- La factory SQLite injectable ne l'était pas vraiment — `_ouvrir()` passait par une fonction globale qui ignorait l'injection, donc les tests auraient silencieusement utilisé le vrai plugin de plateforme (et échoué) sans le détecter. Corrigé.
- `Note.valeur` est casté `decimal:2` côté Laravel, donc sérialisé en JSON comme une **chaîne** (`"15.50"`), pas un nombre — `Note.fromJson` avec `as num?` levait une exception au premier chargement d'une note déjà saisie (préremplissage de `NotesScreen`). Corrigé, avec un test de régression.

Un écart de contrat (pas un bug introduit ici, mais qui aurait cassé l'affichage) : les champs `date` Laravel (dont `Evaluation.date_evaluation`) sont sérialisés en ISO 8601 complet (`"2026-11-05T00:00:00.000000Z"`), pas au format `date` (`YYYY-MM-DD`) promis par `docs/openapi.yaml` — aucun `serializeDate` global dans l'API. Corrigé côté client mobile uniquement (troncature à l'affichage) plutôt que de changer la sérialisation globale de l'API, hors scope de cette session.

**Non vérifié dans cette session** : rendu et interactions sur un vrai appareil ou émulateur (aucun émulateur Android configuré dans cet environnement — seuls macOS/web/un iPhone physique apparaissent dans `flutter doctor`), et surtout — le support SQLite du plugin `sqflite` sur la cible web est incertain/limité ; `flutter build web` compile mais ne prouve rien sur le comportement réel de la file locale hors Android/iOS, les vraies cibles de cette fonctionnalité. À tester avec `flutter run` sur un appareil Android réel, y compris en coupant le réseau en cours d'appel, avant de considérer le mode hors-ligne comme validé.
