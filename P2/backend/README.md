# Gandal — Backend

Backend Node.js/Express de **Gandal**, plateforme de soutien scolaire pour la Guinée. Voir [`../docs/cahier-des-charges.md`](../docs/cahier-des-charges.md) pour la spécification complète.

## Démarrage

```bash
npm install
cp .env.example .env   # puis renseigner MONGO_URI, JWT_SECRET, AT_API_KEY, CLOUDINARY_*
npm run dev             # avec nodemon
# ou
npm start
```

Nécessite une instance MongoDB accessible (locale ou Atlas) via `MONGO_URI`.

## Structure

```
src/
  config/       Config env + connexion MongoDB
  models/       Schémas Mongoose (User, Reservation, ClasseVirtuelle, Video, Support, Exercice, Quiz, QuizAttempt, Conversation, Message, Review)
  controllers/  Logique métier par domaine
  routes/       Définition des endpoints (montés sous /api)
  middlewares/  Auth JWT, logger
  utils/        Helpers (tokens, validation Joi)
server.js       Point d'entrée (Express + Socket.io)
```

## Rôles utilisateurs

Un seul modèle `User` avec un champ `role` : `eleve`, `parent`, `repetiteur`, `admin`. Les champs spécifiques à un rôle sont regroupés dans des sous-objets (`eleve.*`, `repetiteur.*`).

## Endpoints principaux

| Domaine | Base | Détail |
|---|---|---|
| Auth | `/api/auth` | `send-code`, `register`, `login`, `me` |
| Répétiteurs | `/api/repetiteurs` | recherche publique, profil, `admin/all` (liste filtrable par statut) + `:id/moderate` |
| Réservations | `/api/reservations` | création, agenda répétiteur, mes réservations |
| Contenu | `/api/content` | vidéos/supports/exercices, publiés par répétiteur |
| Classes virtuelles | `/api/classes-virtuelles` | planification, lien meet.jit.si auto-généré |
| Quiz | `/api/quiz` | liste/passage/correction (public) + `admin/all`, `admin/:id`, `admin/:id/publish`, suppression (admin) |
| Messagerie | `/api/messaging` | conversations + messages |
| Avis | `/api/reviews` | notation d'un répétiteur après session |

## État du scaffold

Structure et flux d'authentification complets. Logique métier des endpoints CRUD volontairement simple (pas encore de pagination, de recherche avancée, ni de webhooks paiement) — à enrichir fonctionnalité par fonctionnalité. Pas encore de tests automatisés.
