<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Traduction directe de db/migrations/000_extensions.sql, déjà testée contre
 * PostgreSQL 16 (voir docs/database-schema.md §5). Le SQL brut est repris
 * tel quel plutôt que retraduit dans le DSL Schema::, pour ne pas risquer
 * de diverger de ce qui a été vérifié.
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::unprepared(<<<'SQL'
-- Extensions requises
CREATE EXTENSION IF NOT EXISTS pgcrypto; -- gen_random_uuid() pour les sync_uuid
SQL
        );
    }

    public function down(): void
    {
        DB::statement('DROP EXTENSION IF EXISTS pgcrypto');
    }
};
