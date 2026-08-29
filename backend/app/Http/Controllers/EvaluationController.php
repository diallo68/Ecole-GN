<?php

namespace App\Http\Controllers;

use App\Models\ClasseMatiereEnseignant;
use App\Models\Evaluation;
use App\Models\Note;
use App\Models\PeriodeEvaluation;
use Illuminate\Http\Request;

/**
 * Correspond à /classes/{classeId}/matieres/{matiereId}/evaluations et
 * /evaluations/{id}/notes dans docs/openapi.yaml.
 *
 * Saisie en lot volontaire (docs/mvp-scope.md, parcours critique n°3) :
 * un enseignant envoie les notes de toute la classe en une requête, pas
 * un round-trip par élève.
 */
class EvaluationController extends Controller
{
    public function store(Request $request, int $classeId, int $matiereId)
    {
        // La RLS confirme déjà que classeId/matiereId appartiennent à
        // l'établissement courant (voir ResolveEtablissementContext).
        $affectation = ClasseMatiereEnseignant::where('classe_id', $classeId)
            ->where('matiere_id', $matiereId)
            ->first();

        abort_if(! $affectation, 404, 'Aucun enseignant affecté à cette matière pour cette classe.');
        $this->autoriserEnseignantOuAdmin($request, $affectation);

        $validated = $request->validate([
            'type' => ['required', 'in:devoir,composition,interrogation'],
            'libelle' => ['required', 'string', 'max:100'],
            'coefficient' => ['sometimes', 'numeric', 'min:0'],
            'periode_id' => ['required', 'integer'],
            'date_evaluation' => ['required', 'date'],
        ]);

        $periode = PeriodeEvaluation::findOrFail($validated['periode_id']);
        abort_if($periode->statut === 'cloturee', 409, "Cette période est clôturée, impossible d'y ajouter une évaluation.");

        $evaluation = Evaluation::create([...$validated, 'classe_matiere_enseignant_id' => $affectation->id]);

        return response()->json($evaluation, 201);
    }

    public function notesIndex(Request $request, int $id)
    {
        $evaluation = Evaluation::findOrFail($id);

        return response()->json($evaluation->notes()->get());
    }

    public function notesStore(Request $request, int $id)
    {
        $evaluation = Evaluation::with('classeMatiereEnseignant', 'periode')->findOrFail($id);
        $this->autoriserEnseignantOuAdmin($request, $evaluation->classeMatiereEnseignant);

        abort_if(
            $evaluation->periode->statut === 'cloturee',
            409,
            "Cette période est clôturée, la saisie de notes n'est plus possible."
        );

        $validated = $request->validate([
            'notes' => ['required', 'array', 'min:1'],
            'notes.*.eleve_id' => ['required', 'integer'],
            'notes.*.valeur' => ['nullable', 'numeric', 'min:0', 'max:20'],
            'notes.*.appreciation' => ['nullable', 'string'],
        ]);

        $utilisateurId = $request->user()->id;

        $notes = collect($validated['notes'])->map(function (array $ligne) use ($evaluation, $utilisateurId) {
            return Note::updateOrCreate(
                ['evaluation_id' => $evaluation->id, 'eleve_id' => $ligne['eleve_id']],
                [
                    'valeur' => $ligne['valeur'] ?? null,
                    'appreciation' => $ligne['appreciation'] ?? null,
                    'saisie_par' => $utilisateurId,
                    'statut_sync' => 'synced',
                ]
            );
        });

        return response()->json($notes->values());
    }

    private function autoriserEnseignantOuAdmin(Request $request, ClasseMatiereEnseignant $affectation): void
    {
        $superAdmin = $request->user()->est_super_admin;
        $admin = $request->attributes->get('role_etablissement') === 'admin_etablissement';
        $estLEnseignant = $affectation->enseignant_id === $request->user()->id;

        abort_unless(
            $superAdmin || $admin || $estLEnseignant,
            403,
            "Seul l'enseignant affecté à cette matière (ou la direction) peut saisir des notes."
        );
    }
}
