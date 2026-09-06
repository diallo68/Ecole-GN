# Gandal — Web

Frontend Next.js de **Gandal**, plateforme de soutien scolaire pour la Guinée. Voir [`../docs/cahier-des-charges.md`](../docs/cahier-des-charges.md).

## Démarrage

```bash
npm install
cp .env.local.example .env.local   # renseigner NEXT_PUBLIC_API_URL (backend Gandal)
npm run dev
```

Nécessite le [backend Gandal](../backend) démarré (`npm run dev` dans `P2/backend`).

## Structure

```
src/
  app/            Pages (App Router) : accueil, login, register (OTP par email),
                   repetiteurs (liste + fiche + réservation), quiz (liste + passage),
                   dashboard (agenda répétiteur / mes réservations élève-parent)
  components/     Navbar
  lib/api.ts      Client HTTP vers le backend (auth, répétiteurs, réservations, quiz, contenu)
  store/          Zustand — session utilisateur (persistée en localStorage)
  types/          Types partagés (miroir des modèles backend)
```

## État du scaffold

Flux d'authentification complet (email + OTP), recherche/fiche répétiteur avec réservation,
quiz jouables avec correction. **Pas encore fait** : espace répétiteur pour publier
vidéos/supports/exercices et planifier des classes virtuelles, messagerie, avis, back-office
admin (modération, création de quiz), paiement.

Build vérifié (`npm run build`) — toutes les pages compilent.
