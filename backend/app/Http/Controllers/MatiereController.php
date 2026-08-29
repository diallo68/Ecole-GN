<?php

namespace App\Http\Controllers;

use App\Models\Classe;
use App\Models\ClasseMatiereEnseignant;
use App\Models\Matiere;
use Illuminate\Http\Request;

/**
 * Correspond à /etablissements/{etablissementId}/matieres dans
 * docs/openapi.yaml.
 */
class MatiereController extends Controller
{
    public function index(Request $request, int $etablissementId)
    {
        return response()->json(
            Matiere::where('etablissement_id', $etablissementId)->orderBy('nom')->get()
        );
    }

    public function store(Request $request, int $etablissementId)
    {
        $this->autoriserAdmin($request);

        $validated = $request->validate([
            'nom' => ['required', 'string', 'max:100'],
            'coefficient_defaut' => ['sometimes', 'numeric', 'min:0'],
        ]);

        $matiere = Matiere::create([...$validated, 'etablissement_id' => $etablissementId]);

        return response()->json($matiere, 201);
    }

    public function affecterEnseignant(Request $request, int $classeId, int $matiereId)
    {
        $this->autoriserAdmin($request);

        // findOrFail (pas juste un id validé) : la RLS doit confirmer que la
        // classe et la matière appartiennent bien à l'établissement courant.
        Classe::findOrFail($classeId);
        Matiere::findOrFail($matiereId);

        $validated = $request->validate([
            'enseignant_id' => ['required', 'integer'],
            'coefficient' => ['nullable', 'numeric', 'min:0'],
        ]);

        $affectation = ClasseMatiereEnseignant::updateOrCreate(
            ['classe_id' => $classeId, 'matiere_id' => $matiereId],
            $validated
        );

        return response()->json($affectation);
    }

    private function autoriserAdmin(Request $request): void
    {
        $superAdmin = $request->user()->est_super_admin;
        $admin = $request->attributes->get('role_etablissement') === 'admin_etablissement';

        abort_unless($superAdmin || $admin, 403, "Réservé à l'administrateur de l'établissement.");
    }
}
