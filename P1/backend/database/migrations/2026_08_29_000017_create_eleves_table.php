<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Traduction directe de db/migrations/008_eleves.sql, déjà testée contre
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
CREATE TABLE eleves (
    id                bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    etablissement_id  bigint NOT NULL REFERENCES etablissements(id) ON DELETE CASCADE,
    matricule         varchar(30) NOT NULL,
    nom               varchar(100) NOT NULL,
    prenom            varchar(100) NOT NULL,
    date_naissance    date,
    sexe              varchar(1) CHECK (sexe IN ('M','F')),
    photo_url         text,
    statut            varchar(20) NOT NULL DEFAULT 'actif'
                        CHECK (statut IN ('actif','inactif','diplome')),
    created_at        timestamptz NOT NULL DEFAULT now(),
    updated_at        timestamptz NOT NULL DEFAULT now(),
    UNIQUE (etablissement_id, matricule)
);
CREATE INDEX idx_eleves_etablissement ON eleves(etablissement_id);
CREATE INDEX idx_eleves_nom_prenom    ON eleves(nom, prenom);
SQL
        );
    }

    public function down(): void
    {
        DB::statement('DROP TABLE IF EXISTS eleves CASCADE');
    }
};
