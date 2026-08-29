<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Traduction directe de db/migrations/025_fix_presences_saisie_par.sql.
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
-- Incohérence trouvée en câblant le module Présences : la colonne
-- s'appelait saisi_par (masculin) alors que « présence » est féminin,
-- comme notes.saisie_par (déjà correct). Migration séparée plutôt que
-- correction rétroactive de 016_presences.sql, déjà appliquée en
-- production potentielle.
ALTER TABLE presences RENAME COLUMN saisi_par TO saisie_par;
SQL
        );
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE presences RENAME COLUMN saisie_par TO saisi_par;');
    }
};
