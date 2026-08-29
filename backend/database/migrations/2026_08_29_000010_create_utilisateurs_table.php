<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Traduction directe de db/migrations/001_utilisateurs.sql, déjà testée contre
 * PostgreSQL 16 (voir docs/database-schema.md §5). Le SQL brut est repris
 * tel quel plutôt que retraduit dans le DSL Schema::, pour ne pas risquer
 * de diverger de ce qui a été vérifié.
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::unprepared(<<<'SQL'
-- Table globale, non tenant-scopée : un utilisateur (ex. parent) peut être
-- rattaché à plusieurs établissements via etablissement_utilisateurs.
CREATE TABLE utilisateurs (
    id                  bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nom                 varchar(100) NOT NULL,
    prenom              varchar(100) NOT NULL,
    telephone           varchar(20) NOT NULL UNIQUE,
    email               varchar(255) UNIQUE,
    mot_de_passe_hash   varchar(255) NOT NULL,
    langue_preferee     varchar(10) NOT NULL DEFAULT 'fr',
    est_super_admin     boolean NOT NULL DEFAULT false,
    statut              varchar(20) NOT NULL DEFAULT 'actif'
                          CHECK (statut IN ('actif','suspendu')),
    created_at          timestamptz NOT NULL DEFAULT now(),
    updated_at          timestamptz NOT NULL DEFAULT now()
);
SQL
        );
    }

    public function down(): void
    {
        DB::statement('DROP TABLE IF EXISTS utilisateurs CASCADE');
    }
};
