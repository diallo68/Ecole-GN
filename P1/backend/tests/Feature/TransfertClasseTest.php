<?php

namespace Tests\Feature;

use App\Models\Utilisateur;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\Concerns\RefreshDatabaseAvecProprietaire;
use Tests\TestCase;

/**
 * Verrouille PATCH /inscriptions/{id} — « 4.2 Transferts entre classes »,
 * déclaré « Complet » dans mvp-scope.md alors qu'aucune route ne le
 * permettait : POST /eleves/{id}/inscriptions rejette une seconde
 * inscription pour la même année (UNIQUE eleve_id/annee_scolaire_id).
 */
class TransfertClasseTest extends TestCase
{
    use RefreshDatabaseAvecProprietaire, WithFaker;

    public function test_transfert_change_la_classe_dune_inscription_existante(): void
    {
        $superAdmin = Utilisateur::factory()->superAdmin()->create(['telephone' => $this->faker->unique()->numerify('+2246########')]);

        $etablissementId = $this->actingAs($superAdmin, 'sanctum')
            ->postJson('/api/v1/etablissements', ['nom' => 'École Transfert', 'cycle' => 'primaire'])
            ->assertCreated()->json('id');

        $telAdmin = $this->faker->unique()->numerify('+2246########');
        $this->actingAs($superAdmin, 'sanctum')
            ->postJson("/api/v1/etablissements/{$etablissementId}/utilisateurs", [
                'nom' => 'Diallo', 'prenom' => 'Admin', 'telephone' => $telAdmin, 'role' => 'admin_etablissement',
            ])->assertCreated();
        $admin = Utilisateur::where('telephone', $telAdmin)->firstOrFail();

        $anneeId = $this->actingAs($admin, 'sanctum')
            ->postJson("/api/v1/etablissements/{$etablissementId}/annees-scolaires", [
                'libelle' => '2026-2027', 'date_debut' => '2026-10-01', 'date_fin' => '2027-07-15',
            ])->assertCreated()->json('id');

        $classeAId = $this->actingAs($admin, 'sanctum')
            ->postJson("/api/v1/etablissements/{$etablissementId}/classes", [
                'niveau' => 'CM2', 'libelle' => 'CM2 A', 'annee_scolaire_id' => $anneeId,
            ])->assertCreated()->json('id');
        $classeBId = $this->actingAs($admin, 'sanctum')
            ->postJson("/api/v1/etablissements/{$etablissementId}/classes", [
                'niveau' => 'CM2', 'libelle' => 'CM2 B', 'annee_scolaire_id' => $anneeId,
            ])->assertCreated()->json('id');

        $eleveId = $this->actingAs($admin, 'sanctum')
            ->postJson("/api/v1/etablissements/{$etablissementId}/eleves", ['nom' => 'Bah', 'prenom' => 'Mariam'])
            ->assertCreated()->json('id');

        $inscriptionId = $this->actingAs($admin, 'sanctum')
            ->postJson("/api/v1/eleves/{$eleveId}/inscriptions", ['classe_id' => $classeAId, 'annee_scolaire_id' => $anneeId])
            ->assertCreated()->json('id');

        // Une seconde inscription pour la même année est rejetée — c'est
        // précisément le trou que PATCH /inscriptions/{id} comble.
        $this->actingAs($admin, 'sanctum')
            ->postJson("/api/v1/eleves/{$eleveId}/inscriptions", ['classe_id' => $classeBId, 'annee_scolaire_id' => $anneeId])
            ->assertStatus(409);

        $this->actingAs($admin, 'sanctum')
            ->patchJson("/api/v1/inscriptions/{$inscriptionId}", ['classe_id' => $classeBId])
            ->assertOk()
            ->assertJson(['id' => $inscriptionId, 'classe_id' => $classeBId]);

        // L'élève apparaît maintenant dans la classe B, plus dans la A.
        $elevesClasseA = $this->actingAs($admin, 'sanctum')->getJson("/api/v1/classes/{$classeAId}/eleves")->assertOk()->json();
        $elevesClasseB = $this->actingAs($admin, 'sanctum')->getJson("/api/v1/classes/{$classeBId}/eleves")->assertOk()->json();
        $this->assertEmpty($elevesClasseA);
        $this->assertCount(1, $elevesClasseB);
    }

