<?php

namespace App\Http\Controllers;

use App\Models\Classe;
use App\Models\Eleve;
use App\Models\EtablissementUtilisateur;
use App\Models\Inscription;
use App\Models\ParentEleve;
use App\Models\Utilisateur;
use App\Support\LecteurCsv;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

/**
 * Correspond à /etablissements/{etablissementId}/eleves, /eleves/{id},
 * /eleves/{id}/inscriptions et /etablissements/{etablissementId}/eleves/import
 * dans docs/openapi.yaml.
 */
class EleveController extends Controller
{
    public function index(Request $request, int $etablissementId)
    {
        $query = Eleve::where('etablissement_id', $etablissementId);

        if ($request->filled('q')) {
            $terme = '%'.$request->string('q').'%';
            $query->where(function ($q) use ($terme) {
                $q->where('nom', 'ilike', $terme)
                    ->orWhere('prenom', 'ilike', $terme)
                    ->orWhere('matricule', 'ilike', $terme);
            });
        }

        $paginateur = $query->orderBy('nom')->paginate($request->integer('per_page', 25));

        return response()->json([
            'data' => $paginateur->items(),
            'meta' => [
                'page' => $paginateur->currentPage(),
                'per_page' => $paginateur->perPage(),
                'total' => $paginateur->total(),
            ],
        ]);
    }

    public function store(Request $request, int $etablissementId)
    {
        $this->autoriserAdmin($request);

        $validated = $request->validate([
            'matricule' => ['nullable', 'string', 'max:30'],
            'nom' => ['required', 'string', 'max:100'],
            'prenom' => ['required', 'string', 'max:100'],
            'date_naissance' => ['nullable', 'date'],
            'sexe' => ['nullable', 'in:M,F'],
        ]);

        $validated['matricule'] ??= $this->genererMatricule($etablissementId);

        try {
            // DB::transaction : voir le commentaire équivalent dans
            // import() plus bas — un Eleve::create() nu, sous Postgres,
            // avorte toute transaction englobante (tests RefreshDatabase
            // ou futur contexte transactionnel) sur une violation de
            // contrainte, pas seulement l'opération elle-même.
            $eleve = DB::transaction(fn () => Eleve::create([...$validated, 'etablissement_id' => $etablissementId]));
        } catch (QueryException $e) {
            if ($e->getCode() === '23505') {
                return response()->json([
                    'error' => ['code' => 'matricule_existant', 'message' => 'Ce matricule est déjà utilisé dans cet établissement.'],
                ], 409);
            }
            throw $e;
        }

        return response()->json($eleve, 201);
    }

