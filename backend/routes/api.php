<?php

use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;

/*
 * Miroir de docs/openapi.yaml. Base URL : /api/v1 (le préfixe /api vient de
 * bootstrap/app.php, /v1 est posé ici).
 *
 * Seul le module Auth est implémenté à ce stade — c'est la tranche
 * verticale qui prouve la chaîne route -> contrôleur -> Sanctum -> Postgres
 * (RLS comprise) de bout en bout. Les 31 autres endpoints du contrat sont
 * à construire module par module en Phase 1 (docs/mvp-scope.md).
 */
Route::prefix('v1')->group(function () {

    Route::post('/auth/login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/auth/me', [AuthController::class, 'me']);
        Route::post('/auth/logout', [AuthController::class, 'logout']);
    });

    // TODO Phase 1 — voir docs/api-contract.md pour l'index complet :
    // Établissements, Utilisateurs, Années scolaires, Classes, Matières,
    // Élèves, Emploi du temps, Évaluations, Bulletins, Présences,
    // Finances, Communication, Synchronisation.
});
