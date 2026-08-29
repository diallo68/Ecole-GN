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

## Ce qui est fait, et ce qui ne l'est pas

**Fait et vérifié en HTTP réel** (même scénario que le backend/web : payloads et en-têtes identiques à travers `curl`, comparés à ce que le code Dart envoie) : connexion, chargement du profil et des rattachements, « mes classes » via le filtre `enseignant_id`, appel d'une classe entière en une requête avec `sync_uuid` par élève.

**PAS fait dans cette première version — chemin en ligne uniquement** : `AppelScreen` envoie directement au serveur. La vraie promesse hors-ligne du cahier des charges (`docs/architecture-technique.md` §04 : file d'attente locale SQLite, écritures rejouées via `POST /sync/batch` au retour du réseau) n'est pas construite. Aujourd'hui, un appel fait sans réseau échoue avec un message d'erreur plutôt que d'être mis en attente. `sync_uuid` est déjà posé par élève pour que ce chemin puisse être branché sans changer le format d'échange, mais la persistance locale reste à construire.

## Vérifié / non vérifié

Vérifié : `flutter analyze` (aucun problème), `flutter test` (2 tests), `flutter build web` (compilation réelle), et la chaîne réseau complète comparée manuellement à ce que chaque écran envoie.

Non vérifié dans cette session : rendu et interactions sur un vrai appareil ou émulateur (aucun émulateur Android configuré dans cet environnement — seuls macOS/web/un iPhone physique apparaissent dans `flutter doctor`). À tester avec `flutter run` sur votre machine avant de considérer ces écrans comme définitivement validés.
