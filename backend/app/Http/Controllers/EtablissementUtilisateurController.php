<?php

namespace App\Http\Controllers;

use App\Models\Etablissement;
use App\Models\EtablissementUtilisateur;
use App\Models\Utilisateur;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Correspond à /etablissements/{etablissementId}/utilisateurs dans
 * docs/openapi.yaml. Réservé à admin_etablissement (et super-admin).
 */
class EtablissementUtilisateurController extends Controller
{
    public function index(Request $request, int $etablissementId)
    {
        $this->autoriserAdmin($request);

        $query = EtablissementUtilisateur::with('utilisateur')
            ->where('etablissement_id', $etablissementId);

        if ($request->filled('role')) {
            $query->where('role', $request->string('role'));
        }

        $paginateur = $query->paginate($request->integer('per_page', 25));

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
        Etablissement::findOrFail($etablissementId); // 404 si hors périmètre RLS

        $validated = $request->validate([
            'nom' => ['required', 'string', 'max:100'],
            'prenom' => ['required', 'string', 'max:100'],
            'telephone' => ['required', 'string', 'max:20'],
            'email' => ['nullable', 'email', 'max:255'],
            'role' => ['required', 'in:admin_etablissement,enseignant,personnel_administratif,parent'],
        ]);

        try {
            $rattachement = DB::transaction(function () use ($validated, $etablissementId) {
                // Le téléphone identifie la personne globalement : un compte
                // existant est réutilisé (un enseignant peut être rattaché à
                // plusieurs établissements), jamais dupliqué.
                $utilisateur = Utilisateur::firstOrCreate(
                    ['telephone' => $validated['telephone']],
                    [
                        'nom' => $validated['nom'],
                        'prenom' => $validated['prenom'],
                        'email' => $validated['email'] ?? null,
                        'mot_de_passe_hash' => Str::random(16), // à réinitialiser par SMS/email — hors MVP
                        'langue_preferee' => 'fr',
                        'statut' => 'actif',
                    ]
                );

                return EtablissementUtilisateur::create([
                    'etablissement_id' => $etablissementId,
                    'utilisateur_id' => $utilisateur->id,
                    'role' => $validated['role'],
                    'statut' => 'actif',
                ]);
            });
        } catch (QueryException $e) {
            if ($e->getCode() === '23505') { // unique_violation
                return response()->json([
                    'error' => [
                        'code' => 'rattachement_existant',
                        'message' => 'Ce compte a déjà ce rôle dans cet établissement.',
                    ],
                ], 409);
            }
            throw $e;
        }

        return response()->json($rattachement->load('utilisateur'), 201);
    }

    private function autoriserAdmin(Request $request): void
    {
        $superAdmin = $request->user()->est_super_admin;
        $admin = $request->attributes->get('role_etablissement') === 'admin_etablissement';

        abort_unless($superAdmin || $admin, 403, "Réservé à l'administrateur de l'établissement.");
    }
}
