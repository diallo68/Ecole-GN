<?php

namespace App\Http\Controllers;

use App\Models\AnneeScolaire;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * Correspond à /etablissements/{etablissementId}/annees-scolaires et
 * /annees-scolaires/{id} dans docs/openapi.yaml.
 */
class AnneeScolaireController extends Controller
{
    public function index(Request $request, int $etablissementId)
    {
        return response()->json(
            AnneeScolaire::where('etablissement_id', $etablissementId)
                ->orderByDesc('date_debut')
                ->get()
        );
    }

    public function store(Request $request, int $etablissementId)
    {
        $this->autoriserAdmin($request);

        $validated = $request->validate([
            'libelle' => ['required', 'string', 'max:20'],
            'date_debut' => ['required', 'date'],
            'date_fin' => ['required', 'date', 'after:date_debut'],
        ]);

        $annee = AnneeScolaire::create([...$validated, 'etablissement_id' => $etablissementId]);

        return response()->json($annee, 201);
    }

    public function update(Request $request, int $id)
    {
        $this->autoriserAdmin($request);

        $annee = AnneeScolaire::findOrFail($id);

        $validated = $request->validate([
            'statut' => ['required', 'in:en_preparation,active,archivee'],
        ]);

        try {
            // DB::transaction — même piège Postgres que
            // EleveController::store()/inscrire() : un update() nu avorte
            // toute transaction englobante sur une violation de contrainte.
            DB::transaction(fn () => $annee->update($validated));
        } catch (QueryException $e) {
            if ($e->getCode() === '23505') { // uniq_annee_active_par_etablissement
                return response()->json([
                    'error' => [
                        'code' => 'annee_deja_active',
                        'message' => 'Une autre année scolaire est déjà active pour cet établissement.',
                    ],
                ], 409);
            }
            throw $e;
        }

        return response()->json($annee);
    }

    private function autoriserAdmin(Request $request): void
    {
        $superAdmin = $request->user()->est_super_admin;
        $admin = $request->attributes->get('role_etablissement') === 'admin_etablissement';

        abort_unless($superAdmin || $admin, 403, "Réservé à l'administrateur de l'établissement.");
    }
}
