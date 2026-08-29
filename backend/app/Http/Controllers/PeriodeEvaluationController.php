<?php

namespace App\Http\Controllers;

use App\Models\PeriodeEvaluation;
use Illuminate\Http\Request;

/**
 * Correspond à /etablissements/{etablissementId}/periodes et
 * /periodes/{id} dans docs/openapi.yaml. Ajouté (comme le contrat) en
 * construisant le module Évaluations/Notes — les évaluations référencent
 * periode_id, aucun endpoint ne permettait d'en créer jusque-là.
 */
class PeriodeEvaluationController extends Controller
{
    public function index(Request $request, int $etablissementId)
    {
        $query = PeriodeEvaluation::where('etablissement_id', $etablissementId);

        if ($request->filled('annee_scolaire_id')) {
            $query->where('annee_scolaire_id', $request->integer('annee_scolaire_id'));
        }

        return response()->json($query->orderBy('date_debut')->get());
    }

    public function store(Request $request, int $etablissementId)
    {
        $this->autoriserAdmin($request);

        $validated = $request->validate([
            'libelle' => ['required', 'string', 'max:30'],
            'annee_scolaire_id' => ['required', 'integer'],
            'date_debut' => ['required', 'date'],
            'date_fin' => ['required', 'date', 'after:date_debut'],
        ]);

        $periode = PeriodeEvaluation::create([...$validated, 'etablissement_id' => $etablissementId]);

        return response()->json($periode, 201);
    }

    public function update(Request $request, int $id)
    {
        $this->autoriserAdmin($request);

        $periode = PeriodeEvaluation::findOrFail($id);

        $validated = $request->validate([
            'statut' => ['required', 'in:en_cours,cloturee'],
        ]);

        $periode->update($validated);

        return response()->json($periode);
    }

    private function autoriserAdmin(Request $request): void
    {
        $superAdmin = $request->user()->est_super_admin;
        $admin = $request->attributes->get('role_etablissement') === 'admin_etablissement';

        abort_unless($superAdmin || $admin, 403, "Réservé à l'administrateur de l'établissement.");
    }
}
