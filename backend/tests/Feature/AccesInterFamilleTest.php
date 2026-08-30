<?php

namespace Tests\Feature;

use App\Models\Eleve;
use App\Models\Utilisateur;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\Concerns\RefreshDatabaseAvecProprietaire;
use Tests\TestCase;

/**
 * Verrouille en régression une série de failles d'autorisation trouvées le
 * 30 août 2026 : plusieurs endpoints scopés « élève » ou « classe »
 * n'avaient AUCUNE vérification au-delà de la RLS — qui, pour bulletins,
 * presences, evaluations/notes et paiements, ne scope qu'à
 * l'ÉTABLISSEMENT, pas à l'élève (022_rls_policies.sql). N'importe quel
 * utilisateur rattaché à un établissement pouvait donc lire les bulletins,
 * l'historique de présence, les notes de classe entière ou les
 * coordonnées des parents de N'IMPORTE QUEL élève de l'établissement, pas
 * seulement les siens — alors qu'api-contract.md documentait déjà des
 * rôles plus restreints pour chacun de ces endpoints. Voir les
 * commentaires dans BulletinController, PresenceController,
 * EvaluationController, EleveController et PaiementController.
 *
 * Scénario : deux familles (A et B) dans le même établissement, chacune
 * avec un enfant dans une classe différente. Chaque test vérifie qu'un
 * acteur légitime (parent de l'enfant, enseignant affecté) obtient 200,
 * et qu'un acteur de la famille/classe voisine obtient 403 — pas
 * seulement que l'accès légitime fonctionne.
 */
class AccesInterFamilleTest extends TestCase
{
    use RefreshDatabaseAvecProprietaire, WithFaker;

