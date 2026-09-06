<?php

namespace Tests\Feature;

use App\Models\Utilisateur;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Support\Str;
use Tests\Concerns\RefreshDatabaseAvecProprietaire;
use Tests\TestCase;

/**
 * Verrouille en régression le comportement de POST /sync/batch : traitement
 * indépendant de chaque écriture (une écriture invalide ne fait jamais
 * échouer les autres) et idempotence par sync_uuid sur rejeu — voir le
 * commit du module Synchronisation.
 */
class SyncBatchTest extends TestCase
{
    use RefreshDatabaseAvecProprietaire, WithFaker;

    private function construireScenario(): array
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

        $matiereId = $this->actingAs($admin, 'sanctum')
            ->postJson("/api/v1/etablissements/{$etablissementId}/matieres", ['nom' => 'Maths', 'coefficient_defaut' => 1])
            ->assertCreated()->json('id');

        $telProf = $this->faker->unique()->numerify('+2246########');
        $this->actingAs($admin, 'sanctum')
            ->postJson("/api/v1/etablissements/{$etablissementId}/utilisateurs", [
                'nom' => 'Barry', 'prenom' => 'Prof', 'telephone' => $telProf, 'role' => 'enseignant',
            ])->assertCreated();
        $prof = Utilisateur::where('telephone', $telProf)->firstOrFail();

        $this->actingAs($admin, 'sanctum')
            ->putJson("/api/v1/classes/{$classeId}/matieres/{$matiereId}/enseignant", ['enseignant_id' => $prof->id])
            ->assertOk();

        $eleveId = $this->actingAs($admin, 'sanctum')
            ->postJson("/api/v1/etablissements/{$etablissementId}/eleves", ['nom' => 'Bah', 'prenom' => 'Ibrahima'])
            ->assertCreated()->json('id');
        $this->actingAs($admin, 'sanctum')
            ->postJson("/api/v1/eleves/{$eleveId}/inscriptions", ['classe_id' => $classeId, 'annee_scolaire_id' => $anneeId])
            ->assertCreated();

        $periodeId = $this->actingAs($admin, 'sanctum')
            ->postJson("/api/v1/etablissements/{$etablissementId}/periodes", [
                'libelle' => 'T1', 'annee_scolaire_id' => $anneeId, 'date_debut' => '2026-10-01', 'date_fin' => '2026-12-20',
            ])->assertCreated()->json('id');

        $evaluationId = $this->actingAs($prof, 'sanctum')
            ->postJson("/api/v1/classes/{$classeId}/matieres/{$matiereId}/evaluations", [
                'type' => 'devoir', 'libelle' => 'Devoir', 'periode_id' => $periodeId, 'date_evaluation' => '2026-11-05',
            ])->assertCreated()->json('id');

