<?php

namespace App\Http\Controllers;

use App\Models\Classe;
use Illuminate\Http\Request;

/**
 * Correspond à /etablissements/{etablissementId}/classes et /classes/{id}
 * dans docs/openapi.yaml.
 */
class ClasseController extends Controller
{
    public function index(Request $request, int $etablissementId)
    {
        $query = Classe::where('etablissement_id', $etablissementId);

        if ($request->filled('annee_scolaire_id')) {
            $query->where('annee_scolaire_id', $request->integer('annee_scolaire_id'));
        }

        // « Mes classes » pour un enseignant : titulaire OU affecté à une
        // matière de la classe (classe_matiere_enseignant) — écran
        // d'accueil de l'app mobile enseignant.
        if ($request->filled('enseignant_id')) {
            $enseignantId = $request->integer('enseignant_id');
            $query->where(function ($q) use ($enseignantId) {
                $q->where('enseignant_titulaire_id', $enseignantId)
                    ->orWhereHas('matieresEnseignees', fn ($q2) => $q2->where('enseignant_id', $enseignantId));
            });
        }

        return response()->json($query->orderBy('niveau')->orderBy('libelle')->get());
    }

    public function store(Request $request, int $etablissementId)
    {
        $this->autoriserAdmin($request);

        $validated = $request->validate([
            'niveau' => ['required', 'string', 'max:30'],
            'libelle' => ['required', 'string', 'max:50'],
            'annee_scolaire_id' => ['required', 'integer'],
            'enseignant_titulaire_id' => ['nullable', 'integer'],
            'effectif_max' => ['nullable', 'integer', 'min:1'],
        ]);

        $classe = Classe::create([...$validated, 'etablissement_id' => $etablissementId]);

        return response()->json($classe, 201);
    }

    public function show(Request $request, int $id)
    {
        // La RLS a déjà filtré (voir ResolveEtablissementContext) : si la
        // ligne revient, l'accès est légitime.
        return response()->json(Classe::findOrFail($id));
    }

    public function update(Request $request, int $id)
    {
        $this->autoriserAdmin($request);

        $classe = Classe::findOrFail($id);

        $validated = $request->validate([
            'niveau' => ['sometimes', 'string', 'max:30'],
            'libelle' => ['sometimes', 'string', 'max:50'],
            'enseignant_titulaire_id' => ['nullable', 'integer'],
            'effectif_max' => ['nullable', 'integer', 'min:1'],
        ]);

        $classe->update($validated);

        return response()->json($classe);
    }

    public function eleves(Request $request, int $id)
    {
        $classe = Classe::findOrFail($id);

        // makeHidden : hasManyThrough ajoute une colonne technique
        // laravel_through_key au résultat pour son propre usage interne
        // (indépendamment de select()) — absente du schéma Eleve
        // d'openapi.yaml, elle ne doit pas fuiter dans la réponse JSON.
        return response()->json(
            $classe->eleves()->get()->makeHidden('laravel_through_key')
        );
    }

    /**
     * Distinct de eleves() : celui-ci renvoie les Inscription (avec leur
     * propre id), pas les Eleve — c'est l'id d'inscription, pas l'id
     * d'élève, qu'attend PATCH /inscriptions/{id} pour un transfert. Ajouté
     * pour l'écran de transfert de classe (docs/mvp-scope.md §4.2) : sans
     * lui, l'UI n'avait aucun moyen de retrouver l'id d'inscription à
     * transférer sans le deviner.
     */
    public function inscriptions(Request $request, int $id)
    {
        $classe = Classe::findOrFail($id);

        return response()->json(
            $classe->inscriptions()->where('statut', 'inscrit')->with('eleve')->get()
        );
    }

    public function matieres(Request $request, int $id)
    {
        $classe = Classe::findOrFail($id);

        return response()->json(
            $classe->matieresEnseignees()->with('matiere', 'enseignant')->get()
        );
    }

    private function autoriserAdmin(Request $request): void
    {
        $superAdmin = $request->user()->est_super_admin;
        $admin = $request->attributes->get('role_etablissement') === 'admin_etablissement';

        abort_unless($superAdmin || $admin, 403, "Réservé à l'administrateur de l'établissement.");
    }
}
