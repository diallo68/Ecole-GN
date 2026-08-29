<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Traduction directe de db/migrations/015_bulletins.sql, déjà testée contre
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
CREATE TABLE bulletins (
    id                      bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    eleve_id                bigint NOT NULL REFERENCES eleves(id) ON DELETE CASCADE,
    periode_id              bigint NOT NULL REFERENCES periodes_evaluation(id) ON DELETE CASCADE,
    moyenne_generale        numeric(4,2),
    rang                    integer,
    effectif_classe         integer,
    appreciation_generale   text,
    pdf_url                 text,
    statut                  varchar(20) NOT NULL DEFAULT 'brouillon'
                              CHECK (statut IN ('brouillon','valide','publie')),
    valide_par              bigint REFERENCES utilisateurs(id) ON DELETE SET NULL,
    genere_le               timestamptz,
    created_at              timestamptz NOT NULL DEFAULT now(),
    updated_at              timestamptz NOT NULL DEFAULT now(),
    UNIQUE (eleve_id, periode_id)
);
CREATE INDEX idx_bulletins_periode ON bulletins(periode_id);
SQL
        );
    }

    public function down(): void
    {
        DB::statement('DROP TABLE IF EXISTS bulletins CASCADE');
    }
};
