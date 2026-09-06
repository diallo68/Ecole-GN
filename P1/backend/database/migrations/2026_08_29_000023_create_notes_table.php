<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Traduction directe de db/migrations/014_notes.sql, déjà testée contre
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
CREATE TABLE notes (
    id              bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    evaluation_id   bigint NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
    eleve_id        bigint NOT NULL REFERENCES eleves(id) ON DELETE CASCADE,
    valeur          numeric(4,2) CHECK (valeur IS NULL OR (valeur >= 0 AND valeur <= 20)),
    appreciation    text,
    saisie_par      bigint NOT NULL REFERENCES utilisateurs(id) ON DELETE RESTRICT,
    sync_uuid       uuid NOT NULL DEFAULT gen_random_uuid() UNIQUE,
    statut_sync     varchar(20) NOT NULL DEFAULT 'synced'
                      CHECK (statut_sync IN ('synced','pending')),
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now(),
    UNIQUE (evaluation_id, eleve_id)
);
CREATE INDEX idx_notes_eleve ON notes(eleve_id);
SQL
        );
    }

    public function down(): void
    {
        DB::statement('DROP TABLE IF EXISTS notes CASCADE');
    }
};
