<?php

namespace App\Http\Controllers;

use App\Models\Classe;
use App\Models\ClasseMatiereEnseignant;
use App\Models\Eleve;
use App\Models\ParentEleve;
use App\Models\Presence;
use Illuminate\Http\Request;

/**
 * Correspond à /classes/{id}/presences/appel, /classes/{id}/presences et
 * /eleves/{id}/presences dans docs/openapi.yaml.
 *
 * Parcours critique n°2 du MVP (docs/mvp-scope.md) : l'appel d'une classe
 * entière en une requête, y compris hors ligne (sync_uuid, statut_sync —
 * voir architecture-technique.md §04). La notification automatique aux
 * parents en cas d'absence (parcours critique n°5) est volontairement
 * hors périmètre ici : elle suppose une passerelle SMS/push qui n'existe
 * pas encore (module Communication à venir) — mieux vaut ne rien envoyer
 * que de fabriquer un envoi qui n'aboutit nulle part.
 */
class PresenceController extends Controller
{
    public function appel(Request $request, int $id)
    {
        $classe = Classe::findOrFail($id);
        $this->autoriserEnseignantOuAdmin($request, $classe);

        $validated = $request->validate([
            'date' => ['required', 'date'],
            'presences' => ['required', 'array', 'min:1'],
            'presences.*.eleve_id' => ['required', 'integer'],
            'presences.*.statut' => ['required', 'in:present,absent,retard,excuse'],
            'presences.*.sync_uuid' => ['nullable', 'uuid'],
        ]);

        $utilisateurId = $request->user()->id;

        // Clé d'idempotence réelle : (eleve_id, classe_id, date) — la
        // contrainte UNIQUE de la table. Un sync_uuid rejoué (retransmission
        // hors-ligne) retombe sur la même ligne, pas de doublon possible.
        $presences = collect($validated['presences'])->map(function (array $ligne) use ($classe, $validated, $utilisateurId) {
            $attributs = [
                'statut' => $ligne['statut'],
                'saisie_par' => $utilisateurId,
                'statut_sync' => 'synced',
            ];
            if (! empty($ligne['sync_uuid'])) {
                $attributs['sync_uuid'] = $ligne['sync_uuid'];
            }

            return Presence::updateOrCreate(
                ['eleve_id' => $ligne['eleve_id'], 'classe_id' => $classe->id, 'date' => $validated['date']],
                $attributs
            );
        });

        return response()->json($presences->values());
    }

    /**
     * Faille trouvée le 30 août 2026 dans le même passage que
     * pourEleve() plus bas : aucune vérification ici alors
     * qu'api-contract.md réserve cet endpoint à "enseignant,
     * admin_etablissement" — n'importe quel utilisateur rattaché à
     * l'établissement (y compris un parent) pouvait voir qui, dans TOUTE
     * une classe, était présent ou absent un jour donné — pas seulement
     * son propre enfant. appel() vérifiait déjà via
     * autoriserEnseignantOuAdmin() ; cette lecture avait été oubliée.
     */
    public function pourClasse(Request $request, int $id)
    {
        $classe = Classe::findOrFail($id);
        $this->autoriserEnseignantOuAdmin($request, $classe);

        $validated = $request->validate([
            'date' => ['required', 'date'],
        ]);

        return response()->json(
            Presence::where('classe_id', $classe->id)
                ->where('date', $validated['date'])
                ->with('eleve')
                ->get()
        );
    }

    public function pourEleve(Request $request, int $id)
    {
        $eleve = Eleve::findOrFail($id);
        $this->autoriserAdminOuParent($request, $eleve);

        $query = Presence::where('eleve_id', $eleve->id);

        if ($request->filled('depuis')) {
            $query->where('date', '>=', $request->date('depuis'));
        }

        return response()->json($query->orderByDesc('date')->get());
    }

    private function autoriserEnseignantOuAdmin(Request $request, Classe $classe): void
    {
        $superAdmin = $request->user()->est_super_admin;
        $admin = $request->attributes->get('role_etablissement') === 'admin_etablissement';
        $utilisateurId = $request->user()->id;

        $estTitulaire = $classe->enseignant_titulaire_id === $utilisateurId;
        $enseigneDansLaClasse = ClasseMatiereEnseignant::where('classe_id', $classe->id)
            ->where('enseignant_id', $utilisateurId)
            ->exists();

        abort_unless(
            $superAdmin || $admin || $estTitulaire || $enseigneDansLaClasse,
            403,
            "Seul un enseignant de cette classe (ou la direction) peut faire l'appel."
        );
    }

    /**
     * Faille trouvée le 30 août 2026, en préparant un écran mobile parent :
     * pourEleve() n'avait AUCUNE vérification — la RLS scope 'presences' à
     * l'établissement, pas à l'élève (022_rls_policies.sql), donc
     * n'importe quel utilisateur rattaché à l'établissement pouvait lire
     * l'historique de présence de N'IMPORTE QUEL élève en devinant son id,
     * alors qu'api-contract.md documentait déjà "parent, admin_etablissement"
     * comme rôles autorisés. Même piège, même correction que
     * BulletinController::pourEleve (voir ce commentaire).
     */
    private function autoriserAdminOuParent(Request $request, Eleve $eleve): void
    {
        $superAdmin = $request->user()->est_super_admin;
        $admin = $request->attributes->get('role_etablissement') === 'admin_etablissement';

        if ($superAdmin || $admin) {
            return;
        }

        $estParent = ParentEleve::where('utilisateur_id', $request->user()->id)
            ->where('eleve_id', $eleve->id)
            ->exists();

        abort_unless($estParent, 403, "Vous n'avez pas accès à l'historique de présence de cet élève.");
    }
}
