<?php

namespace App\Http\Controllers;

use App\Models\Echeance;
use App\Models\Paiement;
use App\Models\ParentEleve;
use Illuminate\Http\Request;

/**
 * Correspond à /echeances/{id}/paiements et /paiements/{id}/recu dans
 * docs/openapi.yaml. Encaissement manuel uniquement (espèces/chèque) —
 * mobile money reporté à la Phase 4 (docs/mvp-scope.md §2).
 *
 * Le reçu PDF n'est PAS généré ici, pour la même raison que le PDF de
 * bulletin (BulletinController) : aucun gabarit officiel disponible.
 * pdf_recu_url reste null — mieux vaut l'absence explicite qu'un document
 * fabriqué qui prétendrait être un reçu en bonne et due forme.
 */
class PaiementController extends Controller
{
    public function store(Request $request, int $id)
    {
        $this->autoriserFinances($request);

        $echeance = Echeance::with('eleve')->findOrFail($id);

        $validated = $request->validate([
            'montant' => ['required', 'numeric', 'min:0.01'],
            'mode' => ['required', 'in:especes,cheque'],
            'date_paiement' => ['nullable', 'date'],
        ]);

        $paiement = Paiement::create([
            'echeance_id' => $echeance->id,
            'montant' => $validated['montant'],
            'mode' => $validated['mode'],
            'reference_recu' => $this->genererReferenceRecu($echeance->eleve->etablissement_id),
            'encaisse_par' => $request->user()->id,
            'date_paiement' => $validated['date_paiement'] ?? now()->toDateString(),
        ]);

        $this->recalculerStatutEcheance($echeance);

        return response()->json($paiement, 201);
    }

    /**
     * Faille trouvée le 30 août 2026 dans le même passage que les autres
     * pourEleve()/notesIndex()/pourClasse() (voir leurs commentaires) :
     * aucune vérification ici alors qu'api-contract.md réserve cet
     * endpoint à "personnel_administratif, parent" — actuellement peu
     * dangereux (pdf_recu_url reste toujours null en MVP), mais deviendrait
     * une vraie fuite le jour où la génération de reçu serait implémentée.
     * Corrigé maintenant plutôt que d'attendre que le PDF existe pour que
     * la faille devienne visible.
     */
    public function recu(Request $request, int $id)
    {
        $paiement = Paiement::with('echeance.eleve')->findOrFail($id);
        $this->autoriserFinancesOuParent($request, $paiement->echeance->eleve_id);

        return response()->json(['pdf_url' => $paiement->pdf_recu_url]);
    }

    /**
     * Le statut de l'échéance reflète le cumul des paiements, pas un seul
     * encaissement : plusieurs paiements partiels peuvent la solder.
     */
    private function recalculerStatutEcheance(Echeance $echeance): void
    {
        $totalPaye = $echeance->paiements()->sum('montant');

        $statut = match (true) {
            $totalPaye >= $echeance->montant_du => 'paye',
            $totalPaye > 0 => 'partiel',
            default => 'impaye',
        };

        $echeance->update(['statut' => $statut]);
    }

    private function genererReferenceRecu(int $etablissementId): string
    {
        $sequence = Paiement::whereHas('echeance.eleve', fn ($q) => $q->where('etablissement_id', $etablissementId))
            ->count() + 1;

        return sprintf('REC-%d-%05d', $etablissementId, $sequence);
    }

    private function autoriserFinances(Request $request): void
    {
        $superAdmin = $request->user()->est_super_admin;
        $role = $request->attributes->get('role_etablissement');

        abort_unless(
            $superAdmin || in_array($role, ['admin_etablissement', 'personnel_administratif'], true),
            403,
            'Réservé à la direction ou au personnel administratif.'
        );
    }

    /** Même principe que EcheanceController::autoriserConsultation. */
    private function autoriserFinancesOuParent(Request $request, int $eleveId): void
    {
        $superAdmin = $request->user()->est_super_admin;
        $role = $request->attributes->get('role_etablissement');
        $gestionnaire = in_array($role, ['admin_etablissement', 'personnel_administratif'], true);

        if ($superAdmin || $gestionnaire) {
            return;
        }

        $estParent = ParentEleve::where('utilisateur_id', $request->user()->id)
            ->where('eleve_id', $eleveId)
            ->exists();

        abort_unless($estParent, 403, "Vous n'avez pas accès à ce reçu.");
    }
}
