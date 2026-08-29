<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Traduction directe de db/migrations/016_presences.sql, déjà testée contre
 * PostgreSQL 16 (voir docs/database-schema.md §5). Le SQL brut est repris
 * tel quel plutôt que retraduit dans le DSL Schema::, pour ne pas risquer
 * de diverger de ce qui a été vérifié.
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::unprepared(<<<'SQL'
CREATE TABLE presences (
    id              bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    eleve_id        bigint NOT NULL REFERENCES eleves(id) ON DELETE CASCADE,
    classe_id       bigint NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    date            date NOT NULL,
    statut          varchar(20) NOT NULL
                      CHECK (statut IN ('present','absent','retard','excuse')),
    saisi_par       bigint NOT NULL REFERENCES utilisateurs(id) ON DELETE RESTRICT,
    sync_uuid       uuid NOT NULL DEFAULT gen_random_uuid() UNIQUE,
    statut_sync     varchar(20) NOT NULL DEFAULT 'synced'
                      CHECK (statut_sync IN ('synced','pending')),
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now(),
    UNIQUE (eleve_id, classe_id, date)
);
CREATE INDEX idx_presences_classe_date ON presences(classe_id, date);
SQL
        );
    }

    public function down(): void
    {
        DB::statement('DROP TABLE IF EXISTS presences CASCADE');
    }
};
