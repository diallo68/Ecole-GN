<?php

namespace Tests\Feature;

use App\Models\Utilisateur;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\Concerns\RefreshDatabaseAvecProprietaire;
use Tests\TestCase;

/**
 * Verrouille GET /etablissements/{id}/statistiques — cahier des charges
 * §4.9, jamais construit avant le 30 août 2026 malgré mvp-scope.md qui
 * le déclarait « Complet » (voir la note ajoutée dans ce document).
 *
 * Scénario à deux classes avec des résultats délibérément différents sur
 * chaque axe, pour vérifier que l'agrégation est bien PAR classe et pas
 * une moyenne globale qui masquerait des écarts réels entre classes.
 */
class StatistiquesTest extends TestCase
{
    use RefreshDatabaseAvecProprietaire, WithFaker;

    public function test_agrege_effectifs_absenteisme_reussite_et_recouvrement_par_classe(): void
    {
        $superAdmin = Utilisateur::factory()->superAdmin()->create(['telephone' => $this->faker->unique()->numerify('+2246########')]);

        $etablissementId = $this->actingAs($superAdmin, 'sanctum')
            ->postJson('/api/v1/etablissements', ['nom' => 'École Stats', 'cycle' => 'primaire'])
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
            ->putJson("/api/v1/classes/{$classeAId}/matieres/{$matiereId}/enseignant", ['enseignant_id' => $prof->id])
            ->assertOk();
        $this->actingAs($admin, 'sanctum')
            ->putJson("/api/v1/classes/{$classeBId}/matieres/{$matiereId}/enseignant", ['enseignant_id' => $prof->id])
            ->assertOk();

        $periodeId = $this->actingAs($admin, 'sanctum')
            ->postJson("/api/v1/etablissements/{$etablissementId}/periodes", [
                'libelle' => 'T1', 'annee_scolaire_id' => $anneeId, 'date_debut' => '2026-10-01', 'date_fin' => '2026-12-20',
            ])->assertCreated()->json('id');

        // Classe A : 2 élèves — un échoue (8), un réussit (14) -> 50%.
        // Classe B : 1 élève — réussit (16) -> 100%.
        $creerEleveInscritEtNote = function (string $nom, int $classeId, int $evaluationId, float $note) use ($etablissementId, $anneeId, $admin, $prof) {
            $eleveId = $this->actingAs($admin, 'sanctum')
                ->postJson("/api/v1/etablissements/{$etablissementId}/eleves", ['nom' => $nom, 'prenom' => $nom])
                ->assertCreated()->json('id');
            $this->actingAs($admin, 'sanctum')
                ->postJson("/api/v1/eleves/{$eleveId}/inscriptions", ['classe_id' => $classeId, 'annee_scolaire_id' => $anneeId])
                ->assertCreated();
            $this->actingAs($prof, 'sanctum')
                ->putJson("/api/v1/evaluations/{$evaluationId}/notes", ['notes' => [['eleve_id' => $eleveId, 'valeur' => $note]]])
                ->assertOk();

            return $eleveId;
        };

        $evalAId = $this->actingAs($prof, 'sanctum')
            ->postJson("/api/v1/classes/{$classeAId}/matieres/{$matiereId}/evaluations", [
                'type' => 'devoir', 'libelle' => 'Devoir', 'periode_id' => $periodeId, 'date_evaluation' => '2026-11-01',
            ])->assertCreated()->json('id');
        $evalBId = $this->actingAs($prof, 'sanctum')
            ->postJson("/api/v1/classes/{$classeBId}/matieres/{$matiereId}/evaluations", [
                'type' => 'devoir', 'libelle' => 'Devoir', 'periode_id' => $periodeId, 'date_evaluation' => '2026-11-01',
            ])->assertCreated()->json('id');

        $eleveA1 = $creerEleveInscritEtNote('Echoue', $classeAId, $evalAId, 8);
        $eleveA2 = $creerEleveInscritEtNote('Reussit', $classeAId, $evalAId, 14);
        $eleveB1 = $creerEleveInscritEtNote('ReussitAussi', $classeBId, $evalBId, 16);

        $this->actingAs($admin, 'sanctum')
            ->postJson("/api/v1/periodes/{$periodeId}/bulletins/generer", ['classe_id' => $classeAId])
            ->assertStatus(202);
        $this->actingAs($admin, 'sanctum')
            ->postJson("/api/v1/periodes/{$periodeId}/bulletins/generer", ['classe_id' => $classeBId])
            ->assertStatus(202);

        // Présences : classe A à 50% d'absentéisme (1 absent sur 2), classe
        // B à 0% (aucune absence).
        $this->actingAs($prof, 'sanctum')
            ->postJson("/api/v1/classes/{$classeAId}/presences/appel", [
                'date' => '2026-11-05',
                'presences' => [
                    ['eleve_id' => $eleveA1, 'statut' => 'absent'],
                    ['eleve_id' => $eleveA2, 'statut' => 'present'],
                ],
            ])->assertOk();
        $this->actingAs($prof, 'sanctum')
            ->postJson("/api/v1/classes/{$classeBId}/presences/appel", [
                'date' => '2026-11-05',
                'presences' => [['eleve_id' => $eleveB1, 'statut' => 'present']],
            ])->assertOk();

        // Recouvrement : 300 000 dus, 150 000 encaissés -> 50% global
        // (l'axe recouvrement n'est pas ventilé par classe, voir openapi.yaml).
        $fraisId = $this->actingAs($admin, 'sanctum')
            ->postJson("/api/v1/etablissements/{$etablissementId}/frais-scolarite", [
                'niveau' => 'CM2', 'annee_scolaire_id' => $anneeId, 'montant_total' => 100000,
            ])->assertCreated()->json('id');

        $creerEcheancePayee = function (int $eleveId, float $montantDu, float $montantPaye) use ($admin, $fraisId) {
            $echeanceId = $this->actingAs($admin, 'sanctum')
                ->postJson("/api/v1/eleves/{$eleveId}/echeances", [
                    'frais_scolarite_id' => $fraisId, 'libelle' => 'Scolarité T1', 'montant_du' => $montantDu, 'date_echeance' => '2026-11-30',
                ])->assertCreated()->json('id');

            if ($montantPaye > 0) {
                $this->actingAs($admin, 'sanctum')
                    ->postJson("/api/v1/echeances/{$echeanceId}/paiements", ['montant' => $montantPaye, 'mode' => 'especes'])
                    ->assertCreated();
            }
        };

        $creerEcheancePayee($eleveA1, 100000, 100000); // payé intégralement
        $creerEcheancePayee($eleveA2, 100000, 50000);   // partiel
        $creerEcheancePayee($eleveB1, 100000, 0);       // impayé

        $reponse = $this->actingAs($admin, 'sanctum')
            ->getJson("/api/v1/etablissements/{$etablissementId}/statistiques?annee_scolaire_id={$anneeId}")
            ->assertOk();

        $reponse->assertJson([
            'annee_scolaire_id' => $anneeId,
            'effectif_total' => 3,
            'taux_recouvrement' => 50.0,
        ]);
        // assertJson compare sans typage strict (une chaîne "18" passerait
        // silencieusement pour l'entier 18) — assertSame verrouille le
        // type réellement sérialisé en JSON, pas seulement sa valeur.
        // Piège réel : $validated['annee_scolaire_id'] issu d'un paramètre
        // de requête GET reste une chaîne même avec la règle 'integer'
        // (qui valide le format, ne convertit pas le type).
        $this->assertSame($anneeId, $reponse->json('annee_scolaire_id'));

        $parClasse = collect($reponse->json('par_classe'))->keyBy('classe_id');

        $statsA = $parClasse[$classeAId];
        $this->assertEquals(2, $statsA['effectif']);
        $this->assertEquals(50.0, $statsA['taux_absenteisme']);
        $this->assertEquals(50.0, $statsA['taux_reussite']);

        $statsB = $parClasse[$classeBId];
        $this->assertEquals(1, $statsB['effectif']);
        $this->assertEquals(0.0, $statsB['taux_absenteisme']);
        $this->assertEquals(100.0, $statsB['taux_reussite']);
    }

