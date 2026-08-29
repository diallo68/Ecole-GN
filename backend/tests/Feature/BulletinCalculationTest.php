<?php

namespace Tests\Feature;

use App\Models\Utilisateur;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\Concerns\RefreshDatabaseAvecProprietaire;
use Tests\TestCase;

/**
 * Verrouille en régression le calcul vérifié à la main lors de la
 * construction du module Bulletins (voir le commit correspondant) :
 * moyenne pondérée à deux niveaux, absence neutre, classement avec
 * égalité. Passe par l'API HTTP réelle plutôt que par
 * CalculBulletin::pourClasseEtPeriode() directement : cette classe lit
 * des tables protégées par RLS, un appel hors contexte de requête HTTP
 * échouerait pour la même raison que documentée dans
 * ResolveEtablissementContext — la leçon retenue en écrivant
 * TenantIsolationTest s'applique ici aussi.
 */
class BulletinCalculationTest extends TestCase
{
    use RefreshDatabaseAvecProprietaire, WithFaker;

    public function test_moyenne_ponderee_absence_neutre_et_classement_avec_egalite(): void
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

        // Maths coefficient 3 (2 évaluations : devoir coef 1, composition coef 2).
        // Français coefficient 2 (1 évaluation : composition coef 2).
        $mathsId = $this->actingAs($admin, 'sanctum')
            ->postJson("/api/v1/etablissements/{$etablissementId}/matieres", ['nom' => 'Mathématiques', 'coefficient_defaut' => 1])
            ->assertCreated()->json('id');
        $francaisId = $this->actingAs($admin, 'sanctum')
            ->postJson("/api/v1/etablissements/{$etablissementId}/matieres", ['nom' => 'Français', 'coefficient_defaut' => 1])
            ->assertCreated()->json('id');

        $telProf = $this->faker->unique()->numerify('+2246########');
        $this->actingAs($admin, 'sanctum')
            ->postJson("/api/v1/etablissements/{$etablissementId}/utilisateurs", [
                'nom' => 'Barry', 'prenom' => 'Prof', 'telephone' => $telProf, 'role' => 'enseignant',
            ])->assertCreated();
        $prof = Utilisateur::where('telephone', $telProf)->firstOrFail();

        $this->actingAs($admin, 'sanctum')
            ->putJson("/api/v1/classes/{$classeId}/matieres/{$mathsId}/enseignant", ['enseignant_id' => $prof->id, 'coefficient' => 3])
            ->assertOk();
        $this->actingAs($admin, 'sanctum')
            ->putJson("/api/v1/classes/{$classeId}/matieres/{$francaisId}/enseignant", ['enseignant_id' => $prof->id, 'coefficient' => 2])
            ->assertOk();

        $periodeId = $this->actingAs($admin, 'sanctum')
            ->postJson("/api/v1/etablissements/{$etablissementId}/periodes", [
                'libelle' => 'T1', 'annee_scolaire_id' => $anneeId, 'date_debut' => '2026-10-01', 'date_fin' => '2026-12-20',
            ])->assertCreated()->json('id');

        $devoirMathsId = $this->actingAs($prof, 'sanctum')
            ->postJson("/api/v1/classes/{$classeId}/matieres/{$mathsId}/evaluations", [
                'type' => 'devoir', 'libelle' => 'Devoir', 'coefficient' => 1, 'periode_id' => $periodeId, 'date_evaluation' => '2026-11-01',
            ])->assertCreated()->json('id');
        $compoMathsId = $this->actingAs($prof, 'sanctum')
            ->postJson("/api/v1/classes/{$classeId}/matieres/{$mathsId}/evaluations", [
                'type' => 'composition', 'libelle' => 'Compo', 'coefficient' => 2, 'periode_id' => $periodeId, 'date_evaluation' => '2026-12-10',
            ])->assertCreated()->json('id');
        $compoFrId = $this->actingAs($prof, 'sanctum')
            ->postJson("/api/v1/classes/{$classeId}/matieres/{$francaisId}/evaluations", [
                'type' => 'composition', 'libelle' => 'Compo', 'coefficient' => 2, 'periode_id' => $periodeId, 'date_evaluation' => '2026-12-11',
            ])->assertCreated()->json('id');

