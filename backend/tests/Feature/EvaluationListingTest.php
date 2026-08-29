<?php

namespace Tests\Feature;

use App\Models\Utilisateur;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\Concerns\RefreshDatabaseAvecProprietaire;
use Tests\TestCase;

/**
 * Verrouille GET /classes/{classeId}/matieres/{matiereId}/evaluations —
 * ajouté pour l'écran de saisie de notes de l'app mobile (aucun endpoint
 * ne permettait auparavant de retrouver les évaluations déjà créées,
 * seule leur création existait).
 */
class EvaluationListingTest extends TestCase
{
    use RefreshDatabaseAvecProprietaire, WithFaker;

    public function test_liste_les_evaluations_de_la_classe_matiere_avec_filtre_periode(): void
    {
        $superAdmin = Utilisateur::factory()->superAdmin()->create(['telephone' => $this->faker->unique()->numerify('+2246########')]);

        $etablissementId = $this->actingAs($superAdmin, 'sanctum')
            ->postJson('/api/v1/etablissements', ['nom' => 'École Test', 'cycle' => 'primaire'])
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

        $mathsId = $this->actingAs($admin, 'sanctum')
            ->postJson("/api/v1/etablissements/{$etablissementId}/matieres", ['nom' => 'Mathématiques'])
            ->assertCreated()->json('id');

        $telProf = $this->faker->unique()->numerify('+2246########');
        $this->actingAs($admin, 'sanctum')
            ->postJson("/api/v1/etablissements/{$etablissementId}/utilisateurs", [
                'nom' => 'Barry', 'prenom' => 'Prof', 'telephone' => $telProf, 'role' => 'enseignant',
            ])->assertCreated();
        $prof = Utilisateur::where('telephone', $telProf)->firstOrFail();

        $this->actingAs($admin, 'sanctum')
            ->putJson("/api/v1/classes/{$classeId}/matieres/{$mathsId}/enseignant", ['enseignant_id' => $prof->id])
            ->assertOk();

        $periode1Id = $this->actingAs($admin, 'sanctum')
            ->postJson("/api/v1/etablissements/{$etablissementId}/periodes", [
                'libelle' => 'T1', 'annee_scolaire_id' => $anneeId, 'date_debut' => '2026-10-01', 'date_fin' => '2026-12-20',
            ])->assertCreated()->json('id');
        $periode2Id = $this->actingAs($admin, 'sanctum')
            ->postJson("/api/v1/etablissements/{$etablissementId}/periodes", [
                'libelle' => 'T2', 'annee_scolaire_id' => $anneeId, 'date_debut' => '2027-01-05', 'date_fin' => '2027-03-30',
            ])->assertCreated()->json('id');

        $this->actingAs($prof, 'sanctum')
            ->postJson("/api/v1/classes/{$classeId}/matieres/{$mathsId}/evaluations", [
                'type' => 'devoir', 'libelle' => 'Devoir 1', 'periode_id' => $periode1Id, 'date_evaluation' => '2026-11-01',
            ])->assertCreated();
        $this->actingAs($prof, 'sanctum')
            ->postJson("/api/v1/classes/{$classeId}/matieres/{$mathsId}/evaluations", [
                'type' => 'composition', 'libelle' => 'Compo T1', 'periode_id' => $periode1Id, 'date_evaluation' => '2026-12-10',
            ])->assertCreated();
        $this->actingAs($prof, 'sanctum')
            ->postJson("/api/v1/classes/{$classeId}/matieres/{$mathsId}/evaluations", [
                'type' => 'devoir', 'libelle' => 'Devoir T2', 'periode_id' => $periode2Id, 'date_evaluation' => '2027-01-20',
            ])->assertCreated();

        // Sans filtre : les trois évaluations, toutes matières/périodes confondues pour ce couple classe/matière.
        $this->actingAs($prof, 'sanctum')
            ->getJson("/api/v1/classes/{$classeId}/matieres/{$mathsId}/evaluations")
            ->assertOk()
            ->assertJsonCount(3);

        // Filtrées sur T1 uniquement : les deux évaluations de cette période, dans l'ordre chronologique.
        $reponse = $this->actingAs($prof, 'sanctum')
            ->getJson("/api/v1/classes/{$classeId}/matieres/{$mathsId}/evaluations?periode_id={$periode1Id}")
            ->assertOk()
            ->assertJsonCount(2);
        $this->assertEquals('Devoir 1', $reponse->json('0.libelle'));
        $this->assertEquals('Compo T1', $reponse->json('1.libelle'));
    }
}
