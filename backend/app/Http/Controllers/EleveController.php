<?php

namespace App\Http\Controllers;

use App\Models\Classe;
use App\Models\Eleve;
use App\Models\Inscription;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;

/**
 * Correspond à /etablissements/{etablissementId}/eleves, /eleves/{id} et
 * /eleves/{id}/inscriptions dans docs/openapi.yaml.
 */
class EleveController extends Controller
{
    public function index(Request $request, int $etablissementId)
    {
        $query = Eleve::where('etablissement_id', $etablissementId);

        if ($request->filled('q')) {
            $terme = '%'.$request->string('q').'%';
            $query->where(function ($q) use ($terme) {
                $q->where('nom', 'ilike', $terme)
                    ->orWhere('prenom', 'ilike', $terme)
                    ->orWhere('matricule', 'ilike', $terme);
            });
        }

        $paginateur = $query->orderBy('nom')->paginate($request->integer('per_page', 25));

        return response()->json([
            'data' => $paginateur->items(),
            'meta' => [
                'page' => $paginateur->currentPage(),
                'per_page' => $paginateur->perPage(),
                'total' => $paginateur->total(),
            ],
        ]);
    }

    public function store(Request $request, int $etablissementId)
    {
        $this->autoriserAdmin($request);

        $validated = $request->validate([
            'matricule' => ['nullable', 'string', 'max:30'],
            'nom' => ['required', 'string', 'max:100'],
            'prenom' => ['required', 'string', 'max:100'],
            'date_naissance' => ['nullable', 'date'],
            'sexe' => ['nullable', 'in:M,F'],
        ]);

        $validated['matricule'] ??= $this->genererMatricule($etablissementId);

        try {
            $eleve = Eleve::create([...$validated, 'etablissement_id' => $etablissementId]);
        } catch (QueryException $e) {
            if ($e->getCode() === '23505') {
                return response()->json([
                    'error' => ['code' => 'matricule_existant', 'message' => 'Ce matricule est déjà utilisé dans cet établissement.'],
                ], 409);
            }
            throw $e;
        }

        return response()->json($eleve, 201);
    }

    public function show(Request $request, int $id)
    {
        return response()->json(Eleve::findOrFail($id));
    }

    public function inscrire(Request $request, int $id)
    {
        $this->autoriserAdmin($request);

        $eleve = Eleve::findOrFail($id);

        $validated = $request->validate([
            'classe_id' => ['required', 'integer'],
            'annee_scolaire_id' => ['required', 'integer'],
            'date_inscription' => ['nullable', 'date'],
        ]);

        // La RLS confirme que la classe appartient au même établissement que
        // l'élève (elle serait invisible sinon).
        Classe::findOrFail($validated['classe_id']);

        try {
            $inscription = Inscription::create([
                'eleve_id' => $eleve->id,
                'classe_id' => $validated['classe_id'],
                'annee_scolaire_id' => $validated['annee_scolaire_id'],
                'date_inscription' => $validated['date_inscription'] ?? now()->toDateString(),
            ]);
        } catch (QueryException $e) {
            if ($e->getCode() === '23505') {
                return response()->json([
                    'error' => ['code' => 'deja_inscrit', 'message' => 'Cet élève est déjà inscrit pour cette année scolaire.'],
                ], 409);
            }
            throw $e;
        }

        return response()->json($inscription, 201);
    }

    private function genererMatricule(int $etablissementId): string
    {
        $sequence = Eleve::where('etablissement_id', $etablissementId)->count() + 1;

        return sprintf('EL-%05d', $sequence);
    }

    private function autoriserAdmin(Request $request): void
    {
        $superAdmin = $request->user()->est_super_admin;
        $admin = $request->attributes->get('role_etablissement') === 'admin_etablissement';
        $personnel = $request->attributes->get('role_etablissement') === 'personnel_administratif';

        abort_unless($superAdmin || $admin || $personnel, 403, 'Rôle insuffisant pour gérer les élèves.');
    }
}