    private function creerScenario(): array
    {
        $superAdmin = Utilisateur::factory()->superAdmin()->create(['telephone' => $this->faker->unique()->numerify('+2246########')]);

        $etablissementId = $this->actingAs($superAdmin, 'sanctum')
            ->postJson('/api/v1/etablissements', ['nom' => 'École Sécurité', 'cycle' => 'primaire'])
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

        $telProfA = $this->faker->unique()->numerify('+2246########');
        $this->actingAs($admin, 'sanctum')
            ->postJson("/api/v1/etablissements/{$etablissementId}/utilisateurs", [
                'nom' => 'Barry', 'prenom' => 'ProfA', 'telephone' => $telProfA, 'role' => 'enseignant',
            ])->assertCreated();
        $profA = Utilisateur::where('telephone', $telProfA)->firstOrFail();

        $telProfB = $this->faker->unique()->numerify('+2246########');
        $this->actingAs($admin, 'sanctum')
            ->postJson("/api/v1/etablissements/{$etablissementId}/utilisateurs", [
                'nom' => 'Sylla', 'prenom' => 'ProfB', 'telephone' => $telProfB, 'role' => 'enseignant',
            ])->assertCreated();
        $profB = Utilisateur::where('telephone', $telProfB)->firstOrFail();

        $this->actingAs($admin, 'sanctum')
            ->putJson("/api/v1/classes/{$classeAId}/matieres/{$matiereId}/enseignant", ['enseignant_id' => $profA->id])
            ->assertOk();
        $this->actingAs($admin, 'sanctum')
            ->putJson("/api/v1/classes/{$classeBId}/matieres/{$matiereId}/enseignant", ['enseignant_id' => $profB->id])
            ->assertOk();

        $eleveAId = $this->actingAs($admin, 'sanctum')
            ->postJson("/api/v1/etablissements/{$etablissementId}/eleves", ['nom' => 'FamilleA', 'prenom' => 'Enfant'])
            ->assertCreated()->json('id');
        $this->actingAs($admin, 'sanctum')
            ->postJson("/api/v1/eleves/{$eleveAId}/inscriptions", ['classe_id' => $classeAId, 'annee_scolaire_id' => $anneeId])
            ->assertCreated();

        $eleveBId = $this->actingAs($admin, 'sanctum')
            ->postJson("/api/v1/etablissements/{$etablissementId}/eleves", ['nom' => 'FamilleB', 'prenom' => 'Enfant'])
            ->assertCreated()->json('id');
        $this->actingAs($admin, 'sanctum')
            ->postJson("/api/v1/eleves/{$eleveBId}/inscriptions", ['classe_id' => $classeBId, 'annee_scolaire_id' => $anneeId])
            ->assertCreated();

        $telParentA = $this->faker->unique()->numerify('+2246########');
        $this->actingAs($admin, 'sanctum')
            ->postJson("/api/v1/eleves/{$eleveAId}/parents", [
                'telephone' => $telParentA, 'nom' => 'FamilleA', 'prenom' => 'Parent', 'lien' => 'mere',
            ])->assertCreated();
        $parentA = Utilisateur::where('telephone', $telParentA)->firstOrFail();

        $telParentB = $this->faker->unique()->numerify('+2246########');
        $this->actingAs($admin, 'sanctum')
            ->postJson("/api/v1/eleves/{$eleveBId}/parents", [
                'telephone' => $telParentB, 'nom' => 'FamilleB', 'prenom' => 'Parent', 'lien' => 'pere',
            ])->assertCreated();
        $parentB = Utilisateur::where('telephone', $telParentB)->firstOrFail();

        $periodeId = $this->actingAs($admin, 'sanctum')
            ->postJson("/api/v1/etablissements/{$etablissementId}/periodes", [
                'libelle' => 'T1', 'annee_scolaire_id' => $anneeId, 'date_debut' => '2026-10-01', 'date_fin' => '2026-12-20',
            ])->assertCreated()->json('id');

        $evalAId = $this->actingAs($profA, 'sanctum')
            ->postJson("/api/v1/classes/{$classeAId}/matieres/{$matiereId}/evaluations", [
                'type' => 'devoir', 'libelle' => 'Devoir', 'periode_id' => $periodeId, 'date_evaluation' => '2026-11-01',
            ])->assertCreated()->json('id');
        $this->actingAs($profA, 'sanctum')
            ->putJson("/api/v1/evaluations/{$evalAId}/notes", ['notes' => [['eleve_id' => $eleveAId, 'valeur' => 15]]])
            ->assertOk();

        $this->actingAs($admin, 'sanctum')
            ->postJson("/api/v1/periodes/{$periodeId}/bulletins/generer", ['classe_id' => $classeAId])
            ->assertStatus(202);

        $this->actingAs($profA, 'sanctum')
            ->postJson("/api/v1/classes/{$classeAId}/presences/appel", [
                'date' => '2026-11-05',
                'presences' => [['eleve_id' => $eleveAId, 'statut' => 'absent']],
            ])->assertOk();

        $fraisId = $this->actingAs($admin, 'sanctum')
            ->postJson("/api/v1/etablissements/{$etablissementId}/frais-scolarite", [
                'niveau' => 'CM2', 'annee_scolaire_id' => $anneeId, 'montant_total' => 100000,
            ])->assertCreated()->json('id');
        $echeanceAId = $this->actingAs($admin, 'sanctum')
            ->postJson("/api/v1/eleves/{$eleveAId}/echeances", [
                'frais_scolarite_id' => $fraisId, 'libelle' => 'Scolarité T1', 'montant_du' => 100000, 'date_echeance' => '2026-11-30',
            ])->assertCreated()->json('id');
        $paiementAId = $this->actingAs($admin, 'sanctum')
            ->postJson("/api/v1/echeances/{$echeanceAId}/paiements", ['montant' => 50000, 'mode' => 'especes'])
            ->assertCreated()->json('id');

        return compact(
            'admin', 'profA', 'profB', 'parentA', 'parentB',
            'classeAId', 'classeBId', 'eleveAId', 'eleveBId', 'evalAId', 'paiementAId'
        );
    }

    public function test_bulletins_dun_eleve_invisibles_au_parent_dun_autre_eleve(): void
    {
        $s = $this->creerScenario();

        $this->actingAs($s['parentA'], 'sanctum')
            ->getJson("/api/v1/eleves/{$s['eleveAId']}/bulletins")
            ->assertOk();

        $this->actingAs($s['parentB'], 'sanctum')
            ->getJson("/api/v1/eleves/{$s['eleveAId']}/bulletins")
            ->assertForbidden();
    }