        // A: devoir=10, compo=16, fr=12   -> Maths (10+32)/3=14.00, Fr=12.00 -> generale (42+24)/5=13.20
        // B: devoir=8, compo=8, fr=18     -> Maths 24/3=8.00, Fr=18.00       -> generale (24+36)/5=12.00
        // C: devoir=absent, compo=20, pas de note en français                -> Maths seule: 20.00
        // D: identique à B                                                    -> egalite avec B, 12.00
        // E: devoir=5, compo=5, fr=5                                          -> generale 5.00, dernier
        $eleves = [];
        foreach (['A', 'B', 'C', 'D', 'E'] as $nom) {
            $eleveId = $this->actingAs($admin, 'sanctum')
                ->postJson("/api/v1/etablissements/{$etablissementId}/eleves", ['nom' => $nom, 'prenom' => $nom])
                ->assertCreated()->json('id');
            $this->actingAs($admin, 'sanctum')
                ->postJson("/api/v1/eleves/{$eleveId}/inscriptions", ['classe_id' => $classeId, 'annee_scolaire_id' => $anneeId])
                ->assertCreated();
            $eleves[$nom] = $eleveId;
        }

        $noter = function (int $evaluationId, array $notes) use ($prof) {
            $this->actingAs($prof, 'sanctum')
                ->putJson("/api/v1/evaluations/{$evaluationId}/notes", ['notes' => $notes])
                ->assertOk();
        };

        $noter($devoirMathsId, [
            ['eleve_id' => $eleves['A'], 'valeur' => 10],
            ['eleve_id' => $eleves['B'], 'valeur' => 8],
            ['eleve_id' => $eleves['C'], 'valeur' => null],
            ['eleve_id' => $eleves['D'], 'valeur' => 8],
            ['eleve_id' => $eleves['E'], 'valeur' => 5],
        ]);
        $noter($compoMathsId, [
            ['eleve_id' => $eleves['A'], 'valeur' => 16],
            ['eleve_id' => $eleves['B'], 'valeur' => 8],
            ['eleve_id' => $eleves['C'], 'valeur' => 20],
            ['eleve_id' => $eleves['D'], 'valeur' => 8],
            ['eleve_id' => $eleves['E'], 'valeur' => 5],
        ]);
        $noter($compoFrId, [
            ['eleve_id' => $eleves['A'], 'valeur' => 12],
            ['eleve_id' => $eleves['B'], 'valeur' => 18],
            // C : pas de note en français du tout.
            ['eleve_id' => $eleves['D'], 'valeur' => 18],
            ['eleve_id' => $eleves['E'], 'valeur' => 5],
        ]);

        $this->actingAs($admin, 'sanctum')
            ->postJson("/api/v1/periodes/{$periodeId}/bulletins/generer", ['classe_id' => $classeId])
            ->assertStatus(202)
            ->assertJson(['nb_bulletins' => 5]);

        $bulletinDe = function (int $eleveId) use ($admin) {
            return $this->actingAs($admin, 'sanctum')
                ->getJson("/api/v1/eleves/{$eleveId}/bulletins")
                ->assertOk()
                ->json('0');
        };

        $bA = $bulletinDe($eleves['A']);
        $this->assertEquals(13.20, (float) $bA['moyenne_generale']);
        $this->assertEquals(2, $bA['rang']);

        $bB = $bulletinDe($eleves['B']);
        $this->assertEquals(12.00, (float) $bB['moyenne_generale']);
        $this->assertEquals(3, $bB['rang']);

        $bC = $bulletinDe($eleves['C']);
        $this->assertEquals(20.00, (float) $bC['moyenne_generale']);
        $this->assertEquals(1, $bC['rang']);

        $bD = $bulletinDe($eleves['D']);
        $this->assertEquals(12.00, (float) $bD['moyenne_generale']);
        $this->assertEquals(3, $bD['rang'], 'D est à égalité avec B : même rang.');

        $bE = $bulletinDe($eleves['E']);
        $this->assertEquals(5.00, (float) $bE['moyenne_generale']);
        $this->assertEquals(5, $bE['rang'], 'Le rang 4 est sauté (deux élèves à égalité au rang 3).');

        foreach ([$bA, $bB, $bC, $bD, $bE] as $bulletin) {
            $this->assertEquals(5, $bulletin['effectif_classe']);
        }
    }
}
