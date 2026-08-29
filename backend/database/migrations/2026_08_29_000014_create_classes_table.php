<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Traduction directe de db/migrations/005_classes.sql, déjà testée contre
 * PostgreSQL 16 (voir docs/database-schema.md §5). Le SQL brut est repris
 * tel quel plutôt que retraduit dans le DSL Schema::, pour ne pas risquer
 * de diverger de ce qui a été vérifié.
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::unprepared(<<<'SQL'
CREATE TABLE classes (
    id                       bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    etablissement_id         bigint NOT NULL REFERENCES etablissements(id) ON DELETE CASCADE,
    annee_scolaire_id        bigint NOT NULL REFERENCES annees_scolaires(id) ON DELETE CASCADE,
    niveau                   varchar(30) NOT NULL,
    libelle                  varchar(50) NOT NULL,
    enseignant_titulaire_id  bigint REFERENCES utilisateurs(id) ON DELETE SET NULL,
    effectif_max             integer,
    created_at               timestamptz NOT NULL DEFAULT now(),
    updated_at               timestamptz NOT NULL DEFAULT now(),
    UNIQUE (annee_scolaire_id, libelle)
);
CREATE INDEX idx_classes_etablissement  ON classes(etablissement_id);
CREATE INDEX idx_classes_annee_scolaire ON classes(annee_scolaire_id);
SQL
        );
    }

    public function down(): void
    {
        DB::statement('DROP TABLE IF EXISTS classes CASCADE');
    }
};
