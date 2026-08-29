<?php

namespace Database\Factories;

use App\Models\Eleve;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Eleve>
 */
class EleveFactory extends Factory
{
    public function definition(): array
    {
        return [
            'matricule' => strtoupper(fake()->unique()->bothify('EL-####')),
            'nom' => fake()->lastName(),
            'prenom' => fake()->firstName(),
            'date_naissance' => fake()->dateTimeBetween('-18 years', '-6 years')->format('Y-m-d'),
            'sexe' => fake()->randomElement(['M', 'F']),
            'statut' => 'actif',
        ];
    }
}
