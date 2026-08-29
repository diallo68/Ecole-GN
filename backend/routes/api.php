<?php

use App\Http\Controllers\AnneeScolaireController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ClasseController;
use App\Http\Controllers\EleveController;
use App\Http\Controllers\EtablissementController;
use App\Http\Controllers\EtablissementUtilisateurController;
use App\Http\Controllers\MatiereController;
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
    });

    // TODO Phase 1 — voir docs/api-contract.md pour l'index complet :
    // Emploi du temps, Évaluations, Bulletins, Présences, Finances,
    // Communication, Synchronisation.
});
