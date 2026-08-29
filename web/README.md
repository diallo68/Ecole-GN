# Web — back-office direction/administration

React + Vite + TypeScript + Tailwind, contre l'API décrite dans [`../docs/openapi.yaml`](../docs/openapi.yaml). Voir `../docs/architecture-technique.md` §02 pour le choix de stack.

## Démarrer en local

Le backend doit tourner (`cd ../backend && php artisan serve --port=8123`, Postgres démarré). Puis :

```bash
npm install
npm run dev
```

`vite.config.ts` relaie `/api/*` vers `http://127.0.0.1:8123` — pas de souci CORS en dev, pas de config d'URL d'API à changer entre environnements.

## Structure

- `src/lib/api.ts` — client HTTP minimal (fetch, pas axios), pose `Authorization` et `X-Etablissement-Id` automatiquement.
- `src/lib/types.ts` — types alignés à la main sur `openapi.yaml` (pas de génération automatique pour l'instant, le contrat évolue vite).
- `src/auth/` — contexte d'authentification (token en `localStorage`), garde de route.
- `src/pages/` — un écran par page.

## Vérifié

Chaîne complète testée via le même proxy que celui qu'utilise l'app (login → `/auth/me` → création d'élève → listing), avec les mêmes en-têtes que le client React pose réellement. La navigation/le rendu dans un vrai navigateur n'a en revanche pas été vérifié par clics dans cette session (extension Chrome non connectée) — à faire avant de considérer cet écran comme définitivement validé.
