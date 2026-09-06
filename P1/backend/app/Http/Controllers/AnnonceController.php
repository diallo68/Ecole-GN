<?php

namespace App\Http\Controllers;

use App\Models\Annonce;
use App\Models\Classe;
use Illuminate\Http\Request;

/**
 * Correspond à /etablissements/{etablissementId}/annonces dans
 * docs/openapi.yaml. Lecture ouverte à tout rattachement actif de
 * l'établissement (enseignant, parent, personnel...) ; publication
 * réservée à la direction.
 *
 * Le relais SMS pour les familles sans smartphone (cahier des charges
 * §4.7) n'est volontairement PAS déclenché ici : comme pour les absences
 * (PresenceController) et les paiements, aucune passerelle SMS n'existe
 * encore. Publier une annonce ne fait que l'écrire en base ; la notifier
 * reste un gap explicite, pas une fonctionnalité à moitié construite.
 */
class AnnonceController extends Controller
{
    public function index(Request $request, int $etablissementId)
    {
        return response()->json(
            Annonce::where('etablissement_id', $etablissementId)
                ->orderByDesc('publiee_le')
                ->get()
        );
    }

    public function store(Request $request, int $etablissementId)
    {
        $this->autoriserAdmin($request);

        $validated = $request->validate([
            'titre' => ['required', 'string', 'max:150'],
            'contenu' => ['required', 'string'],
            'cible_type' => ['required', 'in:etablissement,classe'],
            'cible_id' => ['required_if:cible_type,classe', 'nullable', 'integer'],
        ]);

        if ($validated['cible_type'] === 'classe') {
            // La RLS confirme que la classe appartient au même établissement.
            Classe::findOrFail($validated['cible_id']);
        } else {
            $validated['cible_id'] = null;
        }

        $annonce = Annonce::create([
            ...$validated,
            'etablissement_id' => $etablissementId,
            'auteur_id' => $request->user()->id,
            'publiee_le' => now(),
        ]);

        return response()->json($annonce, 201);
    }

    private function autoriserAdmin(Request $request): void
    {
        $superAdmin = $request->user()->est_super_admin;
        $admin = $request->attributes->get('role_etablissement') === 'admin_etablissement';

        abort_unless($superAdmin || $admin, 403, "Réservé à l'administrateur de l'établissement.");
    }
}
