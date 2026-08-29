<?php

namespace Tests\Feature;

use App\Models\Utilisateur;
use Tests\Concerns\RefreshDatabaseAvecProprietaire;
use Tests\TestCase;

class SmokeTest extends TestCase
{
    use RefreshDatabaseAvecProprietaire;

    public function test_migrate_fresh_tourne_sous_le_role_proprietaire(): void
    {
        $this->assertDatabaseCount('etablissements', 0);
    }

    public function test_login_puis_route_protegee(): void
    {
        // superAdmin() : un utilisateur sans rattachement à un établissement
        // reçoit 409 de ResolveEtablissementContext sur /auth/me (comportement
        // voulu — voir SmokeTest lui-même comme premier test de ce cas), donc
        // le test de fumée du login utilise un compte qui n'en a pas besoin.
        $utilisateur = Utilisateur::factory()->superAdmin()->create([
            'telephone' => '+224600000001',
            'mot_de_passe_hash' => 'secret1234',
        ]);

        $reponse = $this->postJson('/api/v1/auth/login', [
            'identifiant' => '+224600000001',
            'mot_de_passe' => 'secret1234',
        ]);

        $reponse->assertOk()->assertJsonStructure(['token', 'utilisateur']);

        $token = $reponse->json('token');

        $this->withHeader('Authorization', "Bearer $token")
            ->getJson('/api/v1/auth/me')
            ->assertOk()
            ->assertJsonPath('utilisateur.id', $utilisateur->id);
    }
}
