<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Traduction directe de db/migrations/007_classe_matiere_enseignant.sql, déjà testée contre
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
CREATE TABLE classe_matiere_enseignant (
    id             bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    classe_id      bigint NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    matiere_id     bigint NOT NULL REFERENCES matieres(id) ON DELETE CASCADE,
    enseignant_id  bigint NOT NULL REFERENCES utilisateurs(id) ON DELETE RESTRICT,
    coefficient    numeric(3,1),
    created_at     timestamptz NOT NULL DEFAULT now(),
    updated_at     timestamptz NOT NULL DEFAULT now(),
    UNIQUE (classe_id, matiere_id)
);
CREATE INDEX idx_cme_classe      ON classe_matiere_enseignant(classe_id);
CREATE INDEX idx_cme_enseignant  ON classe_matiere_enseignant(enseignant_id);
SQL
        );
    }

    public function down(): void
    {
        DB::statement('DROP TABLE IF EXISTS classe_matiere_enseignant CASCADE');
    }
};
