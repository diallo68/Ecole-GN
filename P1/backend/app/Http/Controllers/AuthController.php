<?php

namespace App\Http\Controllers;

use App\Models\Utilisateur;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

/**
 * Correspond à /auth/* dans docs/openapi.yaml.
 * Pas d'auto-inscription en MVP : les comptes sont créés par la direction
 * ou importés (cf. docs/mvp-scope.md) — seule la connexion est publique.
 */
class AuthController extends Controller
{
    public function login(Request $request)
    {
        $validated = $request->validate([
            'identifiant' => ['required', 'string'],
            'mot_de_passe' => ['required', 'string'],
        ]);

        $utilisateur = Utilisateur::where('telephone', $validated['identifiant'])
            ->orWhere('email', $validated['identifiant'])
            ->first();

        if (! $utilisateur || ! Auth::guard('web')->getProvider()->validateCredentials($utilisateur, [
            'password' => $validated['mot_de_passe'],
        ])) {
            throw ValidationException::withMessages([
                'identifiant' => ['Identifiants incorrects.'],
            ]);
        }

        if ($utilisateur->statut !== 'actif') {
            throw ValidationException::withMessages([
                'identifiant' => ['Ce compte est suspendu.'],
            ]);
        }

        $token = $utilisateur->createToken('api')->plainTextToken;

        return response()->json([
            'token' => $token,
            'utilisateur' => $utilisateur,
        ]);
    }

    public function me(Request $request)
    {
        $utilisateur = $request->user();

        return response()->json([
            'utilisateur' => $utilisateur,
            'rattachements' => $utilisateur->rattachements()->with('etablissement')->get(),
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->noContent();
    }
}