    public function test_axe_sans_donnee_renvoie_null_pas_zero(): void
    {
        $superAdmin = Utilisateur::factory()->superAdmin()->create(['telephone' => $this->faker->unique()->numerify('+2246########')]);

        $etablissementId = $this->actingAs($superAdmin, 'sanctum')
            ->postJson('/api/v1/etablissements', ['nom' => 'École Stats Vide', 'cycle' => 'primaire'])
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
            ->postJson("/api/v1/etablissements/{$etablissementId}/eleves", ['nom' => 'Sans', 'prenom' => 'Donnee'])
            ->assertCreated()->json('id');
        $this->actingAs($admin, 'sanctum')
            ->postJson("/api/v1/eleves/{$eleveId}/inscriptions", ['classe_id' => $classeId, 'annee_scolaire_id' => $anneeId])
            ->assertCreated();

        $reponse = $this->actingAs($admin, 'sanctum')
            ->getJson("/api/v1/etablissements/{$etablissementId}/statistiques?annee_scolaire_id={$anneeId}")
            ->assertOk();

        $reponse->assertJson(['effectif_total' => 1, 'taux_recouvrement' => null]);
        $stats = $reponse->json('par_classe.0');
        $this->assertEquals(1, $stats['effectif']);
        $this->assertNull($stats['taux_absenteisme']);
        $this->assertNull($stats['taux_reussite']);
    }
}
