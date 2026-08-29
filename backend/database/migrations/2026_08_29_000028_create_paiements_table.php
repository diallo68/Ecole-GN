<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Traduction directe de db/migrations/019_paiements.sql, déjà testée contre
 * PostgreSQL 16 (voir docs/database-schema.md §5). Le SQL brut est repris
 * tel quel plutôt que retraduit dans le DSL Schema::, pour ne pas risquer
 * de diverger de ce qui a été vérifié.
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::unprepared(<<<'SQL'
CREATE TABLE paiements (
    id               bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    echeance_id      bigint NOT NULL REFERENCES echeances(id) ON DELETE RESTRICT,
    montant          numeric(10,2) NOT NULL CHECK (montant > 0),
    -- 'mobile_money' est autorisé en base dès maintenant pour éviter une
    -- migration de contrainte en Phase 4 ; l'API ne l'expose pas encore
    -- (cf. docs/openapi.yaml, PaiementEcriture).
    mode             varchar(20) NOT NULL
                        CHECK (mode IN ('especes','cheque','mobile_money')),
    reference_recu   varchar(50) NOT NULL UNIQUE,
    encaisse_par     bigint NOT NULL REFERENCES utilisateurs(id) ON DELETE RESTRICT,
    date_paiement    date NOT NULL DEFAULT current_date,
    pdf_recu_url     text,
    created_at       timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_paiements_echeance ON paiements(echeance_id);
SQL
        );
    }

    public function down(): void
    {
        DB::statement('DROP TABLE IF EXISTS paiements CASCADE');
    }
};
