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
- `lib/screens/` — Connexion, Mes classes (`?enseignant_id=`), Appel.

## Mode hors-ligne

`AppelScreen` écrit **toujours** dans une file locale (`lib/offline/`, SQLite via `sqflite`) avant tout appel réseau — la validation de l'appel réussit immédiatement, avec ou sans réseau. `SyncService` tente ensuite une synchronisation (`POST /sync/batch`) : immédiatement après l'écriture si le réseau répond, automatiquement à la reconnexion (`connectivity_plus`), ou manuellement via le bandeau affiché sur l'écran Mes classes tant qu'il reste des écritures en attente ou en erreur.

Ce que ce mécanisme ne fait PAS encore : rejouer la file au tout premier lancement de l'app avant que l'enseignant n'ouvre une classe (elle ne se déclenche qu'après une écriture ou un changement de connectivité) ; purger les écritures en erreur trop anciennes ; et la saisie de notes n'utilise pas encore cette file (seul l'appel de présence le fait pour l'instant).

## Vérifié / non vérifié

Vérifié : `flutter analyze` (propre), `flutter test` (10 tests — dont l'interprétation des réponses `/sync/batch` et un vrai aller-retour SQLite via `sqflite_common_ffi`), `flutter build web` (compilation réelle), et la chaîne réseau complète (connexion, mes classes, `/sync/batch`) comparée manuellement à ce que chaque écran envoie.

Un vrai bug a été trouvé en écrivant le test d'intégration de la base locale (pas en le contournant) : la factory SQLite injectable ne l'était pas vraiment — `_ouvrir()` passait par une fonction globale qui ignorait l'injection, donc les tests auraient silencieusement utilisé le vrai plugin de plateforme (et échoué) sans le détecter. Corrigé.

**Non vérifié dans cette session** : rendu et interactions sur un vrai appareil ou émulateur (aucun émulateur Android configuré dans cet environnement — seuls macOS/web/un iPhone physique apparaissent dans `flutter doctor`), et surtout — le support SQLite du plugin `sqflite` sur la cible web est incertain/limité ; `flutter build web` compile mais ne prouve rien sur le comportement réel de la file locale hors Android/iOS, les vraies cibles de cette fonctionnalité. À tester avec `flutter run` sur un appareil Android réel, y compris en coupant le réseau en cours d'appel, avant de considérer le mode hors-ligne comme validé.
