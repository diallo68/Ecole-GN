<?php

namespace App\Support;

use App\Models\Classe;
use App\Models\ClasseMatiereEnseignant;
use App\Models\Evaluation;
use App\Models\Note;

/**
 * Calcul des moyennes et rangs d'une classe pour une période (cahier des
 * charges §4.4 : « moyennes pondérées par coefficient, rangs de classe »).
 *
 * Pondération à deux niveaux :
 *  1. moyenne par matière = Σ(note × coefficient de l'évaluation) / Σ(coefficient),
 *     sur les seules évaluations notées (un élève absent à une évaluation
 *     n'est ni pénalisé ni avantagé : l'évaluation est exclue pour lui).
 *  2. moyenne générale = Σ(moyenne matière × coefficient de la matière) / Σ(coefficient),
 *     le coefficient venant de classe_matiere_enseignant.coefficient, ou du
 *     coefficient par défaut de la matière si non surchargé.
 *
 * Une matière sans aucune évaluation notée pour la période est exclue du
 * calcul (pas de division par zéro, pas de 0 injecté).
 *
 * Rang : classement standard (« 1224 ») — deux moyennes égales partagent le
 * même rang, le rang suivant saute en conséquence. Les élèves sans moyenne
 * (aucune note sur la période) n'ont pas de rang.
 */
class CalculBulletin
{
    /**
     * @return array<int, array{moyenne_generale: ?float, rang: ?int, effectif_classe: int, detail_matieres: array<int, float>}>
     *                                                                                                                           indexé par eleve_id
     */
    public static function pourClasseEtPeriode(int $classeId, int $periodeId): array
    {
        $classe = Classe::findOrFail($classeId);
        $eleveIds = $classe->eleves()->pluck('eleves.id');
        $effectif = $eleveIds->count();

        $cmes = ClasseMatiereEnseignant::where('classe_id', $classeId)->get();

        $evaluations = Evaluation::whereIn('classe_matiere_enseignant_id', $cmes->pluck('id'))
            ->where('periode_id', $periodeId)
            ->get()
            ->groupBy('classe_matiere_enseignant_id');

        $notesParEvaluation = Note::whereIn('evaluation_id', $evaluations->flatten()->pluck('id'))
            ->get()
            ->groupBy('evaluation_id');

        $resultats = [];

        foreach ($eleveIds as $eleveId) {
            $sommeCoefMatieres = 0.0;
            $sommePondereeMatieres = 0.0;
            $detailMatieres = [];

            foreach ($cmes as $cme) {
                $evalsMatiere = $evaluations->get($cme->id, collect());
                if ($evalsMatiere->isEmpty()) {
                    continue; // aucune évaluation dans cette matière sur la période
                }

                $sommeCoefEval = 0.0;
                $sommePondereeEval = 0.0;

                foreach ($evalsMatiere as $evaluation) {
                    $note = $notesParEvaluation->get($evaluation->id, collect())
                        ->firstWhere('eleve_id', $eleveId);

                    if (! $note || $note->valeur === null) {
                        continue; // absent ou non saisi : exclu, pas pénalisé
                    }

                    $sommeCoefEval += (float) $evaluation->coefficient;
                    $sommePondereeEval += (float) $note->valeur * (float) $evaluation->coefficient;
                }

                if ($sommeCoefEval == 0.0) {
                    continue; // aucune note saisie pour cet élève dans cette matière
                }

                $moyenneMatiere = $sommePondereeEval / $sommeCoefEval;
                $coefMatiere = (float) ($cme->coefficient ?? $cme->matiere->coefficient_defaut);

                $sommeCoefMatieres += $coefMatiere;
                $sommePondereeMatieres += $moyenneMatiere * $coefMatiere;
                $detailMatieres[$cme->matiere_id] = round($moyenneMatiere, 2);
            }

            $resultats[$eleveId] = [
                'moyenne_generale' => $sommeCoefMatieres > 0
                    ? round($sommePondereeMatieres / $sommeCoefMatieres, 2)
                    : null,
                'rang' => null, // calculé ci-dessous
                'effectif_classe' => $effectif,
                'detail_matieres' => $detailMatieres,
            ];
        }

        return self::attribuerRangs($resultats);
    }

    private static function attribuerRangs(array $resultats): array
    {
        $classement = collect($resultats)
            ->filter(fn ($r) => $r['moyenne_generale'] !== null)
            ->sortByDesc('moyenne_generale');

        $position = 0;
        $rangCourant = 1;
        $derniereMoyenne = null;

        foreach ($classement as $eleveId => $r) {
            $position++;
            if ($derniereMoyenne !== null && $r['moyenne_generale'] < $derniereMoyenne) {
                $rangCourant = $position;
            }
            $resultats[$eleveId]['rang'] = $rangCourant;
            $derniereMoyenne = $r['moyenne_generale'];
        }

        return $resultats;
    }
}
