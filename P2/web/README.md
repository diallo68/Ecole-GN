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
  app/
    (public)        accueil, login, register (OTP par email), repetiteurs (liste + fiche
                     + réservation), quiz (liste + passage + correction)
    dashboard/       agenda répétiteur ou réservations élève-parent
    dashboard/repetiteur/
                     profil, contenu (vidéos/supports/exercices), classes (classes virtuelles)
    admin/           back-office : modération répétiteurs, gestion des quiz (créer/publier/
                     dépublier/supprimer) — accès restreint au rôle admin
  components/        Navbar (liens contextuels selon rôle)
  lib/api.ts         Client HTTP vers le backend (auth, répétiteurs, réservations, quiz,
                     contenu, classes virtuelles — versions publiques et admin)
  store/             Zustand — session utilisateur (persistée en localStorage)
  types/             Types partagés (miroir des modèles backend)
```

## État du scaffold

Flux d'authentification complet (email + OTP), recherche/fiche répétiteur avec réservation,
quiz jouables avec correction, espace répétiteur (profil, contenu pédagogique, classes
virtuelles), back-office admin (modération répétiteurs, création/publication de quiz).

**Pas encore fait** : messagerie, avis, upload de fichiers (les URLs de vidéos/supports sont
saisies manuellement pour l'instant, pas d'intégration Cloudinary côté formulaire), paiement.

Build vérifié (`npm run build`) — 16 pages compilent sans erreur TypeScript.
