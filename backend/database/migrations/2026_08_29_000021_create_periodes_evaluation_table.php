<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Traduction directe de db/migrations/012_periodes_evaluation.sql, déjà testée contre
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
CREATE TABLE periodes_evaluation (
    id                  bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    etablissement_id    bigint NOT NULL REFERENCES etablissements(id) ON DELETE CASCADE,
    annee_scolaire_id   bigint NOT NULL REFERENCES annees_scolaires(id) ON DELETE CASCADE,
    libelle             varchar(30) NOT NULL,
    date_debut          date NOT NULL,
    date_fin            date NOT NULL,
    statut              varchar(20) NOT NULL DEFAULT 'en_cours'
                          CHECK (statut IN ('en_cours','cloturee')),
    created_at          timestamptz NOT NULL DEFAULT now(),
    updated_at          timestamptz NOT NULL DEFAULT now(),
    UNIQUE (annee_scolaire_id, libelle),
    CHECK (date_fin > date_debut)
);
CREATE INDEX idx_periodes_etablissement ON periodes_evaluation(etablissement_id);
SQL
        );
    }

    public function down(): void
    {
        DB::statement('DROP TABLE IF EXISTS periodes_evaluation CASCADE');
    }
};
