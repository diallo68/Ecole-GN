# Migrations SQL — MVP Gestion scolaire

Migrations SQL brutes, indépendantes de tout framework (le choix Laravel vs NestJS reste ouvert — voir `docs/architecture-technique.md` §02). Elles implémentent exactement [`docs/database-schema.md`](../docs/database-schema.md) et ont été **exécutées et vérifiées** contre PostgreSQL 16.

## Appliquer les migrations

```bash
createdb ecole_gn_dev
for f in migrations/*.sql; do psql -d ecole_gn_dev -v ON_ERROR_STOP=1 -f "$f"; done
```

Puis créer le rôle applicatif (une fois par environnement) :

```bash
psql -d ecole_gn_dev -v app_role_password="'change-moi'" -f setup_app_role.sql
```

## ⚠️ Le rôle applicatif n'est pas optionnel

Vérifié en pratique lors de l'écriture de ce schéma : Postgres exempte par défaut le **propriétaire** d'une table de ses propres politiques RLS. Se connecter avec le rôle qui a fait tourner les migrations désactive silencieusement l'isolation multi-établissement — aucune erreur, toutes les données de tous les établissements deviennent visibles.

**L'API de production doit se connecter avec `app_ecole_gn`, jamais avec le rôle propriétaire ni un superuser.** Testé avec ce jeu de données :

```sql
SET ROLE app_ecole_gn;
SET app.current_etablissement_id = '1';
SELECT reference_recu FROM paiements;  -- ne renvoie que les paiements de l'établissement 1
```

Sans `SET app.current_etablissement_id`, les tables scopées renvoient 0 ligne (échec fermé, pas d'erreur bloquante) — l'API doit donc **toujours** poser cette variable de session avant la première requête d'une transaction authentifiée.

## Ordre des fichiers

Numérotés dans l'ordre de dépendance des clés étrangères — à exécuter dans l'ordre. `022_rls_policies.sql` doit être le dernier appliqué (les tables doivent exister avant qu'on y active RLS).
