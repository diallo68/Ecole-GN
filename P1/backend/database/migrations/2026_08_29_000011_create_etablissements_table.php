<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Traduction directe de db/migrations/002_etablissements.sql, déjà testée contre
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
CREATE TABLE etablissements (
    id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nom         varchar(255) NOT NULL,
    cycle       varchar(20) NOT NULL
                  CHECK (cycle IN ('primaire','college','lycee','mixte')),
    adresse     varchar(255),
    ville       varchar(255),
    region      varchar(255),
    logo_url    text,
    statut      varchar(20) NOT NULL DEFAULT 'actif'
                  CHECK (statut IN ('actif','inactif')),
    created_at  timestamptz NOT NULL DEFAULT now(),
    updated_at  timestamptz NOT NULL DEFAULT now()
);
SQL
        );
    }

    public function down(): void
    {
        DB::statement('DROP TABLE IF EXISTS etablissements CASCADE');
    }
};