    public function test_bulletin_brouillon_invisible_au_parent_mais_visible_a_ladmin(): void
    {
        $s = $this->creerScenario();
        // creerScenario() génère un bulletin pour eleveA mais ne le publie
        // jamais — il reste au statut par défaut 'brouillon'.

        $this->actingAs($s['admin'], 'sanctum')
            ->getJson("/api/v1/eleves/{$s['eleveAId']}/bulletins")
            ->assertOk()
            ->assertJsonCount(1);

        $this->actingAs($s['parentA'], 'sanctum')
            ->getJson("/api/v1/eleves/{$s['eleveAId']}/bulletins")
            ->assertOk()
            ->assertJsonCount(0);
    }

    public function test_presences_dun_eleve_invisibles_au_parent_dun_autre_eleve(): void
    {
        $s = $this->creerScenario();

        $this->actingAs($s['parentA'], 'sanctum')
            ->getJson("/api/v1/eleves/{$s['eleveAId']}/presences")
            ->assertOk();

        $this->actingAs($s['parentB'], 'sanctum')
            ->getJson("/api/v1/eleves/{$s['eleveAId']}/presences")
            ->assertForbidden();
    }

    public function test_presences_de_classe_invisibles_a_un_enseignant_dune_autre_classe(): void
    {
        $s = $this->creerScenario();

        $this->actingAs($s['profA'], 'sanctum')
            ->getJson("/api/v1/classes/{$s['classeAId']}/presences?date=2026-11-05")
            ->assertOk();

        $this->actingAs($s['profB'], 'sanctum')
            ->getJson("/api/v1/classes/{$s['classeAId']}/presences?date=2026-11-05")
            ->assertForbidden();
    }

    public function test_notes_dune_evaluation_invisibles_a_un_enseignant_non_affecte(): void
    {
        $s = $this->creerScenario();

        $this->actingAs($s['profA'], 'sanctum')
            ->getJson("/api/v1/evaluations/{$s['evalAId']}/notes")
            ->assertOk();

        $this->actingAs($s['profB'], 'sanctum')
            ->getJson("/api/v1/evaluations/{$s['evalAId']}/notes")
            ->assertForbidden();
    }

    public function test_coordonnees_des_parents_invisibles_a_un_enseignant(): void
    {
        $s = $this->creerScenario();

        $this->actingAs($s['admin'], 'sanctum')
            ->getJson("/api/v1/eleves/{$s['eleveAId']}/parents")
            ->assertOk();

        $this->actingAs($s['profA'], 'sanctum')
            ->getJson("/api/v1/eleves/{$s['eleveAId']}/parents")
            ->assertForbidden();
    }

    public function test_liste_complete_des_eleves_invisible_a_un_enseignant(): void
    {
        $s = $this->creerScenario();

        $etablissementId = Eleve::find($s['eleveAId'])->etablissement_id;

        $this->actingAs($s['profA'], 'sanctum')
            ->getJson("/api/v1/etablissements/{$etablissementId}/eleves")
            ->assertForbidden();
    }

    public function test_recu_de_paiement_invisible_au_parent_dun_autre_eleve(): void
    {
        $s = $this->creerScenario();

        $this->actingAs($s['parentA'], 'sanctum')
            ->getJson("/api/v1/paiements/{$s['paiementAId']}/recu")
            ->assertOk();

        $this->actingAs($s['parentB'], 'sanctum')
            ->getJson("/api/v1/paiements/{$s['paiementAId']}/recu")
            ->assertForbidden();
    }

    public function test_mes_enfants_ne_renvoie_que_les_liens_du_parent_connecte(): void
    {
        $s = $this->creerScenario();

        $reponseA = $this->actingAs($s['parentA'], 'sanctum')->getJson('/api/v1/mes-enfants')->assertOk();
        $reponseA->assertJsonCount(1);
        $this->assertEquals($s['eleveAId'], $reponseA->json('0.id'));

        $reponseB = $this->actingAs($s['parentB'], 'sanctum')->getJson('/api/v1/mes-enfants')->assertOk();
        $reponseB->assertJsonCount(1);
        $this->assertEquals($s['eleveBId'], $reponseB->json('0.id'));
    }

    public function test_inscriptions_dune_classe_invisibles_a_un_enseignant(): void
    {
        $s = $this->creerScenario();

        $this->actingAs($s['admin'], 'sanctum')
            ->getJson("/api/v1/classes/{$s['classeAId']}/inscriptions")
            ->assertOk();

        $this->actingAs($s['profA'], 'sanctum')
            ->getJson("/api/v1/classes/{$s['classeAId']}/inscriptions")
            ->assertForbidden();
    }
}
