<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Traduction directe de db/migrations/009_inscriptions.sql, déjà testée contre
 * PostgreSQL 16 (voir docs/database-schema.md §5). Le SQL brut est repris
 * tel quel plutôt que retraduit dans le DSL Schema::, pour ne pas risquer
 * de diverger de ce qui a été vérifié.
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::unprepared(<<<'SQL'
CREATE TABLE inscriptions (
    id                  bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    eleve_id            bigint NOT NULL REFERENCES eleves(id) ON DELETE CASCADE,
    classe_id           bigint NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    annee_scolaire_id   bigint NOT NULL REFERENCES annees_scolaires(id) ON DELETE CASCADE,
    date_inscription    date NOT NULL DEFAULT current_date,
    statut              varchar(20) NOT NULL DEFAULT 'inscrit'
                          CHECK (statut IN ('inscrit','abandonne')),
    created_at          timestamptz NOT NULL DEFAULT now(),
    updated_at          timestamptz NOT NULL DEFAULT now(),
    UNIQUE (eleve_id, annee_scolaire_id)
);
CREATE INDEX idx_inscriptions_classe ON inscriptions(classe_id);
CREATE INDEX idx_inscriptions_annee  ON inscriptions(annee_scolaire_id);
SQL
        );
    }

    public function down(): void
    {
        DB::statement('DROP TABLE IF EXISTS inscriptions CASCADE');
    }
};
