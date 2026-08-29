# Contrat d'API — MVP Gestion scolaire

**Réfère à** : [`database-schema.md`](./database-schema.md), [`mvp-scope.md`](./mvp-scope.md)
**Spécification complète** : [`openapi.yaml`](./openapi.yaml) — importable dans Swagger UI, Postman, ou pour générer des clients/mocks
**Version** : 1.0
**Date** : 29 août 2026

## Pourquoi l'API avant les maquettes

Le schéma de base de données est posé ; le contrat d'API est ce qui débloque le plus de monde à la fois. Une fois figé, l'équipe backend l'implémente pendant que les équipes mobile et web développent contre des mocks générés depuis la spec, sans attendre que le backend soit fini. Les maquettes UX/UI, elles, peuvent progresser en parallèle sans bloquer le développement — l'ordre inverse aurait laissé trois équipes techniques attendre un livrable design.

---

## 1. Conventions transverses

| Sujet | Règle |
|---|---|
| Base URL | `/api/v1` — tout changement incompatible part sur `/api/v2`, jamais de rupture silencieuse sur v1 |
| Authentification | Bearer JWT (Sanctum), obtenu via `POST /auth/login`. Compte créé par la direction/import — pas d'auto-inscription en MVP |
| Contexte établissement | Résolu automatiquement si l'utilisateur n'a qu'un seul rattachement actif. Sinon (ex. parent multi-établissements), le header `X-Etablissement-Id` est requis |
| Pagination | `?page=&per_page=` (défaut 25, max 100) ; réponse enveloppée `{ data: [...], meta: { page, per_page, total } }` |
| Erreurs | Format unique `{ error: { code, message, details } }`, codes HTTP standards (400, 401, 403, 404, 409, 422, 500) |
| Écritures en lot | Saisie de notes et appel de présences acceptent un tableau en une seule requête — pas un round-trip par élève |
| Synchronisation hors-ligne | `POST /sync/batch` est idempotent par `sync_uuid` : rejouer la même requête n'a aucun effet supplémentaire |

---

## 2. Index des endpoints

| Méthode | Chemin | Description | Rôles |
|---|---|---|---|
| POST | `/auth/login` | Connexion (téléphone/email + mot de passe) | tous |
| GET | `/auth/me` | Profil et rattachements de l'utilisateur connecté | tous |
| GET, POST | `/etablissements` | Lister / créer un établissement | super_admin |
| GET, PATCH | `/etablissements/{id}` | Détail / mise à jour d'un établissement | super_admin, admin_etablissement |
| GET, POST | `/etablissements/{id}/utilisateurs` | Lister / créer un compte rattaché | admin_etablissement |
| POST | `/etablissements/{id}/utilisateurs/import` | Import en masse (CSV) | admin_etablissement |
| GET, POST | `/etablissements/{id}/annees-scolaires` | Lister / créer une année scolaire | admin_etablissement |
| PATCH | `/annees-scolaires/{id}` | Activer / archiver une année | admin_etablissement |
| GET, POST | `/etablissements/{id}/classes` | Lister / créer une classe | admin_etablissement |
| GET, PATCH | `/classes/{id}` | Détail / mise à jour d'une classe | admin_etablissement |
| GET | `/classes/{id}/eleves` | Élèves inscrits dans la classe | admin_etablissement, enseignant |
| GET, POST | `/etablissements/{id}/matieres` | Lister / créer une matière | admin_etablissement |
| GET | `/classes/{id}/matieres` | Matières enseignées dans la classe, avec l'enseignant affecté | tous les rattachés à l'établissement |
| PUT | `/classes/{classeId}/matieres/{matiereId}/enseignant` | Affecter un enseignant à une matière de la classe | admin_etablissement |
| GET, POST | `/classes/{id}/emploi-du-temps` | Consulter / créer un créneau | admin_etablissement, enseignant, parent |
| GET, POST | `/etablissements/{id}/eleves` | Lister / créer un élève | admin_etablissement, personnel_administratif |
| POST | `/etablissements/{id}/eleves/import` | Import en masse (CSV) | admin_etablissement |
| GET | `/eleves/{id}` | Dossier élève | admin_etablissement, enseignant, parent |
| POST | `/eleves/{id}/inscriptions` | Inscrire l'élève dans une classe | admin_etablissement |
| GET, POST | `/eleves/{id}/parents` | Lister / lier un parent à l'élève | admin_etablissement, personnel_administratif |
| GET, POST | `/etablissements/{id}/periodes` | Lister / créer une période d'évaluation (trimestre) | admin_etablissement |
| PATCH | `/periodes/{id}` | Clôturer une période (verrouille la saisie de notes) | admin_etablissement |
| POST | `/classes/{classeId}/matieres/{matiereId}/evaluations` | Créer une évaluation | enseignant |
| GET | `/evaluations/{id}/notes` | Notes saisies pour l'évaluation | enseignant, admin_etablissement |
| PUT | `/evaluations/{id}/notes` | Saisie en lot des notes de la classe | enseignant |
| POST | `/periodes/{id}/bulletins/generer` | Générer les bulletins d'une classe | admin_etablissement |
| GET | `/eleves/{id}/bulletins` | Historique des bulletins | admin_etablissement, parent |
| POST | `/bulletins/{id}/valider` | Valider et publier un bulletin | admin_etablissement |
| POST | `/classes/{id}/presences/appel` | Enregistrer l'appel du jour (lot) | enseignant |
| GET | `/classes/{id}/presences` | Présences d'une classe (`?date=`) | enseignant, admin_etablissement |
| GET | `/eleves/{id}/presences` | Historique de présence d'un élève | parent, admin_etablissement |
| GET, POST | `/etablissements/{id}/frais-scolarite` | Barème des frais | admin_etablissement |
| GET | `/eleves/{id}/echeances` | Échéancier de l'élève | admin_etablissement, personnel_administratif, parent de l'élève |
| POST | `/eleves/{id}/echeances` | Ajouter une échéance (une tranche du barème) | admin_etablissement, personnel_administratif |
| POST | `/echeances/{id}/paiements` | Enregistrer un encaissement manuel | personnel_administratif |
| GET | `/paiements/{id}/recu` | Reçu PDF | personnel_administratif, parent |
| GET, POST | `/etablissements/{id}/annonces` | Consulter / publier une annonce | admin_etablissement (post), tous (get) |
| POST | `/sync/batch` | Synchroniser un lot d'écritures hors-ligne (notes, présences) | enseignant |

La spécification complète — schémas de requête/réponse, codes d'erreur, exemples — est dans [`openapi.yaml`](./openapi.yaml).
