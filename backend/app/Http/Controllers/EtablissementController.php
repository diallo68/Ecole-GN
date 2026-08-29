<?php

namespace App\Http\Controllers;

use App\Models\Etablissement;
use Illuminate\Http\Request;

/**
 * Correspond à /etablissements* dans docs/openapi.yaml.
 * index/store : super-admin uniquement (pas de contexte tenant possible ici
 * par construction — voir ResolveEtablissementContext et la policy RLS
 * super_admin_bypass, db/migrations/023).
 */
class EtablissementController extends Controller
{
    public function index(Request $request)
    {
        $this->autoriserSuperAdmin($request);

        $paginateur = Etablissement::orderBy('nom')
            ->paginate($request->integer('per_page', 25));

        return response()->json([
            'data' => $paginateur->items(),
            'meta' => [
                'page' => $paginateur->currentPage(),
                'per_page' => $paginateur->perPage(),
                'total' => $paginateur->total(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $this->autoriserSuperAdmin($request);

        $validated = $request->validate([
            'nom' => ['required', 'string', 'max:255'],
            'cycle' => ['required', 'in:primaire,college,lycee,mixte'],
            'adresse' => ['nullable', 'string', 'max:255'],
            'ville' => ['nullable', 'string', 'max:255'],
            'region' => ['nullable', 'string', 'max:255'],
        ]);

        $etablissement = Etablissement::create($validated);

        return response()->json($etablissement, 201);
    }

    public function show(Request $request, int $etablissementId)
    {
        // La RLS a déjà filtré : si la ligne revient, l'accès est légitime.
        $etablissement = Etablissement::findOrFail($etablissementId);

        return response()->json($etablissement);
    }

    public function update(Request $request, int $etablissementId)
    {
        if (! $request->user()->est_super_admin
            && $request->attributes->get('role_etablissement') !== 'admin_etablissement') {
            return response()->json([
                'error' => ['code' => 'forbidden', 'message' => 'Rôle insuffisant.'],
            ], 403);
        }

        $etablissement = Etablissement::findOrFail($etablissementId);

        $validated = $request->validate([
            'nom' => ['sometimes', 'string', 'max:255'],
            'cycle' => ['sometimes', 'in:primaire,college,lycee,mixte'],
            'adresse' => ['nullable', 'string', 'max:255'],
            'ville' => ['nullable', 'string', 'max:255'],
            'region' => ['nullable', 'string', 'max:255'],
            'statut' => ['sometimes', 'in:actif,inactif'],
        ]);

        $etablissement->update($validated);

        return response()->json($etablissement);
    }

    private function autoriserSuperAdmin(Request $request): void
    {
        abort_unless($request->user()->est_super_admin, 403, 'Réservé au super-administrateur.');
    }
}