    /**
     * Parcours critique n°1 du MVP (docs/mvp-scope.md) : « la direction
     * importe la liste des élèves via CSV ». Colonnes attendues (en-tête,
     * insensible à la casse) : nom, prenom, matricule (optionnel — généré
     * comme dans store() si absent), date_naissance (optionnel, AAAA-MM-JJ),
     * sexe (optionnel, M/F).
     *
     * Chaque ligne est traitée indépendamment (même principe que
     * SyncController::batch) : une ligne invalide est rejetée sans faire
     * échouer les autres — un fichier de 40 élèves avec une ligne mal
     * saisie ne doit pas perdre les 39 autres.
     */
    public function import(Request $request, int $etablissementId)
    {
        $this->autoriserAdmin($request);

        $request->validate([
            'fichier' => ['required', 'file', 'mimes:csv,txt', 'max:2048'],
        ]);

        $lignes = LecteurCsv::lignes($request->file('fichier'));

        $nbCrees = 0;
        $erreurs = [];

        foreach ($lignes as $i => $ligne) {
            $numeroLigne = $i + 2; // +1 pour l'en-tête, +1 pour repasser en base 1

            $validateur = Validator::make($ligne, [
                'nom' => ['required', 'string', 'max:100'],
                'prenom' => ['required', 'string', 'max:100'],
                'matricule' => ['nullable', 'string', 'max:30'],
                'date_naissance' => ['nullable', 'date'],
                'sexe' => ['nullable', 'in:M,F'],
            ]);

            if ($validateur->fails()) {
                $erreurs[] = ['ligne' => $numeroLigne, 'message' => $validateur->errors()->first()];

                continue;
            }

            $donnees = $validateur->validated();
            // (?? '') avant ?: : une colonne "matricule" absente du CSV
            // (pas seulement vide) n'existe pas du tout comme clé dans
            // $donnees — un CSV avec seulement nom,prenom en en-tête est
            // un cas réel (une école sans matricules pré-assignés n'a
            // aucune raison d'inclure la colonne). Accéder à une clé de
            // tableau absente lève une erreur ; ?? la traite comme null en
            // silence — trouvé en testant ce cas via le proxy Vite,
            // exactement le CSV qu'un utilisateur enverrait, pas en
            // relisant le code.
            $donnees['matricule'] = ($donnees['matricule'] ?? '') ?: $this->genererMatricule($etablissementId);

            try {
                // DB::transaction, pas un Eleve::create() nu : sous
                // Postgres, une violation de contrainte avorte TOUTE la
                // transaction englobante (celle que RefreshDatabase ouvre
                // pour tout le test, ou une future requête HTTP dans un
                // contexte transactionnel) — sans savepoint, la ligne
                // suivante échouerait aussi avec "current transaction is
                // aborted", même si elle est parfaitement valide. Laravel
                // émet un SAVEPOINT quand une transaction est déjà ouverte,
                // et ne fait un ROLLBACK TO SAVEPOINT que jusqu'ici en cas
                // d'échec. Trouvé en testant un import avec une ligne en
                // doublon suivie d'une ligne valide, pas en relisant le code.
                DB::transaction(fn () => Eleve::create([...$donnees, 'etablissement_id' => $etablissementId]));
                $nbCrees++;
            } catch (QueryException $e) {
                if ($e->getCode() === '23505') {
                    $erreurs[] = ['ligne' => $numeroLigne, 'message' => 'Ce matricule est déjà utilisé dans cet établissement.'];
                } else {
                    throw $e;
                }
            }
        }

        // 202 + import_id : forme du contrat conservée pour un traitement
        // asynchrone futur (fichiers de plusieurs milliers de lignes), même
        // choix que BulletinController::generer. À l'échelle d'un import
        // d'établissement pilote (quelques centaines d'élèves), le
        // traitement synchrone est immédiat — pas de file d'attente à
        // opérer pour l'instant.
        return response()->json([
            'import_id' => (string) Str::uuid(),
            'lignes_recues' => count($lignes),
            'nb_crees' => $nbCrees,
            'nb_erreurs' => count($erreurs),
            'erreurs' => $erreurs,
        ], 202);
    }

    public function show(Request $request, int $id)
    {
        return response()->json(Eleve::findOrFail($id));
    }

    public function inscrire(Request $request, int $id)
    {
        $this->autoriserAdmin($request);

        $eleve = Eleve::findOrFail($id);

        $validated = $request->validate([
            'classe_id' => ['required', 'integer'],
            'annee_scolaire_id' => ['required', 'integer'],
            'date_inscription' => ['nullable', 'date'],
        ]);

        // La RLS confirme que la classe appartient au même établissement que
        // l'élève (elle serait invisible sinon).
        Classe::findOrFail($validated['classe_id']);

        try {
            // DB::transaction — même piège Postgres que store(), trouvé en
            // écrivant TransfertClasseTest : une requête qui suit celle-ci
            // dans le même test échouait avec "current transaction is
            // aborted" bien qu'elle n'ait rien à voir avec l'inscription en
            // doublon.
            $inscription = DB::transaction(fn () => Inscription::create([
                'eleve_id' => $eleve->id,
                'classe_id' => $validated['classe_id'],
                'annee_scolaire_id' => $validated['annee_scolaire_id'],
                'date_inscription' => $validated['date_inscription'] ?? now()->toDateString(),
            ]));
        } catch (QueryException $e) {
            if ($e->getCode() === '23505') {
                return response()->json([
                    'error' => ['code' => 'deja_inscrit', 'message' => 'Cet élève est déjà inscrit pour cette année scolaire.'],
                ], 409);
            }
            throw $e;
        }

        return response()->json($inscription, 201);
    }

