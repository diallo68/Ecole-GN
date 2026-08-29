<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Traduction directe de db/migrations/022_rls_policies.sql, déjà testée contre
 * PostgreSQL 16 (voir docs/database-schema.md §5). Le SQL brut est repris
 * tel quel plutôt que retraduit dans le DSL Schema::, pour ne pas risquer
 * de diverger de ce qui a été vérifié.
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::unprepared(<<<'SQL'
-- Isolation multi-établissement (Row-Level Security).
--
-- L'API pose, au début de chaque transaction, une fois le JWT vérifié :
--   SET app.current_etablissement_id = '<id>';
--
-- Tables portant etablissement_id directement : policy simple sur la colonne.
-- Tables sans cette colonne : policy par EXISTS vers la table parente qui la
-- porte. Deux tables sont volontairement exclues (voir notes en bas).

-- Fonction utilitaire : lit la session var, NULL si absente (ne bloque pas
-- les connexions super-admin / migrations tant qu'aucune policy USING
-- n'y fait explicitement référence).
CREATE OR REPLACE FUNCTION current_etablissement_id() RETURNS bigint AS $$
  SELECT NULLIF(current_setting('app.current_etablissement_id', true), '')::bigint;
$$ LANGUAGE sql STABLE;

-- ---- Tables avec etablissement_id direct ----

ALTER TABLE etablissements ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON etablissements
  USING (id = current_etablissement_id());

ALTER TABLE etablissement_utilisateurs ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON etablissement_utilisateurs
  USING (etablissement_id = current_etablissement_id());

ALTER TABLE annees_scolaires ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON annees_scolaires
  USING (etablissement_id = current_etablissement_id());

ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON classes
  USING (etablissement_id = current_etablissement_id());

ALTER TABLE matieres ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON matieres
  USING (etablissement_id = current_etablissement_id());

ALTER TABLE eleves ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON eleves
  USING (etablissement_id = current_etablissement_id());

ALTER TABLE periodes_evaluation ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON periodes_evaluation
  USING (etablissement_id = current_etablissement_id());

ALTER TABLE frais_scolarite ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON frais_scolarite
  USING (etablissement_id = current_etablissement_id());

ALTER TABLE annonces ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON annonces
  USING (etablissement_id = current_etablissement_id());

-- ---- Tables scopées via la table parente (pas de colonne directe) ----

ALTER TABLE classe_matiere_enseignant ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON classe_matiere_enseignant
  USING (EXISTS (
    SELECT 1 FROM classes c
    WHERE c.id = classe_matiere_enseignant.classe_id
      AND c.etablissement_id = current_etablissement_id()
  ));

ALTER TABLE inscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON inscriptions
  USING (EXISTS (
    SELECT 1 FROM classes c
    WHERE c.id = inscriptions.classe_id
      AND c.etablissement_id = current_etablissement_id()
  ));

ALTER TABLE emplois_du_temps ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON emplois_du_temps
  USING (EXISTS (
    SELECT 1 FROM classes c
    WHERE c.id = emplois_du_temps.classe_id
      AND c.etablissement_id = current_etablissement_id()
  ));

ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON evaluations
  USING (EXISTS (
    SELECT 1 FROM periodes_evaluation p
    WHERE p.id = evaluations.periode_id
      AND p.etablissement_id = current_etablissement_id()
  ));

ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON notes
  USING (EXISTS (
    SELECT 1 FROM eleves e
    WHERE e.id = notes.eleve_id
      AND e.etablissement_id = current_etablissement_id()
  ));

ALTER TABLE bulletins ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON bulletins
  USING (EXISTS (
    SELECT 1 FROM eleves e
    WHERE e.id = bulletins.eleve_id
      AND e.etablissement_id = current_etablissement_id()
  ));

ALTER TABLE presences ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON presences
  USING (EXISTS (
    SELECT 1 FROM classes c
    WHERE c.id = presences.classe_id
      AND c.etablissement_id = current_etablissement_id()
  ));

ALTER TABLE echeances ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON echeances
  USING (EXISTS (
    SELECT 1 FROM eleves e
    WHERE e.id = echeances.eleve_id
      AND e.etablissement_id = current_etablissement_id()
  ));

ALTER TABLE paiements ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON paiements
  USING (EXISTS (
    SELECT 1 FROM echeances ec
    JOIN eleves e ON e.id = ec.eleve_id
    WHERE ec.id = paiements.echeance_id
      AND e.etablissement_id = current_etablissement_id()
  ));

-- ---- Exclusions volontaires (pas de RLS par établissement) ----
--
-- utilisateurs        : table globale, un compte n'appartient à aucun
--                        établissement en propre (voir 001).
-- etablissement_utilisateurs : gère lui-même le lien, cf. ci-dessus.
-- parent_eleve        : un parent est volontairement lié à des enfants de
--                        plusieurs établissements (cahier des charges §3) ;
--                        une policy par etablissement_id casserait ce lien.
--                        L'accès est filtré en application (utilisateur_id
--                        = utilisateur courant, ou eleve_id dans un
--                        établissement que l'appelant administre).
-- notifications       : boîte de réception scopée par utilisateur_id, pas
--                        par établissement (un parent reçoit des notifs de
--                        plusieurs écoles).
SQL
        );
    }

    public function down(): void
    {
        DB::unprepared(<<<'SQL'
DROP POLICY IF EXISTS tenant_isolation ON etablissements;
ALTER TABLE etablissements DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON etablissement_utilisateurs;
ALTER TABLE etablissement_utilisateurs DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON annees_scolaires;
ALTER TABLE annees_scolaires DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON classes;
ALTER TABLE classes DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON matieres;
ALTER TABLE matieres DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON eleves;
ALTER TABLE eleves DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON periodes_evaluation;
ALTER TABLE periodes_evaluation DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON frais_scolarite;
ALTER TABLE frais_scolarite DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON annonces;
ALTER TABLE annonces DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON classe_matiere_enseignant;
ALTER TABLE classe_matiere_enseignant DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON inscriptions;
ALTER TABLE inscriptions DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON emplois_du_temps;
ALTER TABLE emplois_du_temps DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON evaluations;
ALTER TABLE evaluations DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON notes;
ALTER TABLE notes DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON bulletins;
ALTER TABLE bulletins DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON presences;
ALTER TABLE presences DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON echeances;
ALTER TABLE echeances DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON paiements;
ALTER TABLE paiements DISABLE ROW LEVEL SECURITY;
DROP FUNCTION IF EXISTS current_etablissement_id();
SQL
        );
    }
};
