<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Etablissement extends Model
{
    protected $fillable = ['nom', 'cycle', 'adresse', 'ville', 'region', 'logo_url', 'statut'];

    public function rattachements()
    {
        return $this->hasMany(EtablissementUtilisateur::class);
    }
}
