<?php

namespace Tests\Feature;

use App\Models\Utilisateur;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\Concerns\RefreshDatabaseAvecProprietaire;
use Tests\TestCase;

/**
 * Verrouille l'isolation multi-établissement (RLS + middleware tenant) en
 * régression. Trois bugs réels ont déjà été trouvés dans ce mécanisme
 * (voir db/README.md, docs/database-schema.md §5) — cette suite existe
 * pour qu'ils ne reviennent jamais silencieusement.
 *
 * Toutes les données de test passent par l'API HTTP réelle (pas
 * Eloquent::create() direct) : les tables scolaires sont protégées par
 * RLS, et un create() hors requête HTTP n'a aucun contexte tenant posé —
 * il échouerait exactement comme le ferait une vraie tentative non
 * autorisée. C'est la même leçon que celle documentée dans
 * ResolveEtablissementContext, retrouvée en écrivant ces tests.
 */
class TenantIsolationTest extends TestCase
{
    use RefreshDatabaseAvecProprietaire, WithFaker;

    private function creerSuperAdmin(): Utilisateur
    {
        return Utilisateur::factory()->superAdmin()->create(['telephone' => $this->faker->unique()->numerify('+2246########')]);
    }

    private function creerEtablissement(Utilisateur $superAdmin): int
    {
        return $this->actingAs($superAdmin, 'sanctum')
            ->postJson('/api/v1/etablissements', ['nom' => $this->faker->company(), 'cycle' => 'primaire'])
            ->assertCreated()
            ->json('id');
    }

    private function creerAdmin(Utilisateur $superAdmin, int $etablissementId, string $telephone): Utilisateur
    {
        $this->actingAs($superAdmin, 'sanctum')
            ->postJson("/api/v1/etablissements/{$etablissementId}/utilisateurs", [
                'nom' => 'Diallo', 'prenom' => 'Test', 'telephone' => $telephone, 'role' => 'admin_etablissement',
            ])
            ->assertCreated();

        return Utilisateur::where('telephone', $telephone)->firstOrFail();
    }

    public function test_admin_ne_peut_pas_voir_un_autre_etablissement(): void
    {
        $superAdmin = $this->creerSuperAdmin();
        $etablissementA = $this->creerEtablissement($superAdmin);
        $etablissementB = $this->creerEtablissement($superAdmin);
        $adminA = $this->creerAdmin($superAdmin, $etablissementA, $this->faker->unique()->numerify('+2246########'));

        $this->actingAs($adminA, 'sanctum')
            ->getJson("/api/v1/etablissements/{$etablissementA}")
            ->assertOk();

        $this->actingAs($adminA, 'sanctum')
            ->getJson("/api/v1/etablissements/{$etablissementB}")
            ->assertStatus(403);
    }

    public function test_admin_ne_peut_pas_voir_une_classe_dun_autre_etablissement(): void
    {
        $superAdmin = $this->creerSuperAdmin();
        $etablissementA = $this->creerEtablissement($superAdmin);
        $etablissementB = $this->creerEtablissement($superAdmin);
        $adminA = $this->creerAdmin($superAdmin, $etablissementA, $this->faker->unique()->numerify('+2246########'));
        $adminB = $this->creerAdmin($superAdmin, $etablissementB, $this->faker->unique()->numerify('+2246########'));

        $anneeB = $this->actingAs($adminB, 'sanctum')
            ->postJson("/api/v1/etablissements/{$etablissementB}/annees-scolaires", [
                'libelle' => '2026-2027', 'date_debut' => '2026-10-01', 'date_fin' => '2027-07-15',
            ])->assertCreated()->json('id');

        $classeB = $this->actingAs($adminB, 'sanctum')
            ->postJson("/api/v1/etablissements/{$etablissementB}/classes", [
                'niveau' => 'CM2', 'libelle' => 'CM2 A', 'annee_scolaire_id' => $anneeB,
            ])->assertCreated()->json('id');

        // Route sans etablissementId dans l'URL : la RLS seule doit bloquer,
        // pas le middleware applicatif — c'est le cas le plus important à
        // couvrir (défense en profondeur, voir commit du module Classes).
        $this->actingAs($adminA, 'sanctum')
            ->getJson("/api/v1/classes/{$classeB}")
            ->assertStatus(404);

        $this->actingAs($adminB, 'sanctum')
            ->getJson("/api/v1/classes/{$classeB}")
            ->assertOk();
    }

    public function test_super_admin_peut_lister_tous_les_etablissements(): void
    {
        $superAdmin = $this->creerSuperAdmin();
        $etablissementA = $this->creerEtablissement($superAdmin);
        $etablissementB = $this->creerEtablissement($superAdmin);

        $reponse = $this->actingAs($superAdmin, 'sanctum')->getJson('/api/v1/etablissements');

        $reponse->assertOk();
        $ids = collect($reponse->json('data'))->pluck('id');
        $this->assertTrue($ids->contains($etablissementA));
        $this->assertTrue($ids->contains($etablissementB));
    }

    public function test_super_admin_sans_etablissement_ne_voit_aucun_eleve(): void
    {
        // Le bypass RLS super-admin (023) ne couvre QUE `etablissements` —
        // volontairement. Tout le reste exige un etablissement_id explicite,
        // même pour un super-admin (voir 023_super_admin_rls_bypass.sql).
        $superAdmin = $this->creerSuperAdmin();
        $etablissementA = $this->creerEtablissement($superAdmin);
        $adminA = $this->creerAdmin($superAdmin, $etablissementA, $this->faker->unique()->numerify('+2246########'));

        $eleve = $this->actingAs($adminA, 'sanctum')
            ->postJson("/api/v1/etablissements/{$etablissementA}/eleves", ['nom' => 'Bah', 'prenom' => 'Ibrahima', 'sexe' => 'M'])
            ->assertCreated()->json('id');

        $this->actingAs($superAdmin, 'sanctum')
            ->getJson("/api/v1/eleves/{$eleve}")
            ->assertStatus(404);

        $this->actingAs($superAdmin, 'sanctum')
            ->withHeader('X-Etablissement-Id', $etablissementA)
            ->getJson("/api/v1/eleves/{$eleve}")
            ->assertOk();
    }

    public function test_utilisateur_sans_rattachement_actif_est_bloque(): void
    {
        $superAdmin = $this->creerSuperAdmin();
        $etablissementA = $this->creerEtablissement($superAdmin);
        $intrus = Utilisateur::factory()->create(['telephone' => $this->faker->unique()->numerify('+2246########')]);

        $this->actingAs($intrus, 'sanctum')
            ->withHeader('X-Etablissement-Id', $etablissementA)
            ->getJson("/api/v1/etablissements/{$etablissementA}")
            ->assertStatus(403);
    }
}