    public function test_liste_les_inscriptions_dune_classe_avec_lelevet_pas_les_abandonnees(): void
    {
        $superAdmin = Utilisateur::factory()->superAdmin()->create(['telephone' => $this->faker->unique()->numerify('+2246########')]);

        $etablissementId = $this->actingAs($superAdmin, 'sanctum')
            ->postJson('/api/v1/etablissements', ['nom' => 'École Inscriptions', 'cycle' => 'primaire'])
            ->assertCreated()->json('id');

        $telAdmin = $this->faker->unique()->numerify('+2246########');
        $this->actingAs($superAdmin, 'sanctum')
            ->postJson("/api/v1/etablissements/{$etablissementId}/utilisateurs", [
                'nom' => 'Diallo', 'prenom' => 'Admin', 'telephone' => $telAdmin, 'role' => 'admin_etablissement',
            ])->assertCreated();
        $admin = Utilisateur::where('telephone', $telAdmin)->firstOrFail();

        $anneeId = $this->actingAs($admin, 'sanctum')
            ->postJson("/api/v1/etablissements/{$etablissementId}/annees-scolaires", [
                'libelle' => '2026-2027', 'date_debut' => '2026-10-01', 'date_fin' => '2027-07-15',
            ])->assertCreated()->json('id');

        $classeId = $this->actingAs($admin, 'sanctum')
            ->postJson("/api/v1/etablissements/{$etablissementId}/classes", [
                'niveau' => 'CM2', 'libelle' => 'CM2 A', 'annee_scolaire_id' => $anneeId,
            ])->assertCreated()->json('id');

        $eleveId = $this->actingAs($admin, 'sanctum')
            ->postJson("/api/v1/etablissements/{$etablissementId}/eleves", ['nom' => 'Bah', 'prenom' => 'Mariam'])
            ->assertCreated()->json('id');
        $this->actingAs($admin, 'sanctum')
            ->postJson("/api/v1/eleves/{$eleveId}/inscriptions", ['classe_id' => $classeId, 'annee_scolaire_id' => $anneeId])
            ->assertCreated();

        $reponse = $this->actingAs($admin, 'sanctum')
            ->getJson("/api/v1/classes/{$classeId}/inscriptions")
            ->assertOk();

        $reponse->assertJsonCount(1);
        $this->assertEquals($eleveId, $reponse->json('0.eleve_id'));
        $this->assertEquals('Bah', $reponse->json('0.eleve.nom'));
        $this->assertEquals('inscrit', $reponse->json('0.statut'));
    }

    public function test_transfert_refuse_une_classe_dune_autre_annee_scolaire(): void
    {
        $superAdmin = Utilisateur::factory()->superAdmin()->create(['telephone' => $this->faker->unique()->numerify('+2246########')]);

        $etablissementId = $this->actingAs($superAdmin, 'sanctum')
            ->postJson('/api/v1/etablissements', ['nom' => 'École Transfert 2', 'cycle' => 'primaire'])
            ->assertCreated()->json('id');

        $telAdmin = $this->faker->unique()->numerify('+2246########');
        $this->actingAs($superAdmin, 'sanctum')
            ->postJson("/api/v1/etablissements/{$etablissementId}/utilisateurs", [
                'nom' => 'Diallo', 'prenom' => 'Admin', 'telephone' => $telAdmin, 'role' => 'admin_etablissement',
            ])->assertCreated();
        $admin = Utilisateur::where('telephone', $telAdmin)->firstOrFail();

        $anneeAId = $this->actingAs($admin, 'sanctum')
            ->postJson("/api/v1/etablissements/{$etablissementId}/annees-scolaires", [
                'libelle' => '2026-2027', 'date_debut' => '2026-10-01', 'date_fin' => '2027-07-15',
            ])->assertCreated()->json('id');
        $anneeBId = $this->actingAs($admin, 'sanctum')
            ->postJson("/api/v1/etablissements/{$etablissementId}/annees-scolaires", [
                'libelle' => '2027-2028', 'date_debut' => '2027-10-01', 'date_fin' => '2028-07-15',
            ])->assertCreated()->json('id');

        $classeAnneeAId = $this->actingAs($admin, 'sanctum')
            ->postJson("/api/v1/etablissements/{$etablissementId}/classes", [
                'niveau' => 'CM2', 'libelle' => 'CM2 A', 'annee_scolaire_id' => $anneeAId,
            ])->assertCreated()->json('id');
        $classeAnneeBId = $this->actingAs($admin, 'sanctum')
            ->postJson("/api/v1/etablissements/{$etablissementId}/classes", [
                'niveau' => '6e', 'libelle' => '6e A', 'annee_scolaire_id' => $anneeBId,
            ])->assertCreated()->json('id');

        $eleveId = $this->actingAs($admin, 'sanctum')
            ->postJson("/api/v1/etablissements/{$etablissementId}/eleves", ['nom' => 'Bah', 'prenom' => 'Mariam'])
            ->assertCreated()->json('id');

        $inscriptionId = $this->actingAs($admin, 'sanctum')
            ->postJson("/api/v1/eleves/{$eleveId}/inscriptions", ['classe_id' => $classeAnneeAId, 'annee_scolaire_id' => $anneeAId])
            ->assertCreated()->json('id');

        $this->actingAs($admin, 'sanctum')
            ->patchJson("/api/v1/inscriptions/{$inscriptionId}", ['classe_id' => $classeAnneeBId])
            ->assertStatus(422);
    }
}
