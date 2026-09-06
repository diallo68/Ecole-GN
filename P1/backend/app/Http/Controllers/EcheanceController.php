<?php

namespace App\Http\Controllers;

use App\Models\Echeance;
use App\Models\Eleve;
use App\Models\FraisScolarite;
use App\Models\ParentEleve;
use Illuminate\Http\Request;

/**
 * Correspond à /eleves/{id}/echeances dans docs/openapi.yaml.
 */
class EcheanceController extends Controller
{
    public function index(Request $request, int $id)
    {
        $eleve = Eleve::findOrFail($id);
        $this->autoriserConsultation($request, $eleve);

        return response()->json(
            Echeance::where('eleve_id', $eleve->id)->orderBy('date_echeance')->get()
        );
    }

    public function store(Request $request, int $id)
    {
        $this->autoriserGestion($request);
        $eleve = Eleve::findOrFail($id);

        $validated = $request->validate([
            'frais_scolarite_id' => ['required', 'integer'],
            'libelle' => ['required', 'string', 'max:50'],
            'montant_du' => ['required', 'numeric', 'min:0'],
            'date_echeance' => ['required', 'date'],
        ]);

        // La RLS confirme que le barème appartient au même établissement.
        FraisScolarite::findOrFail($validated['frais_scolarite_id']);

        $echeance = Echeance::create([...$validated, 'eleve_id' => $eleve->id, 'statut' => 'impaye']);

        return response()->json($echeance, 201);
    }

    private function autoriserConsultation(Request $request, Eleve $eleve): void
    {
        $superAdmin = $request->user()->est_super_admin;
        $role = $request->attributes->get('role_etablissement');
        $gestionnaire = in_array($role, ['admin_etablissement', 'personnel_administratif'], true);

        if ($superAdmin || $gestionnaire) {
            return;
        }

        $estParent = ParentEleve::where('utilisateur_id', $request->user()->id)
            ->where('eleve_id', $eleve->id)
            ->exists();

        abort_unless($estParent, 403, "Vous n'avez pas accès à l'échéancier de cet élève.");
    }

    private function autoriserGestion(Request $request): void
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