    /**
     * Transfère l'élève vers une autre classe, même année scolaire —
     * UNIQUE(eleve_id, annee_scolaire_id) sur inscriptions n'autorise
     * qu'une seule inscription par élève et par année, donc pas de
     * nouvelle ligne via inscrire() : rejaillirait en 409 'deja_inscrit'.
     * Trouvé manquant en confrontant mvp-scope.md (qui déclarait « 4.2
     * Transferts entre classes » complet) à l'API réelle — aucune route
     * ne permettait de changer la classe d'une inscription existante.
     */
    public function transferer(Request $request, int $id)
    {
        $this->autoriserAdmin($request);

        $inscription = Inscription::findOrFail($id);

        $validated = $request->validate([
            'classe_id' => ['required', 'integer'],
        ]);

        // La RLS confirme que la nouvelle classe appartient au même
        // établissement que l'inscription (elle serait invisible sinon).
        $nouvelleClasse = Classe::findOrFail($validated['classe_id']);

        abort_if(
            (int) $nouvelleClasse->annee_scolaire_id !== (int) $inscription->annee_scolaire_id,
            422,
            "La classe cible n'appartient pas à la même année scolaire que l'inscription."
        );

        $inscription->update(['classe_id' => $validated['classe_id']]);

        return response()->json($inscription);
    }

    public function parents(Request $request, int $id)
    {
        $eleve = Eleve::findOrFail($id);

        return response()->json(
            ParentEleve::where('eleve_id', $eleve->id)->with('utilisateur')->get()
        );
    }

    public function lierParent(Request $request, int $id)
    {
        $this->autoriserAdmin($request);
        $eleve = Eleve::findOrFail($id);

        $validated = $request->validate([
            'telephone' => ['required', 'string', 'max:20'],
            'nom' => ['required', 'string', 'max:100'],
            'prenom' => ['required', 'string', 'max:100'],
            'email' => ['nullable', 'email', 'max:255'],
            'lien' => ['required', 'in:pere,mere,tuteur_legal,autre'],
            'est_contact_principal' => ['sometimes', 'boolean'],
        ]);

        try {
            $lien = DB::transaction(function () use ($validated, $eleve) {
                // Même logique que EtablissementUtilisateurController::store :
                // le téléphone identifie la personne globalement, le compte
                // est réutilisé s'il existe déjà (parent avec un autre
                // enfant, ou déjà rattaché à un autre établissement).
                $parent = Utilisateur::firstOrCreate(
                    ['telephone' => $validated['telephone']],
                    [
                        'nom' => $validated['nom'],
                        'prenom' => $validated['prenom'],
                        'email' => $validated['email'] ?? null,
                        'mot_de_passe_hash' => Str::random(16),
                        'langue_preferee' => 'fr',
                        'statut' => 'actif',
                    ]
                );

                EtablissementUtilisateur::firstOrCreate([
                    'etablissement_id' => $eleve->etablissement_id,
                    'utilisateur_id' => $parent->id,
                    'role' => 'parent',
                ]);

                return ParentEleve::create([
                    'utilisateur_id' => $parent->id,
                    'eleve_id' => $eleve->id,
                    'lien' => $validated['lien'],
                    'est_contact_principal' => $validated['est_contact_principal'] ?? false,
                ]);
            });
        } catch (QueryException $e) {
            if ($e->getCode() === '23505') {
                return response()->json([
                    'error' => ['code' => 'lien_existant', 'message' => 'Ce parent est déjà lié à cet élève.'],
                ], 409);
            }
            throw $e;
        }

        return response()->json($lien->load('utilisateur'), 201);
    }

    private function genererMatricule(int $etablissementId): string
    {
        $sequence = Eleve::where('etablissement_id', $etablissementId)->count() + 1;

        return sprintf('EL-%05d', $sequence);
    }

    private function autoriserAdmin(Request $request): void
    {
        $superAdmin = $request->user()->est_super_admin;
        $admin = $request->attributes->get('role_etablissement') === 'admin_etablissement';
        $personnel = $request->attributes->get('role_etablissement') === 'personnel_administratif';

        abort_unless($superAdmin || $admin || $personnel, 403, 'Rôle insuffisant pour gérer les élèves.');
    }
}
