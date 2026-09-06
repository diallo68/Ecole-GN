<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Traduction directe de db/migrations/026_bulletins_detail_matieres.sql.
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
-- CalculBulletin::pourClasseEtPeriode() calcule déjà une moyenne par
-- matière (detail_matieres) pour produire la moyenne générale pondérée,
-- mais ce détail était jusqu'ici jeté après le calcul — seuls
-- moyenne_generale et rang étaient persistés. Un bulletin sans le détail
-- par matière n'est pas vraiment un bulletin consultable (ni pour la
-- famille, ni pour l'administration) : on le conserve.
ALTER TABLE bulletins ADD COLUMN detail_matieres jsonb;
SQL
        );
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE bulletins DROP COLUMN detail_matieres;');
    }
};
