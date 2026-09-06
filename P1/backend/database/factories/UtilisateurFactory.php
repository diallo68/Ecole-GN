<?php

namespace Database\Factories;

use App\Models\Utilisateur;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Utilisateur>
 */
class UtilisateurFactory extends Factory
{
    public function definition(): array
    {
        return [
            'nom' => fake()->lastName(),
            'prenom' => fake()->firstName(),
            'telephone' => '+224'.fake()->unique()->numerify('6########'),
            'email' => fake()->unique()->safeEmail(),
            'mot_de_passe_hash' => 'password',
            'langue_preferee' => 'fr',
            'statut' => 'actif',
        ];
    }

    public function superAdmin(): static
    {
        return $this->state(fn (array $attributes) => [
            'est_super_admin' => true,
        ]);
    }
}
