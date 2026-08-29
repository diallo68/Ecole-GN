<?php

namespace App\Http\Controllers;

use App\Models\Classe;
use App\Models\ClasseMatiereEnseignant;
use App\Models\Evaluation;
use App\Models\Note;
use App\Models\Presence;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

/**
 * Correspond à /sync/batch dans docs/openapi.yaml — le point d'entrée que
 * l'app mobile enseignant rejoue au retour du réseau pour les notes et
 * présences saisies hors ligne (architecture-technique.md §04).
 *
 * Chaque écriture du lot est traitée indépendamment : une écriture
 * invalide ou non autorisée est rejetée SANS faire échouer les autres
 * (un enseignant qui a fait l'appel de 40 élèves hors ligne ne doit pas
 * perdre 39 présences valides à cause d'une seule ligne corrompue).
 *
 * Idempotence par sync_uuid : rejouer la même écriture (retransmission
 * après coupure) renvoie 'deja_applique' sans effet de bord — c'est la
 * même clé que Notes/Présences utilisent déjà pour la saisie directe,
 * ce module ne fait qu'exposer un point d'entrée en lot pour elle.
 */
class SyncController extends Controller
{
    public function batch(Request $request)
    {
        $validated = $request->validate([
            'ecritures' => ['required', 'array', 'min:1'],
            'ecritures.*.sync_uuid' => ['required', 'uuid'],
            'ecritures.*.type' => ['required', 'in:note,presence'],
            'ecritures.*.payload' => ['required', 'array'],
        ]);

        $resultats = collect($validated['ecritures'])
            ->map(fn (array $ecriture) => $this->traiterEcriture($request, $ecriture))
            ->values();

        return response()->json(['resultats' => $resultats]);
    }

    private function traiterEcriture(Request $request, array $ecriture): array
    {
        $syncUuid = $ecriture['sync_uuid'];

        try {
            return match ($ecriture['type']) {
                'note' => $this->appliquerNote($request, $syncUuid, $ecriture['payload']),
                'presence' => $this->appliquerPresence($request, $syncUuid, $ecriture['payload']),
            };
        } catch (ValidationException $e) {
            return ['sync_uuid' => $syncUuid, 'statut' => 'rejete', 'erreur' => $e->validator->errors()->first()];
        } catch (\Throwable $e) {
            return ['sync_uuid' => $syncUuid, 'statut' => 'rejete', 'erreur' => $e->getMessage()];
        }
    }

    private function appliquerNote(Request $request, string $syncUuid, array $payload): array
    {
        if (Note::where('sync_uuid', $syncUuid)->exists()) {
            return ['sync_uuid' => $syncUuid, 'statut' => 'deja_applique', 'erreur' => null];
        }

        $donnees = Validator::make($payload, [
            'evaluation_id' => ['required', 'integer'],
            'eleve_id' => ['required', 'integer'],
            'valeur' => ['nullable', 'numeric', 'min:0', 'max:20'],
            'appreciation' => ['nullable', 'string'],
        ])->validate();

        $evaluation = Evaluation::with('classeMatiereEnseignant', 'periode')->findOrFail($donnees['evaluation_id']);
        $this->autoriserEnseignantOuAdmin($request, $evaluation->classeMatiereEnseignant->enseignant_id);

        if ($evaluation->periode->statut === 'cloturee') {
            return ['sync_uuid' => $syncUuid, 'statut' => 'rejete', 'erreur' => 'Période clôturée.'];
        }

        Note::updateOrCreate(
            ['evaluation_id' => $donnees['evaluation_id'], 'eleve_id' => $donnees['eleve_id']],
            [
                'valeur' => $donnees['valeur'] ?? null,
                'appreciation' => $donnees['appreciation'] ?? null,
                'saisie_par' => $request->user()->id,
                'sync_uuid' => $syncUuid,
                'statut_sync' => 'synced',
            ]
        );

        return ['sync_uuid' => $syncUuid, 'statut' => 'applique', 'erreur' => null];
    }

    private function appliquerPresence(Request $request, string $syncUuid, array $payload): array
    {
        if (Presence::where('sync_uuid', $syncUuid)->exists()) {
            return ['sync_uuid' => $syncUuid, 'statut' => 'deja_applique', 'erreur' => null];
        }

        $donnees = Validator::make($payload, [
            'classe_id' => ['required', 'integer'],
            'eleve_id' => ['required', 'integer'],
            'date' => ['required', 'date'],
            'statut' => ['required', 'in:present,absent,retard,excuse'],
        ])->validate();

        $classe = Classe::findOrFail($donnees['classe_id']);
        $this->autoriserEnseignantDeLaClasse($request, $classe);

        Presence::updateOrCreate(
            ['eleve_id' => $donnees['eleve_id'], 'classe_id' => $classe->id, 'date' => $donnees['date']],
            [
                'statut' => $donnees['statut'],
                'saisie_par' => $request->user()->id,
                'sync_uuid' => $syncUuid,
                'statut_sync' => 'synced',
            ]
        );

        return ['sync_uuid' => $syncUuid, 'statut' => 'applique', 'erreur' => null];
    }

    private function autoriserEnseignantOuAdmin(Request $request, int $enseignantAffecteId): void
    {
        $superAdmin = $request->user()->est_super_admin;
        $admin = $request->attributes->get('role_etablissement') === 'admin_etablissement';
        $estLEnseignant = $enseignantAffecteId === $request->user()->id;

        if (! ($superAdmin || $admin || $estLEnseignant)) {
            throw new \RuntimeException('Non autorisé pour cette évaluation.');
        }
    }

    private function autoriserEnseignantDeLaClasse(Request $request, Classe $classe): void
    {
        $superAdmin = $request->user()->est_super_admin;
        $admin = $request->attributes->get('role_etablissement') === 'admin_etablissement';
        $utilisateurId = $request->user()->id;

        $estTitulaire = $classe->enseignant_titulaire_id === $utilisateurId;
        $enseigneDansLaClasse = ClasseMatiereEnseignant::where('classe_id', $classe->id)
            ->where('enseignant_id', $utilisateurId)
            ->exists();

        if (! ($superAdmin || $admin || $estTitulaire || $enseigneDansLaClasse)) {
            throw new \RuntimeException('Non autorisé pour cette classe.');
        }
    }
}
