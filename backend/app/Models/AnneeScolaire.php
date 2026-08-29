<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AnneeScolaire extends Model
{
    protected $table = 'annees_scolaires';

    protected $fillable = ['etablissement_id', 'libelle', 'date_debut', 'date_fin', 'statut'];

    protected function casts(): array
    {
        return [
            'date_debut' => 'date',
            'date_fin' => 'date',
        ];
    }

    public function etablissement()
    {
        return $this->belongsTo(Etablissement::class);
    }
}
