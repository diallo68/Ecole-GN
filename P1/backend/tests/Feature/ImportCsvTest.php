<?php

namespace Tests\Feature;

use App\Models\Utilisateur;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Http\UploadedFile;
use Tests\Concerns\RefreshDatabaseAvecProprietaire;
use Tests\TestCase;

/**
 * Verrouille POST /etablissements/{id}/eleves/import et
 * .../utilisateurs/import — parcours critique n°1 (docs/mvp-scope.md) :
 * « la direction importe la liste des élèves via CSV ». Vérifie surtout
 * qu'une ligne invalide n'affecte pas les autres (même principe que
 * SyncBatchTest pour /sync/batch).
 */
class ImportCsvTest extends TestCase
{
    use RefreshDatabaseAvecProprietaire, WithFaker;

    private function creerEtablissementEtAdmin(): array
    {
        $superAdmin = Utilisateur::factory()->superAdmin()->create(['telephone' => $this->faker->unique()->numerify('+2246########')]);

        $etablissementId = $this->actingAs($superAdmin, 'sanctum')
            ->postJson('/api/v1/etablissements', ['nom' => 'École Import', 'cycle' => 'primaire'])
            ->assertCreated()->json('id');

        $telAdmin = $this->faker->unique()->numerify('+2246########');
        $this->actingAs($superAdmin, 'sanctum')
            ->postJson("/api/v1/etablissements/{$etablissementId}/utilisateurs", [
                'nom' => 'Diallo', 'prenom' => 'Admin', 'telephone' => $telAdmin, 'role' => 'admin_etablissement',
            ])->assertCreated();
        $admin = Utilisateur::where('telephone', $telAdmin)->firstOrFail();

        return [$etablissementId, $admin];
    }

    public function test_import_eleves_cree_les_lignes_valides_et_rapporte_les_invalides(): void
    {
        [$etablissementId, $admin] = $this->creerEtablissementEtAdmin();

        $csv = "nom,prenom,matricule,date_naissance,sexe\n"
            ."Diallo,Fatoumata,,2015-03-12,F\n" // matricule auto-généré
            .",Ibrahim,MAT-01,2014-06-01,M\n" // nom manquant : invalide
            ."Camara,Sekou,,2013-11-20,X\n"; // sexe invalide

        $fichier = UploadedFile::fake()->createWithContent('eleves.csv', $csv);

        $reponse = $this->actingAs($admin, 'sanctum')
            ->post("/api/v1/etablissements/{$etablissementId}/eleves/import", ['fichier' => $fichier])
            ->assertStatus(202);

        $reponse->assertJson([
            'lignes_recues' => 3,
            'nb_crees' => 1,
            'nb_erreurs' => 2,
        ]);
        $this->assertNotEmpty($reponse->json('import_id'));
        $this->assertCount(2, $reponse->json('erreurs'));
        // Numéros de ligne 1-based avec l'en-tête en ligne 1 : les deux
        // lignes fautives du fichier sont bien les lignes 3 et 4.
        $this->assertEquals([3, 4], array_column($reponse->json('erreurs'), 'ligne'));

        $eleve = $this->actingAs($admin, 'sanctum')
            ->getJson("/api/v1/etablissements/{$etablissementId}/eleves")
            ->assertOk()
            ->json('data.0');
        $this->assertEquals('Diallo', $eleve['nom']);
        $this->assertNotEmpty($eleve['matricule']);
    }

    public function test_import_eleves_accepte_un_csv_sans_les_colonnes_optionnelles(): void
    {
        // Bug réel trouvé en testant l'écran d'import à travers le proxy
        // Vite, pas en relisant le code : une colonne "matricule" absente
        // de l'en-tête (pas juste vide) n'existe pas du tout comme clé
        // dans la ligne décodée — un accès direct levait une erreur
        // "Undefined array key". Un CSV avec seulement nom,prenom est un
        // cas réel (une école sans matricules pré-assignés).
        [$etablissementId, $admin] = $this->creerEtablissementEtAdmin();

        $csv = "nom,prenom\nCoulibaly,Aissatou\nBangoura,Ibrahim\n";
        $fichier = UploadedFile::fake()->createWithContent('eleves.csv', $csv);

        $this->actingAs($admin, 'sanctum')
            ->post("/api/v1/etablissements/{$etablissementId}/eleves/import", ['fichier' => $fichier])
            ->assertStatus(202)
            ->assertJson(['lignes_recues' => 2, 'nb_crees' => 2, 'nb_erreurs' => 0]);
    }

