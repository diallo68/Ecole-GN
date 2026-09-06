<?php

namespace App\Http\Controllers;

use App\Models\FraisScolarite;
use Illuminate\Http\Request;

/**
 * Correspond à /etablissements/{etablissementId}/frais-scolarite dans
 * docs/openapi.yaml. Le barème (un montant total par niveau) ; le détail
 * en tranches se fait par élève via /eleves/{id}/echeances
 * (EcheanceController) — un même barème peut se répartir différemment
 * selon les familles (bourse, échelonnement négocié, etc.).
 */
class FraisScolariteController extends Controller
{
    public function index(Request $request, int $etablissementId)
    {
        $query = FraisScolarite::where('etablissement_id', $etablissementId);

        if ($request->filled('annee_scolaire_id')) {
            $query->where('annee_scolaire_id', $request->integer('annee_scolaire_id'));
        }

        return response()->json($query->orderBy('niveau')->get());
    }

    public function store(Request $request, int $etablissementId)
    {
        $this->autoriserFinances($request);

        $validated = $request->validate([
            'niveau' => ['required', 'string', 'max:30'],
            'annee_scolaire_id' => ['required', 'integer'],
            'montant_total' => ['required', 'numeric', 'min:0'],
        ]);

        $frais = FraisScolarite::create([...$validated, 'etablissement_id' => $etablissementId]);

        return response()->json($frais, 201);
    }

    private function autoriserFinances(Request $request): void
    {
        $superAdmin = $request->user()->est_super_admin;
        $role = $request->attributes->get('role_etablissement');

        abort_unless(
            $superAdmin || in_array($role, ['admin_etablissement', 'personnel_administratif'], true),
            403,
            'Réservé à la direction ou au personnel administratif.'
        );
    }
}
