<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Traduction directe de db/migrations/010_parent_eleve.sql, déjà testée contre
 * PostgreSQL 16 (voir docs/database-schema.md §5). Le SQL brut est repris
 * tel quel plutôt que retraduit dans le DSL Schema::, pour ne pas risquer
 * de diverger de ce qui a été vérifié.
 */
return new class extends Migration
{
    /**
     * Rôle propriétaire des tables — voir config/database.php et
     * db/README.md (RLS ne filtre rien pour le propriétaire).
     */
    protected $connection = 'pgsql_migrate';

    public function up(): void
    {
        DB::unprepared(<<<'SQL'
-- Table de liaison many-to-many. Volontairement SANS colonne
-- etablissement_id : un parent peut être lié à des enfants scolarisés
-- dans des établissements différents (cahier des charges §3). Voir
-- 022_rls_policies.sql pour la note sur son exclusion du périmètre RLS.
CREATE TABLE parent_eleve (
    id                      bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    utilisateur_id          bigint NOT NULL REFERENCES utilisateurs(id) ON DELETE CASCADE,
    eleve_id                bigint NOT NULL REFERENCES eleves(id) ON DELETE CASCADE,
    lien                    varchar(20) NOT NULL
                              CHECK (lien IN ('pere','mere','tuteur_legal','autre')),
    est_contact_principal   boolean NOT NULL DEFAULT false,
    created_at              timestamptz NOT NULL DEFAULT now(),
    UNIQUE (utilisateur_id, eleve_id)
);
CREATE INDEX idx_parent_eleve_utilisateur ON parent_eleve(utilisateur_id);
CREATE INDEX idx_parent_eleve_eleve       ON parent_eleve(eleve_id);
SQL
        );
    }

    public function down(): void
    {
        DB::statement('DROP TABLE IF EXISTS parent_eleve CASCADE');
    }
};
