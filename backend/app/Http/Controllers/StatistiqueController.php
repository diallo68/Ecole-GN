<?php

namespace App\Http\Controllers;

use App\Models\Bulletin;
use App\Models\Classe;
use App\Models\Echeance;
use App\Models\Inscription;
use App\Models\Paiement;
use App\Models\PeriodeEvaluation;
use App\Models\Presence;
use Illuminate\Http\Request;

/**
 * Correspond à /etablissements/{etablissementId}/statistiques dans
 * docs/openapi.yaml — cahier des charges §4.9 : « taux de réussite, taux
 * d'absentéisme, taux de recouvrement financier » (l'export Excel/PDF
 * avancé mentionné à côté reste hors MVP, voir mvp-scope.md).
 *
 * Jamais construit avant le 30 août 2026 malgré mvp-scope.md qui le
 * déclarait — voir la note ajoutée dans ce document le même jour.
 *
 * Définitions retenues, faute d'un standard imposé par le cahier des
 * charges :
 *  - Absentéisme : part des présences saisies marquées 'absent' (le
 *    retard et l'absence excusée ne comptent pas comme une absence ici).
 *  - Réussite : sur la période d'évaluation la plus récente de l'année
 *    scolaire (par date_fin), part des bulletins avec moyenne_generale
 *    >= 10/20 parmi les bulletins qui ont une moyenne (un élève sans
 *    aucune note n'entre ni au numérateur ni au dénominateur — même
 *    principe de neutralité que CalculBulletin pour une matière sans
 *    note).
 *  - Recouvrement : somme encaissée (paiements) / somme due (échéances)
 *    sur les frais de scolarité de l'année scolaire choisie.
 * Une classe sans donnée sur un axe (aucune présence saisie, aucun
 * bulletin généré) renvoie null sur cet axe plutôt que 0 — un taux à 0%
 * affirmerait un échec total qui n'a simplement pas été mesuré.
 */
class StatistiqueController extends Controller
{
    public function index(Request $request, int $etablissementId)
    {
        $this->autoriserAdmin($request);

        $validated = $request->validate([
            'annee_scolaire_id' => ['required', 'integer'],
        ]);
        // (int) explicite : la valeur validée reste la chaîne brute du
        // paramètre de requête ('integer' dans les règles ne fait que
        // valider le format, pas convertir le type) — trouvé en testant
        // avec un vrai GET (?annee_scolaire_id=18), pas avec assertJson en
        // PHPUnit qui compare sans typage strict et ne l'aurait pas révélé.
        $anneeId = (int) $validated['annee_scolaire_id'];

        $classes = Classe::where('etablissement_id', $etablissementId)
            ->where('annee_scolaire_id', $anneeId)
            ->orderBy('niveau')->orderBy('libelle')
            ->get();
        $classeIds = $classes->pluck('id');

        $effectifsParClasse = Inscription::whereIn('classe_id', $classeIds)
            ->where('statut', 'inscrit')
            ->selectRaw('classe_id, count(*) as effectif')
            ->groupBy('classe_id')
            ->pluck('effectif', 'classe_id');

        $presencesParClasse = Presence::whereIn('classe_id', $classeIds)
            ->selectRaw("classe_id, count(*) as total, count(*) filter (where statut = 'absent') as absences")
            ->groupBy('classe_id')
            ->get()
            ->keyBy('classe_id');

        // Réussite calculée sur la période la plus récente uniquement :
        // agréger toutes les périodes mélangerait un trimestre à peine
        // commencé (peu de notes, moyennes non représentatives) avec un
        // trimestre achevé.
        $dernierePeriode = PeriodeEvaluation::where('etablissement_id', $etablissementId)
            ->where('annee_scolaire_id', $anneeId)
            ->orderByDesc('date_fin')
            ->first();

        $bulletinsParClasse = collect();
        if ($dernierePeriode) {
            $bulletinsParClasse = Bulletin::where('bulletins.periode_id', $dernierePeriode->id)
                ->whereNotNull('bulletins.moyenne_generale')
                ->join('inscriptions', function ($jointure) use ($anneeId) {
                    $jointure->on('inscriptions.eleve_id', '=', 'bulletins.eleve_id')
                        ->where('inscriptions.annee_scolaire_id', $anneeId);
                })
                ->selectRaw('inscriptions.classe_id, count(*) as total, count(*) filter (where bulletins.moyenne_generale >= 10) as reussites')
                ->groupBy('inscriptions.classe_id')
                ->get()
                ->keyBy('classe_id');
        }

        $parClasse = $classes->map(function (Classe $classe) use ($effectifsParClasse, $presencesParClasse, $bulletinsParClasse) {
            $presences = $presencesParClasse->get($classe->id);
            $bulletins = $bulletinsParClasse->get($classe->id);

            return [
                'classe_id' => $classe->id,
                'libelle' => $classe->libelle,
                'niveau' => $classe->niveau,
                'effectif' => (int) ($effectifsParClasse->get($classe->id) ?? 0),
                'taux_absenteisme' => $presences && $presences->total > 0
                    ? round($presences->absences / $presences->total * 100, 1)
                    : null,
                'taux_reussite' => $bulletins && $bulletins->total > 0
                    ? round($bulletins->reussites / $bulletins->total * 100, 1)
                    : null,
            ];
        })->values();

        // Recouvrement financier sur les échéances de l'année scolaire
        // choisie (via frais_scolarite, seule table qui porte
        // annee_scolaire_id sur cet axe — voir 017_frais_scolarite.sql).
        $echeanceIds = Echeance::whereHas('fraisScolarite', fn ($q) => $q
            ->where('etablissement_id', $etablissementId)
            ->where('annee_scolaire_id', $anneeId))
            ->pluck('id');

        $montantDu = (float) Echeance::whereIn('id', $echeanceIds)->sum('montant_du');
        $montantPaye = (float) Paiement::whereIn('echeance_id', $echeanceIds)->sum('montant');

        return response()->json([
            'annee_scolaire_id' => $anneeId,
            'effectif_total' => (int) $effectifsParClasse->sum(),
            'taux_recouvrement' => $montantDu > 0 ? round($montantPaye / $montantDu * 100, 1) : null,
            'par_classe' => $parClasse,
        ]);
    }

    private function autoriserAdmin(Request $request): void
    {
        $superAdmin = $request->user()->est_super_admin;
        $admin = $request->attributes->get('role_etablissement') === 'admin_etablissement';

        abort_unless($superAdmin || $admin, 403, "Réservé à l'administrateur de l'établissement.");
    }
}
