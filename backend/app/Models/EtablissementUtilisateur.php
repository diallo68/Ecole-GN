<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Rattachement d'un compte à un établissement + rôle (RBAC).
 * C'est cette table, pas Utilisateur, qui porte l'isolation multi-tenant
 * pour les identités (docs/database-schema.md §3.1).
 */
class EtablissementUtilisateur extends Model
{
    protected $table = 'etablissement_utilisateurs';

    protected $fillable = ['etablissement_id', 'utilisateur_id', 'role', 'statut'];

    public function etablissement()
    {
        return $this->belongsTo(Etablissement::class);
    }

    public function utilisateur()
    {
        return $this->belongsTo(Utilisateur::class);
    }
}
