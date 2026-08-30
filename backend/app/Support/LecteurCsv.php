<?php

namespace App\Support;

use Illuminate\Http\UploadedFile;

/**
 * Lecture CSV minimale pour les imports en masse (cahier des charges §4.1 :
 * import CSV/Excel des utilisateurs et élèves — parcours critique n°1,
 * docs/mvp-scope.md).
 *
 * Fonctions natives PHP (fgetcsv), pas de paquet Composer supplémentaire —
 * un fichier de quelques centaines de lignes ne justifie pas une nouvelle
 * dépendance (voir CLAUDE.md : changement de dépendances soumis à
 * approbation). Le "Excel" du cahier des charges reste hors périmètre :
 * un utilisateur exporte du CSV depuis Excel/LibreOffice/Google Sheets en
 * un clic, ce n'est pas la même chose que parser du .xlsx binaire.
 */
class LecteurCsv
{
    /**
     * @return array<int, array<string, string|null>> une ligne par élément,
     *                                                clé = en-tête de colonne (première ligne du fichier)
     */
    public static function lignes(UploadedFile $fichier): array
    {
        $poignee = fopen($fichier->getRealPath(), 'r');
        if ($poignee === false) {
            return [];
        }

        $entetes = fgetcsv($poignee);
        if ($entetes === false) {
            fclose($poignee);

            return [];
        }
        $entetes = array_map(fn ($e) => trim(strtolower((string) $e)), $entetes);

        $lignes = [];
        while (($brute = fgetcsv($poignee)) !== false) {
            // Ligne vide (retour à la ligne final du fichier, typiquement) :
            // ignorée silencieusement, ce n'est pas une erreur de saisie.
            if (count(array_filter($brute, fn ($v) => $v !== null && trim((string) $v) !== '')) === 0) {
                continue;
            }

            // Nombre de colonnes différent de l'en-tête : on complète avec
            // des chaînes vides plutôt que de faire échouer tout l'import
            // sur une ligne mal formée — chaque ligne reste indépendante
            // (même principe que SyncController::batch).
            $valeurs = array_pad($brute, count($entetes), '');
            $valeurs = array_slice($valeurs, 0, count($entetes));

            // Cellule vide -> null, pas '' : sinon une colonne optionnelle
            // avec contrainte UNIQUE nullable (ex. utilisateurs.email) fait
            // percuter la DEUXIÈME ligne qui la laisse vide, alors que
            // Postgres autorise plusieurs NULL sans problème — '' n'est
            // pas NULL. Le middleware ConvertEmptyStringsToNull de Laravel
            // ne s'applique qu'aux entrées de $request, jamais à un
            // tableau construit à la main comme celui-ci. Trouvé en
            // import réel (deux lignes email vide dans le même fichier),
            // pas en écrivant le test (qui n'avait jamais essayé deux
            // lignes avec le même champ optionnel vide).
            $valeurs = array_map(fn ($v) => $v === '' ? null : $v, $valeurs);

            $lignes[] = array_combine($entetes, $valeurs);
        }

        fclose($poignee);

        return $lignes;
    }
}
