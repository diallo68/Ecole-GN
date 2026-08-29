-- Rôle applicatif dédié — à exécuter une fois par cluster/environnement,
-- séparément des migrations numérotées (qui, elles, tournent sous le rôle
-- propriétaire des tables).
--
-- Piège vérifié en pratique : Postgres exempte par défaut le PROPRIÉTAIRE
-- d'une table de ses propres politiques RLS. Si l'API se connectait avec le
-- même rôle que celui qui a fait tourner les migrations, l'isolation
-- multi-établissement serait silencieusement désactivée — aucune erreur,
-- juste toutes les données de tous les établissements visibles. L'API DOIT
-- se connecter avec ce rôle applicatif, jamais avec le rôle propriétaire ni
-- un superuser.

DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'app_ecole_gn') THEN
    CREATE ROLE app_ecole_gn LOGIN PASSWORD :'app_role_password';
  END IF;
END
$$;

GRANT USAGE ON SCHEMA public TO app_ecole_gn;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_ecole_gn;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_ecole_gn;

-- Pour que les futures tables (migrations suivantes) héritent des mêmes
-- droits sans script de GRANT manuel à chaque fois :
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO app_ecole_gn;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO app_ecole_gn;

-- Usage :
--   psql -d ecole_gn_dev -v app_role_password="'change-moi'" -f setup_app_role.sql
