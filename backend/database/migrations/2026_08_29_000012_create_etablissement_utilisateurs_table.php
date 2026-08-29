<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Traduction directe de db/migrations/003_etablissement_utilisateurs.sql, déjà testée contre
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
-- Rattachement d'un compte à un établissement + rôle (RBAC).
-- C'est cette table, pas `utilisateurs`, qui porte l'isolation multi-tenant
-- pour les identités.
CREATE TABLE etablissement_utilisateurs (
    id                bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    etablissement_id  bigint NOT NULL REFERENCES etablissements(id) ON DELETE CASCADE,
    utilisateur_id    bigint NOT NULL REFERENCES utilisateurs(id) ON DELETE CASCADE,
    role              varchar(30) NOT NULL
                        CHECK (role IN ('admin_etablissement','enseignant','personnel_administratif','parent')),
    statut            varchar(20) NOT NULL DEFAULT 'actif'
                        CHECK (statut IN ('actif','invite','suspendu')),
    created_at        timestamptz NOT NULL DEFAULT now(),
    updated_at        timestamptz NOT NULL DEFAULT now(),
    UNIQUE (etablissement_id, utilisateur_id, role)
);
CREATE INDEX idx_etab_util_etablissement ON etablissement_utilisateurs(etablissement_id);
CREATE INDEX idx_etab_util_utilisateur   ON etablissement_utilisateurs(utilisateur_id);
SQL
        );
    }

    public function down(): void
    {
        DB::statement('DROP TABLE IF EXISTS etablissement_utilisateurs CASCADE');
    }
};