        return compact('admin', 'prof', 'etablissementId', 'classeId', 'eleveId', 'evaluationId');
    }

    public function test_lot_mixte_traite_chaque_ecriture_independamment(): void
    {
        ['prof' => $prof, 'classeId' => $classeId, 'eleveId' => $eleveId, 'evaluationId' => $evaluationId] = $this->construireScenario();

        $uuidNote = (string) Str::uuid();
        $uuidPresence = (string) Str::uuid();
        $uuidInvalide = (string) Str::uuid();

        $reponse = $this->actingAs($prof, 'sanctum')->postJson('/api/v1/sync/batch', [
            'ecritures' => [
                ['sync_uuid' => $uuidNote, 'type' => 'note', 'payload' => ['evaluation_id' => $evaluationId, 'eleve_id' => $eleveId, 'valeur' => 15]],
                ['sync_uuid' => $uuidPresence, 'type' => 'presence', 'payload' => ['classe_id' => $classeId, 'eleve_id' => $eleveId, 'date' => '2026-11-05', 'statut' => 'present']],
                ['sync_uuid' => $uuidInvalide, 'type' => 'note', 'payload' => ['evaluation_id' => 999999, 'eleve_id' => $eleveId, 'valeur' => 10]],
            ],
        ]);

        $reponse->assertOk();
        $resultats = collect($reponse->json('resultats'))->keyBy('sync_uuid');

        $this->assertSame('applique', $resultats[$uuidNote]['statut']);
        $this->assertSame('applique', $resultats[$uuidPresence]['statut']);
        $this->assertSame('rejete', $resultats[$uuidInvalide]['statut']);
        $this->assertNotNull($resultats[$uuidInvalide]['erreur']);

        $this->assertDatabaseHas('notes', ['eleve_id' => $eleveId, 'evaluation_id' => $evaluationId, 'valeur' => 15]);
        $this->assertDatabaseHas('presences', ['eleve_id' => $eleveId, 'classe_id' => $classeId, 'statut' => 'present']);
    }

    public function test_rejeu_du_meme_lot_est_idempotent(): void
    {
        ['prof' => $prof, 'classeId' => $classeId, 'eleveId' => $eleveId, 'evaluationId' => $evaluationId] = $this->construireScenario();

        $uuidNote = (string) Str::uuid();
        $uuidPresence = (string) Str::uuid();
        $lot = [
            'ecritures' => [
                ['sync_uuid' => $uuidNote, 'type' => 'note', 'payload' => ['evaluation_id' => $evaluationId, 'eleve_id' => $eleveId, 'valeur' => 15]],
                ['sync_uuid' => $uuidPresence, 'type' => 'presence', 'payload' => ['classe_id' => $classeId, 'eleve_id' => $eleveId, 'date' => '2026-11-05', 'statut' => 'present']],
            ],
        ];

        $this->actingAs($prof, 'sanctum')->postJson('/api/v1/sync/batch', $lot)->assertOk();

        $this->assertDatabaseCount('notes', 1);
        $this->assertDatabaseCount('presences', 1);

        // Rejeu (retransmission simulée après coupure réseau).
        $reponse = $this->actingAs($prof, 'sanctum')->postJson('/api/v1/sync/batch', $lot);

        $reponse->assertOk();
        $resultats = collect($reponse->json('resultats'))->keyBy('sync_uuid');
        $this->assertSame('deja_applique', $resultats[$uuidNote]['statut']);
        $this->assertSame('deja_applique', $resultats[$uuidPresence]['statut']);

        // Toujours une seule ligne de chaque : aucun doublon créé par le rejeu.
        $this->assertDatabaseCount('notes', 1);
        $this->assertDatabaseCount('presences', 1);
    }

    public function test_enseignant_non_affecte_est_rejete_sans_casser_le_lot(): void
    {
        [
            'admin' => $admin,
            'etablissementId' => $etablissementId,
            'eleveId' => $eleveId,
            'evaluationId' => $evaluationId,
        ] = $this->construireScenario();

        // Un enseignant RATTACHÉ à l'établissement (sinon c'est le middleware,
        // pas SyncController, qui bloque en 409 avant même d'atteindre le
        // contrôleur) mais non affecté à CETTE évaluation.
        $telIntrus = $this->faker->unique()->numerify('+2246########');
        $this->actingAs($admin, 'sanctum')
            ->postJson("/api/v1/etablissements/{$etablissementId}/utilisateurs", [
                'nom' => 'Toure', 'prenom' => 'Intrus', 'telephone' => $telIntrus, 'role' => 'enseignant',
            ])->assertCreated();
        $intrus = Utilisateur::where('telephone', $telIntrus)->firstOrFail();

        $reponse = $this->actingAs($intrus, 'sanctum')->postJson('/api/v1/sync/batch', [
            'ecritures' => [
                ['sync_uuid' => (string) Str::uuid(), 'type' => 'note', 'payload' => ['evaluation_id' => $evaluationId, 'eleve_id' => $eleveId, 'valeur' => 18]],
            ],
        ]);

        $reponse->assertOk(); // le rejet est porté par le champ statut, pas par le code HTTP
        $this->assertSame('rejete', $reponse->json('resultats.0.statut'));
        $this->assertDatabaseCount('notes', 0);
    }
}
