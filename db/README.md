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

Numérotés dans l'ordre de dépendance des clés étrangères — à exécuter dans l'ordre. `022_rls_policies.sql` doit venir après la création de toutes les tables (les tables doivent exister avant qu'on y active RLS). `023` et `024` affinent 022 — voir ci-dessous.

## ⚠️ Deux pièges RLS supplémentaires, trouvés en câblant le backend (pas en psql manuel)

**023 — un super-admin ne peut pas lister `GET /etablissements`.** La policy `tenant_isolation` sur `etablissements` exige `app.current_etablissement_id` — mais cet endpoint n'a par construction aucun établissement précis dans son URL. `023_super_admin_rls_bypass.sql` ajoute une policy **permissive** (les policies RLS se combinent en OR, pas en AND) qui laisse passer une ligne quand `app.is_super_admin = 'true'`, posé par l'application après vérification applicative du rôle — la RLS reflète ici une décision déjà prise, elle n'accorde aucun privilège par elle-même.

**024 — vérifier l'accès d'un utilisateur interroge une table déjà protégée par la RLS qu'on cherche justement à configurer.** Pour savoir si l'utilisateur connecté a accès à l'établissement demandé, l'API interroge `etablissement_utilisateurs` — mais cette table exige elle aussi `app.current_etablissement_id`, qui n'est pas encore posé à ce stade puisque c'est justement ce qu'on est en train de déterminer. Sans correctif, cette vérification renvoie toujours 0 ligne et bloque même l'utilisateur légitime. `024_own_rattachement_rls_bypass.sql` ajoute une policy permissive : un utilisateur peut toujours voir **ses propres** lignes de rattachement (`utilisateur_id = app.current_utilisateur_id`), quel que soit le contexte tenant déjà déterminé ou non. Ce n'est pas une élévation de privilège — consulter ses propres rattachements est le fait qui permet justement de fixer le contexte.

Les deux bugs n'apparaissent qu'en interrogeant les tables *via l'application* (donc sous le rôle `app_ecole_gn`, avec l'enchaînement réel des requêtes) — un test `psql` manuel qui pose la bonne variable à la main avant de lire ne les révèle pas. Voir `backend/app/Http/Middleware/ResolveEtablissementContext.php` pour l'ordre exact dans lequel les variables de session sont posées.

## Base de test — PostgreSQL, pas SQLite

`backend/phpunit.xml` fait tourner les tests contre une vraie base PostgreSQL (`ecole_gn_test`), jamais SQLite : SQLite ne supporte pas la Row-Level Security, et cette RLS a déjà produit 3 bugs réels rien que dans ce dossier. La faire tourner sous SQLite en test l'aurait laissée complètement hors de portée de toute suite automatisée.

```bash
createdb ecole_gn_test
psql -d ecole_gn_test -v app_role_password="'test-password'" -f setup_app_role.sql
# les migrations tournent automatiquement via RefreshDatabaseAvecProprietaire
# (backend/tests/Concerns/) à chaque exécution de la suite
```

**Piège PHP trouvé en écrivant les tests, distinct des pièges RLS ci-dessus** : surcharger `migrateFreshUsing()` dans `Tests\TestCase` pour forcer `--database=pgsql_migrate` ne suffit pas — en PHP, une méthode apportée par un trait utilisé dans la classe de test (`RefreshDatabase::migrateFreshUsing()`) prend le pas sur une méthode héritée de la classe parente. La surcharge était silencieusement ignorée, et `migrate:fresh` retombait sur le rôle applicatif (`app_ecole_gn`), qui n'a pas le droit de créer de table. Corrigé par `backend/tests/Concerns/RefreshDatabaseAvecProprietaire.php`, un trait qui alias la méthode d'origine puis la surcharge lui-même — les tests doivent l'utiliser à la place de `RefreshDatabase` directement.
