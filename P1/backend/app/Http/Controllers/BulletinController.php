<?php

namespace App\Http\Controllers;

use App\Models\Bulletin;
use App\Models\Eleve;
use App\Models\ParentEleve;
use App\Support\CalculBulletin;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

/**
 * Correspond à /periodes/{id}/bulletins/generer, /eleves/{id}/bulletins et
 * /bulletins/{id}/valider dans docs/openapi.yaml.
 *
 * La génération PDF au format officiel (cahier des charges §4.4) n'est PAS
 * implémentée ici : elle suppose un modèle officiel guinéen dont nous ne
 * disposons pas encore. pdf_url reste null tant que ce gabarit n'existe
 * pas — mieux vaut l'absence explicite qu'un PDF qui ressemblerait à un
 * bulletin officiel sans en être un. Le calcul (moyenne, rang, et depuis
 * la migration 026 le détail par matière), lui, est la partie réellement
 * livrée et testée ici.
 */
class BulletinController extends Controller
{
    public function generer(Request $request, int $periodeId)
    {
        $this->autoriserAdmin($request);

        $validated = $request->validate([
            'classe_id' => ['required', 'integer'],
        ]);

        $resultats = CalculBulletin::pourClasseEtPeriode($validated['classe_id'], $periodeId);

        // Un bulletin déjà validé/publié n'est jamais touché par une
        // régénération de routine (ex. l'enseignant corrige une note après
        // coup) : une famille a pu déjà le voir. Le faire changer — chiffres
        // ou statut — exige une action explicite, pas un recalcul silencieux.
        $bulletinsExistants = Bulletin::where('periode_id', $periodeId)
            ->whereIn('eleve_id', array_keys($resultats))
            ->whereIn('statut', ['valide', 'publie'])
            ->pluck('eleve_id')
            ->all();

        $nbGeneres = 0;

        foreach ($resultats as $eleveId => $r) {
            if (in_array($eleveId, $bulletinsExistants, true)) {
                continue;
            }

            Bulletin::updateOrCreate(
                ['eleve_id' => $eleveId, 'periode_id' => $periodeId],
                [
                    'moyenne_generale' => $r['moyenne_generale'],
                    'rang' => $r['rang'],
                    'effectif_classe' => $r['effectif_classe'],
                    'detail_matieres' => $r['detail_matieres'],
                    'statut' => 'brouillon',
                    'genere_le' => now(),
                ]
            );
            $nbGeneres++;
        }

        // Génération synchrone : à l'échelle d'une classe (quelques dizaines
        // d'élèves), le calcul est immédiat. tache_id conserve la forme du
        // contrat (docs/openapi.yaml, 202 Accepted) pour ne rien casser côté
        // clients le jour où ça devient une vraie tâche de file d'attente.
        return response()->json([
            'tache_id' => (string) Str::uuid(),
            'nb_bulletins' => $nbGeneres,
            'nb_ignores_deja_publies' => count($bulletinsExistants),
        ], 202);
    }

    public function pourEleve(Request $request, int $id)
    {
        $eleve = Eleve::findOrFail($id);
        $estAdmin = $this->autoriserAdminOuParent($request, $eleve);

        $query = Bulletin::where('eleve_id', $eleve->id)->with('periode');

        // Un parent ne voit que les bulletins publiés — un 'brouillon'
        // peut encore changer (une note corrigée après coup) avant que la
        // direction ne le valide, voir le commentaire sur generer() plus
        // haut : "une famille a pu déjà le voir" est précisément ce que ce
        // filtre évite pour un brouillon. L'admin, qui doit les réviser
        // avant publication, voit tous les statuts.
        if (! $estAdmin) {
            $query->where('statut', 'publie');
        }

        return response()->json(
            $query->orderByDesc('genere_le')->get()
        );
    }

    public function valider(Request $request, int $id)
    {
        $this->autoriserAdmin($request);

        $bulletin = Bulletin::findOrFail($id);

        $bulletin->update([
            'statut' => 'publie',
            'valide_par' => $request->user()->id,
        ]);

        return response()->json($bulletin);
    }

    private function autoriserAdmin(Request $request): void
    {
        $superAdmin = $request->user()->est_super_admin;
        $admin = $request->attributes->get('role_etablissement') === 'admin_etablissement';

        abort_unless($superAdmin || $admin, 403, "Réservé à l'administrateur de l'établissement.");
    }

    /**
     * Faille trouvée le 30 août 2026, en préparant un écran mobile parent :
     * pourEleve() n'avait AUCUNE vérification — la RLS scope 'bulletins' à
     * l'établissement, pas à l'élève (022_rls_policies.sql), donc n'importe
     * quel utilisateur rattaché à l'établissement (un autre parent, un
     * enseignant qui ne suit pas cet élève) pouvait lire les bulletins de
     * N'IMPORTE QUEL élève de l'école en devinant son id — alors même
     * qu'api-contract.md documentait déjà "admin_etablissement, parent"
     * comme rôles autorisés. Le contrat était juste, l'implémentation ne
     * le respectait pas.
     */
    /** @return bool true si admin/super-admin — pourEleve() s'en sert pour filtrer les brouillons. */
    private function autoriserAdminOuParent(Request $request, Eleve $eleve): bool
    {
        $superAdmin = $request->user()->est_super_admin;
        $admin = $request->attributes->get('role_etablissement') === 'admin_etablissement';

        if ($superAdmin || $admin) {
            return true;
        }

        $estParent = ParentEleve::where('utilisateur_id', $request->user()->id)
            ->where('eleve_id', $eleve->id)
            ->exists();

        abort_unless($estParent, 403, "Vous n'avez pas accès aux bulletins de cet élève.");

        return false;
    }
}
