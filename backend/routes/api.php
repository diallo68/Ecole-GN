<?php

use App\Http\Controllers\AnneeScolaireController;
use App\Http\Controllers\AnnonceController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BulletinController;
use App\Http\Controllers\ClasseController;
use App\Http\Controllers\EcheanceController;
use App\Http\Controllers\EleveController;
use App\Http\Controllers\EmploiDuTempsController;
use App\Http\Controllers\EtablissementController;
use App\Http\Controllers\EtablissementUtilisateurController;
use App\Http\Controllers\EvaluationController;
use App\Http\Controllers\FraisScolariteController;
use App\Http\Controllers\MatiereController;
use App\Http\Controllers\PaiementController;
use App\Http\Controllers\PeriodeEvaluationController;
use App\Http\Controllers\PresenceController;
use App\Http\Controllers\SyncController;
use Illuminate\Support\Facades\Route;

/*
 * Miroir de docs/openapi.yaml. Base URL : /api/v1 (le préfixe /api vient de
 * bootstrap/app.php, /v1 est posé ici).
 *
 * Le paramètre de route {etablissementId} (au lieu du {id} générique
 * d'openapi.yaml sur /etablissements/{id}) est délibéré : c'est ce nom que
 * ResolveEtablissementContext lit pour poser app.current_etablissement_id
 * (RLS) — voir app/Http/Middleware/ResolveEtablissementContext.php.
 */
Route::prefix('v1')->group(function () {

    Route::post('/auth/login', [AuthController::class, 'login']);

    Route::middleware(['auth:sanctum', 'tenant'])->group(function () {
        Route::get('/auth/me', [AuthController::class, 'me']);
        Route::post('/auth/logout', [AuthController::class, 'logout']);

        Route::get('/etablissements', [EtablissementController::class, 'index']);
        Route::post('/etablissements', [EtablissementController::class, 'store']);
        Route::get('/etablissements/{etablissementId}', [EtablissementController::class, 'show']);
        Route::patch('/etablissements/{etablissementId}', [EtablissementController::class, 'update']);

        Route::get('/etablissements/{etablissementId}/utilisateurs', [EtablissementUtilisateurController::class, 'index']);
        Route::post('/etablissements/{etablissementId}/utilisateurs', [EtablissementUtilisateurController::class, 'store']);

        Route::get('/etablissements/{etablissementId}/annees-scolaires', [AnneeScolaireController::class, 'index']);
        Route::post('/etablissements/{etablissementId}/annees-scolaires', [AnneeScolaireController::class, 'store']);
        Route::patch('/annees-scolaires/{id}', [AnneeScolaireController::class, 'update']);

        Route::get('/etablissements/{etablissementId}/classes', [ClasseController::class, 'index']);
        Route::post('/etablissements/{etablissementId}/classes', [ClasseController::class, 'store']);
        Route::get('/classes/{id}', [ClasseController::class, 'show']);
        Route::patch('/classes/{id}', [ClasseController::class, 'update']);
        Route::get('/classes/{id}/eleves', [ClasseController::class, 'eleves']);

        Route::get('/etablissements/{etablissementId}/matieres', [MatiereController::class, 'index']);
        Route::post('/etablissements/{etablissementId}/matieres', [MatiereController::class, 'store']);
        Route::put('/classes/{classeId}/matieres/{matiereId}/enseignant', [MatiereController::class, 'affecterEnseignant']);

        Route::get('/etablissements/{etablissementId}/eleves', [EleveController::class, 'index']);
        Route::post('/etablissements/{etablissementId}/eleves', [EleveController::class, 'store']);
        Route::get('/eleves/{id}', [EleveController::class, 'show']);
        Route::post('/eleves/{id}/inscriptions', [EleveController::class, 'inscrire']);
        Route::get('/eleves/{id}/parents', [EleveController::class, 'parents']);
        Route::post('/eleves/{id}/parents', [EleveController::class, 'lierParent']);

        Route::get('/etablissements/{etablissementId}/periodes', [PeriodeEvaluationController::class, 'index']);
        Route::post('/etablissements/{etablissementId}/periodes', [PeriodeEvaluationController::class, 'store']);
        Route::patch('/periodes/{id}', [PeriodeEvaluationController::class, 'update']);

        Route::post('/classes/{classeId}/matieres/{matiereId}/evaluations', [EvaluationController::class, 'store']);
        Route::get('/evaluations/{id}/notes', [EvaluationController::class, 'notesIndex']);
        Route::put('/evaluations/{id}/notes', [EvaluationController::class, 'notesStore']);

        Route::post('/periodes/{periodeId}/bulletins/generer', [BulletinController::class, 'generer']);
        Route::get('/eleves/{id}/bulletins', [BulletinController::class, 'pourEleve']);
        Route::post('/bulletins/{id}/valider', [BulletinController::class, 'valider']);

        Route::post('/classes/{id}/presences/appel', [PresenceController::class, 'appel']);
        Route::get('/classes/{id}/presences', [PresenceController::class, 'pourClasse']);
        Route::get('/eleves/{id}/presences', [PresenceController::class, 'pourEleve']);

        Route::get('/classes/{id}/emploi-du-temps', [EmploiDuTempsController::class, 'index']);
        Route::post('/classes/{id}/emploi-du-temps', [EmploiDuTempsController::class, 'store']);

        Route::get('/etablissements/{etablissementId}/frais-scolarite', [FraisScolariteController::class, 'index']);
        Route::post('/etablissements/{etablissementId}/frais-scolarite', [FraisScolariteController::class, 'store']);

        Route::get('/eleves/{id}/echeances', [EcheanceController::class, 'index']);
        Route::post('/eleves/{id}/echeances', [EcheanceController::class, 'store']);

        Route::post('/echeances/{id}/paiements', [PaiementController::class, 'store']);
        Route::get('/paiements/{id}/recu', [PaiementController::class, 'recu']);

        Route::get('/etablissements/{etablissementId}/annonces', [AnnonceController::class, 'index']);
        Route::post('/etablissements/{etablissementId}/annonces', [AnnonceController::class, 'store']);

        Route::post('/sync/batch', [SyncController::class, 'batch']);
    });
});
