<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Traduction directe de db/migrations/018_echeances.sql, déjà testée contre
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
CREATE TABLE echeances (
    id                    bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    frais_scolarite_id    bigint NOT NULL REFERENCES frais_scolarite(id) ON DELETE CASCADE,
    eleve_id              bigint NOT NULL REFERENCES eleves(id) ON DELETE CASCADE,
    libelle               varchar(50) NOT NULL,
    montant_du            numeric(10,2) NOT NULL CHECK (montant_du >= 0),
    date_echeance         date NOT NULL,
    statut                varchar(20) NOT NULL DEFAULT 'impaye'
                            CHECK (statut IN ('paye','partiel','impaye')),
    created_at            timestamptz NOT NULL DEFAULT now(),
    updated_at            timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_echeances_eleve ON echeances(eleve_id);
SQL
        );
    }

    public function down(): void
    {
        DB::statement('DROP TABLE IF EXISTS echeances CASCADE');
    }
};
