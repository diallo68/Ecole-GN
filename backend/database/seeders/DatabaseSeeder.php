<?php

namespace Database\Seeders;

use App\Models\Utilisateur;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        Utilisateur::factory()->superAdmin()->create([
            'nom' => 'Admin',
            'prenom' => 'Plateforme',
            'telephone' => '+224600000000',
            'email' => 'admin@plateforme-scolaire.gn',
        ]);
    }
}
