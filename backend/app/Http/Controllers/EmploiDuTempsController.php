<?php

namespace App\Http\Controllers;

use App\Models\Classe;
use App\Models\CreneauEmploiDuTemps;
use Illuminate\Http\Request;

/**
 * Correspond à /classes/{id}/emploi-du-temps dans docs/openapi.yaml.
 *
 * Détection de conflit best-effort et NON bloquante (docs/mvp-scope.md §2,
 * §4.3) : un chevauchement d'horaire n'empêche jamais la création du
 * créneau, il est seulement signalé dans la réponse.
 */
class EmploiDuTempsController extends Controller
{
    public function index(Request $request, int $id)
    {
        $classe = Classe::findOrFail($id);

        return response()->json(
            CreneauEmploiDuTemps::where('classe_id', $classe->id)
                ->orderBy('jour_semaine')
                ->orderBy('heure_debut')
                ->get()
        );
    }

    public function store(Request $request, int $id)
    {
        $this->autoriserAdmin($request);
        $classe = Classe::findOrFail($id);

        $validated = $request->validate([
            'matiere_id' => ['required', 'integer'],
            'enseignant_id' => ['required', 'integer'],
            'jour_semaine' => ['required', 'integer', 'min:1', 'max:7'],
            'heure_debut' => ['required', 'date_format:H:i'],
            'heure_fin' => ['required', 'date_format:H:i', 'after:heure_debut'],
            'salle' => ['nullable', 'string', 'max:50'],
        ]);

        $conflits = $this->detecterConflits($validated);

        $creneau = CreneauEmploiDuTemps::create([...$validated, 'classe_id' => $classe->id]);

        $reponse = $creneau->toArray();
        $reponse['conflits'] = $conflits;

        return response()->json($reponse, 201);
    }

    /**
     * Chevauchement d'intervalles : [debut1,fin1) et [debut2,fin2) se
     * recoupent si debut1 < fin2 ET debut2 < fin1. Deux causes de conflit,
     * indépendantes de la classe : même enseignant, ou même salle.
     */
    private function detecterConflits(array $donnees): array
    {
        $query = CreneauEmploiDuTemps::where('jour_semaine', $donnees['jour_semaine'])
            ->where('heure_debut', '<', $donnees['heure_fin'])
            ->where('heure_fin', '>', $donnees['heure_debut'])
            ->where(function ($q) use ($donnees) {
                $q->where('enseignant_id', $donnees['enseignant_id']);
                if (! empty($donnees['salle'])) {
                    $q->orWhere('salle', $donnees['salle']);
                }
            });

        return $query->get()->toArray();
    }

    private function autoriserAdmin(Request $request): void
    {
        $superAdmin = $request->user()->est_super_admin;
        $admin = $request->attributes->get('role_etablissement') === 'admin_etablissement';

        abort_unless($superAdmin || $admin, 403, "Réservé à l'administrateur de l'établissement.");
    }
}
