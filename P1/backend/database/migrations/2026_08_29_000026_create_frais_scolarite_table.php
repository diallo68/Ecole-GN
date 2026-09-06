<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Traduction directe de db/migrations/017_frais_scolarite.sql, déjà testée contre
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
CREATE TABLE frais_scolarite (
    id                  bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    etablissement_id    bigint NOT NULL REFERENCES etablissements(id) ON DELETE CASCADE,
    annee_scolaire_id   bigint NOT NULL REFERENCES annees_scolaires(id) ON DELETE CASCADE,
    niveau              varchar(30) NOT NULL,
    montant_total       numeric(10,2) NOT NULL CHECK (montant_total >= 0),
    created_at          timestamptz NOT NULL DEFAULT now(),
    updated_at          timestamptz NOT NULL DEFAULT now(),
    UNIQUE (annee_scolaire_id, niveau)
);
CREATE INDEX idx_frais_etablissement ON frais_scolarite(etablissement_id);
SQL
        );
    }

    public function down(): void
    {
        DB::statement('DROP TABLE IF EXISTS frais_scolarite CASCADE');
    }
};
