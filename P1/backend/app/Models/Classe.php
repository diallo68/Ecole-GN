<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Classe extends Model
{
    protected $table = 'classes';

    protected $fillable = [
        'etablissement_id', 'annee_scolaire_id', 'niveau', 'libelle',
        'enseignant_titulaire_id', 'effectif_max',
    ];

    public function inscriptions()
    {
        return $this->hasMany(Inscription::class);
    }

    public function eleves()
    {
        return $this->hasManyThrough(
            Eleve::class,
            Inscription::class,
            'classe_id',
            'id',
            'id',
            'eleve_id'
        )->where('inscriptions.statut', 'inscrit');
    }

    public function matieresEnseignees()
    {
        return $this->hasMany(ClasseMatiereEnseignant::class);
    }
}
