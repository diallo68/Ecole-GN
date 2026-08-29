<?php

namespace App\Http\Middleware;

use App\Models\EtablissementUtilisateur;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

/**
 * Résout l'établissement courant pour la requête et pose la variable de
 * session que les policies RLS lisent (docs/database-schema.md §5,
 * db/migrations/022_rls_policies.sql).
 *
 * Doit tourner APRÈS auth:sanctum. N'affecte pas le rôle de connexion : la
 * RLS reste appliquée ou non selon le rôle Postgres utilisé (voir
 * config/database.php — 'pgsql' doit être app_ecole_gn en prod, jamais le
 * propriétaire).
 */
class ResolveEtablissementContext
{
    public function handle(Request $request, Closure $next): Response
    {
        $utilisateur = $request->user();

        if (! $utilisateur) {
            return response()->json([
                'error' => ['code' => 'unauthenticated', 'message' => 'Authentification requise.'],
            ], 401);
        }

        // Doit être posé AVANT toute lecture de etablissement_utilisateurs
        // (y compris dans resoudreEtablissementId ci-dessous) : c'est ce que
        // lit la policy own_rattachement_visible (024) pour laisser un
        // utilisateur consulter ses propres rattachements alors que
        // app.current_etablissement_id n'est pas encore déterminé — bug
        // trouvé en testant : sans ça, la vérification d'accès se bloquait
        // elle-même (0 ligne visible, y compris pour l'utilisateur légitime).
        $this->poserVariableSession('app.current_utilisateur_id', (string) $utilisateur->id);
        $this->poserVariableSession('app.is_super_admin', $utilisateur->est_super_admin ? 'true' : 'false');

        $etablissementId = $this->resoudreEtablissementId($request, $utilisateur);

        if ($utilisateur->est_super_admin) {
            // Un super-admin sans établissement résolu agit hors contexte
            // tenant (ex. GET /etablissements) : la policy super_admin_bypass
            // (023) couvre `etablissements` pour ce cas précis. Toute autre
            // table exige toujours un etablissement_id explicite, même pour
            // un super-admin — voir 023_super_admin_rls_bypass.sql.
            if ($etablissementId !== null) {
                $this->poserVariableSession('app.current_etablissement_id', (string) $etablissementId);
                $request->attributes->set('etablissement_id', $etablissementId);
            }

            return $next($request);
        }

        if ($etablissementId === null) {
            return response()->json([
                'error' => [
                    'code' => 'etablissement_requis',
                    'message' => "Impossible de déterminer l'établissement. Précisez l'en-tête X-Etablissement-Id.",
                ],
            ], 409);
        }

        $rattachement = $utilisateur->rattachements()
            ->where('etablissement_id', $etablissementId)
            ->where('statut', 'actif')
            ->first();

        if (! $rattachement) {
            return response()->json([
                'error' => ['code' => 'forbidden', 'message' => 'Aucun accès à cet établissement.'],
            ], 403);
        }

        $request->attributes->set('role_etablissement', $rattachement->role);
        $request->attributes->set('etablissement_id', $etablissementId);
        $this->poserVariableSession('app.current_etablissement_id', (string) $etablissementId);

        return $next($request);
    }

    /**
     * `SET x = $1` n'existe pas côté Postgres (SET n'accepte pas de
     * paramètre lié) — set_config() est la fonction SQL équivalente,
     * paramétrable normalement. Découvert en testant : la première version
     * de ce middleware utilisait DB::statement('SET ... = ?', ...), qui
     * échouait sur toute requête protégée par ce middleware.
     *
     * SET (implicite ici, pas SET LOCAL) : sûr avec le cycle de vie
     * PHP-FPM / artisan serve, où chaque requête obtient sa propre
     * connexion PDO. À revoir si le déploiement passe un jour à Octane ou
     * à un pool de connexions type PgBouncer en mode transaction — voir
     * db/README.md.
     */
    private function poserVariableSession(string $nom, string $valeur): void
    {
        DB::selectOne('SELECT set_config(?, ?, false)', [$nom, $valeur]);
    }

    private function resoudreEtablissementId(Request $request, $utilisateur): ?int
    {
        if ($request->route('etablissementId')) {
            return (int) $request->route('etablissementId');
        }

        if ($request->hasHeader('X-Etablissement-Id')) {
            return (int) $request->header('X-Etablissement-Id');
        }

        $rattachementsActifs = EtablissementUtilisateur::where('utilisateur_id', $utilisateur->id)
            ->where('statut', 'actif')
            ->pluck('etablissement_id')
            ->unique();

        return $rattachementsActifs->count() === 1 ? (int) $rattachementsActifs->first() : null;
    }
}
