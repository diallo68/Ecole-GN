<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FraisScolarite extends Model
{
    // Convention Eloquent : aurait deviné 'frais_scolarites' — « frais »
    // est déjà pluriel en français, la table réelle est 'frais_scolarite'
    // (docs/database-schema.md §3.5).
    protected $table = 'frais_scolarite';

    protected $fillable = ['etablissement_id', 'annee_scolaire_id', 'niveau', 'montant_total'];

    public function echeances()
    {
        return $this->hasMany(Echeance::class);
    }
}
