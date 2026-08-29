<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Traduction directe de db/migrations/004_annees_scolaires.sql, déjà testée contre
 * PostgreSQL 16 (voir docs/database-schema.md §5). Le SQL brut est repris
 * tel quel plutôt que retraduit dans le DSL Schema::, pour ne pas risquer
 * de diverger de ce qui a été vérifié.
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::unprepared(<<<'SQL'
CREATE TABLE annees_scolaires (
    id                bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    etablissement_id  bigint NOT NULL REFERENCES etablissements(id) ON DELETE CASCADE,
    libelle           varchar(20) NOT NULL,
    date_debut        date NOT NULL,
    date_fin          date NOT NULL,
    statut            varchar(20) NOT NULL DEFAULT 'en_preparation'
                        CHECK (statut IN ('en_preparation','active','archivee')),
    created_at        timestamptz NOT NULL DEFAULT now(),
    updated_at        timestamptz NOT NULL DEFAULT now(),
    UNIQUE (etablissement_id, libelle),
    CHECK (date_fin > date_debut)
);
CREATE INDEX idx_annees_scolaires_etablissement ON annees_scolaires(etablissement_id);

-- Une seule année active à la fois par établissement.
CREATE UNIQUE INDEX uniq_annee_active_par_etablissement
    ON annees_scolaires(etablissement_id)
    WHERE statut = 'active';
SQL
        );
    }

    public function down(): void
    {
        DB::statement('DROP TABLE IF EXISTS annees_scolaires CASCADE');
    }
};