    public function test_import_eleves_colonnes_optionnelles_presentes_mais_vides(): void
    {
        // Complète test_..._sans_les_colonnes_optionnelles ci-dessus :
        // ici les colonnes existent dans l'en-tête mais sont vides pour
        // chaque ligne (cas réel : un tableur exporté avec toutes les
        // colonnes même quand rien n'y est saisi) — même bug que celui
        // trouvé sur l'import utilisateurs (cellule vide -> '' et non
        // null, voir LecteurCsv::lignes), ici sans contrainte UNIQUE pour
        // le déclencher directement mais qui aurait fait échouer le cast
        // `date` de date_naissance sur une chaîne vide.
        [$etablissementId, $admin] = $this->creerEtablissementEtAdmin();

        $csv = "nom,prenom,matricule,date_naissance,sexe\n"
            ."Toure,Fatoumata,,,\n"
            ."Kaba,Sekou,,,\n";
        $fichier = UploadedFile::fake()->createWithContent('eleves.csv', $csv);

        $this->actingAs($admin, 'sanctum')
            ->post("/api/v1/etablissements/{$etablissementId}/eleves/import", ['fichier' => $fichier])
            ->assertStatus(202)
            ->assertJson(['lignes_recues' => 2, 'nb_crees' => 2, 'nb_erreurs' => 0]);
    }

    public function test_import_eleves_matricule_deja_utilise_rejette_la_ligne_sans_casser_les_autres(): void
    {
        [$etablissementId, $admin] = $this->creerEtablissementEtAdmin();

        $this->actingAs($admin, 'sanctum')
            ->postJson("/api/v1/etablissements/{$etablissementId}/eleves", [
                'nom' => 'Existant', 'prenom' => 'Déjà', 'matricule' => 'MAT-DUP',
            ])->assertCreated();

        $csv = "nom,prenom,matricule\n"
            ."Doublon,Test,MAT-DUP\n"
            ."Nouveau,Test,MAT-NEUF\n";
        $fichier = UploadedFile::fake()->createWithContent('eleves.csv', $csv);

        $reponse = $this->actingAs($admin, 'sanctum')
            ->post("/api/v1/etablissements/{$etablissementId}/eleves/import", ['fichier' => $fichier])
            ->assertStatus(202);

        $reponse->assertJson(['nb_crees' => 1, 'nb_erreurs' => 1]);
    }

    public function test_import_utilisateurs_deux_lignes_avec_email_vide_ne_se_percutent_pas(): void
    {
        // Bug réel trouvé en import réel (pas en écrivant le test au
        // départ) : une cellule CSV vide devenait '' et non null — sans
        // conséquence pour une colonne quelconque, mais utilisateurs.email
        // porte une contrainte UNIQUE nullable : Postgres autorise
        // plusieurs NULL, jamais plusieurs ''. Deux lignes avec la colonne
        // email présente mais vide (pas absente — colonne présente
        // distingue ce cas de test_import_utilisateurs_reutilise... plus
        // bas, dont le CSV n'a même pas de colonne email) se percutaient
        // donc l'une l'autre.
        [$etablissementId, $admin] = $this->creerEtablissementEtAdmin();

        $tel1 = $this->faker->unique()->numerify('+2246########');
        $tel2 = $this->faker->unique()->numerify('+2246########');
        $csv = "nom,prenom,telephone,email,role\n"
            ."Un,Test,{$tel1},,enseignant\n"
            ."Deux,Test,{$tel2},,personnel_administratif\n";
        $fichier = UploadedFile::fake()->createWithContent('utilisateurs.csv', $csv);

        $this->actingAs($admin, 'sanctum')
            ->post("/api/v1/etablissements/{$etablissementId}/utilisateurs/import", ['fichier' => $fichier])
            ->assertStatus(202)
            ->assertJson(['nb_crees' => 2, 'nb_erreurs' => 0]);
    }

    public function test_import_utilisateurs_reutilise_un_compte_existant_par_telephone(): void
    {
        [$etablissementId, $admin] = $this->creerEtablissementEtAdmin();
        $telephoneExistant = $this->faker->unique()->numerify('+2246########');

        Utilisateur::factory()->create(['telephone' => $telephoneExistant, 'nom' => 'Barry']);

        $csv = "nom,prenom,telephone,role\n"
            ."Barry,Nouveau nom ignoré,{$telephoneExistant},enseignant\n"
            ."Sylla,Aminata,{$this->faker->unique()->numerify('+2246########')},parent\n"
            ."Ligne,Invalide,pas-un-role-valide,role_inexistant\n";
        $fichier = UploadedFile::fake()->createWithContent('utilisateurs.csv', $csv);

        $reponse = $this->actingAs($admin, 'sanctum')
            ->post("/api/v1/etablissements/{$etablissementId}/utilisateurs/import", ['fichier' => $fichier])
            ->assertStatus(202);

        $reponse->assertJson(['lignes_recues' => 3, 'nb_crees' => 2, 'nb_erreurs' => 1]);

        // Le compte existant est réutilisé (même téléphone), pas dupliqué :
        // son nom d'origine ('Barry') n'est pas écrasé par la ligne CSV.
        $this->assertEquals(1, Utilisateur::where('telephone', $telephoneExistant)->count());
        $this->assertEquals('Barry', Utilisateur::where('telephone', $telephoneExistant)->value('nom'));
    }
}
