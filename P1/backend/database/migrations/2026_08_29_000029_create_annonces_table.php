<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Traduction directe de db/migrations/020_annonces.sql, déjà testée contre
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
CREATE TABLE annonces (
    id                bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    etablissement_id  bigint NOT NULL REFERENCES etablissements(id) ON DELETE CASCADE,
    auteur_id         bigint NOT NULL REFERENCES utilisateurs(id) ON DELETE RESTRICT,
    titre             varchar(150) NOT NULL,
    contenu           text NOT NULL,
    cible_type        varchar(20) NOT NULL CHECK (cible_type IN ('etablissement','classe')),
    cible_id          bigint,
    publiee_le        timestamptz NOT NULL DEFAULT now(),
    created_at        timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_annonces_etablissement ON annonces(etablissement_id);
SQL
        );
    }

    public function down(): void
    {
        DB::statement('DROP TABLE IF EXISTS annonces CASCADE');
    }
};
