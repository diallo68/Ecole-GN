<?php

namespace Tests\Concerns;

use Illuminate\Foundation\Testing\RefreshDatabase;

/**
 * `RefreshDatabase::migrateFreshUsing()` doit tourner sous le rôle
 * propriétaire (pgsql_migrate), jamais sous app_ecole_gn, qui n'a pas le
 * droit de créer/supprimer de table (voir db/README.md).
 *
 * Surcharger migrateFreshUsing() dans Tests\TestCase ne suffit PAS : en
 * PHP, une méthode apportée par un trait utilisé dans la classe de test
 * prend le pas sur une méthode héritée de la classe parente. Sans ce
 * wrapper, RefreshDatabase::migrateFreshUsing() (sans le rôle propriétaire)
 * gagnait silencieusement — trouvé en testant, pas en relisant le code.
 */
trait RefreshDatabaseAvecProprietaire
{
    use RefreshDatabase {
        migrateFreshUsing as protected baseMigrateFreshUsing;
    }

    protected function migrateFreshUsing()
    {
        return array_merge($this->baseMigrateFreshUsing(), [
            '--database' => 'pgsql_migrate',
        ]);
    }
}
