<?php

namespace Tests\Feature;

use App\Models\Utilisateur;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\Concerns\RefreshDatabaseAvecProprietaire;
use Tests\TestCase;

/**
 * Verrouille deux champs ajoutés pour l'app mobile enseignant/parent (voir
 * mobile/lib/screens/emploi_du_temps_screen.dart) :
 *  - GET /classes/{id}/emploi-du-temps renvoie matiere/enseignant imbriqués
 *    (l'app mobile n'a pas accès à GET /etablissements/{id}/utilisateurs,
 *    réservé à l'administration, pour résoudre enseignant_id elle-même) ;
 *  - GET /mes-enfants renvoie la classe actuelle de chaque enfant.
 */
class EnrichissementMobileTest extends TestCase
{
    use RefreshDatabaseAvecProprietaire, WithFaker;

    public function test_emploi_du_temps_renvoie_matiere_et_enseignant_imbriques(): void
    {
        $superAdmin = Utilisateur::factory()->superAdmin()->create(['telephone' => $this->faker->unique()->numerify('+2246########')]);

        $etablissementId = $this->actingAs($superAdmin, 'sanctum')
            ->postJson('/api/v1/etablissements', ['nom' => 'École EDT', 'cycle' => 'primaire'])
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
            ->postJson("/api/v1/etablissements/{$etablissementId}/matieres", ['nom' => 'Mathématiques'])
            ->assertCreated()->json('id');

        $telProf = $this->faker->unique()->numerify('+2246########');
        $this->actingAs($admin, 'sanctum')
            ->postJson("/api/v1/etablissements/{$etablissementId}/utilisateurs", [
                'nom' => 'Barry', 'prenom' => 'Prof', 'telephone' => $telProf, 'role' => 'enseignant',
            ])->assertCreated();
        $prof = Utilisateur::where('telephone', $telProf)->firstOrFail();

        $this->actingAs($admin, 'sanctum')
            ->postJson("/api/v1/classes/{$classeId}/emploi-du-temps", [
                'matiere_id' => $matiereId, 'enseignant_id' => $prof->id,
                'jour_semaine' => 1, 'heure_debut' => '08:00', 'heure_fin' => '09:00',
            ])->assertCreated();

        $reponse = $this->actingAs($prof, 'sanctum')
            ->getJson("/api/v1/classes/{$classeId}/emploi-du-temps")
            ->assertOk();

        $this->assertEquals('Mathématiques', $reponse->json('0.matiere.nom'));
        $this->assertEquals('Barry', $reponse->json('0.enseignant.nom'));
    }

    public function test_mes_enfants_renvoie_la_classe_actuelle(): void
    {
        $superAdmin = Utilisateur::factory()->superAdmin()->create(['telephone' => $this->faker->unique()->numerify('+2246########')]);

        $etablissementId = $this->actingAs($superAdmin, 'sanctum')
            ->postJson('/api/v1/etablissements', ['nom' => 'École EDT 2', 'cycle' => 'primaire'])
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

        $telParent = $this->faker->unique()->numerify('+2246########');
        $this->actingAs($admin, 'sanctum')
            ->postJson("/api/v1/eleves/{$eleveId}/parents", [
                'telephone' => $telParent, 'nom' => 'Bah', 'prenom' => 'Parent', 'lien' => 'mere',
            ])->assertCreated();
        $parent = Utilisateur::where('telephone', $telParent)->firstOrFail();

        $reponse = $this->actingAs($parent, 'sanctum')->getJson('/api/v1/mes-enfants')->assertOk();

        $this->assertEquals($classeId, $reponse->json('0.classe.id'));
        $this->assertEquals('CM2 A', $reponse->json('0.classe.libelle'));
    }
}
