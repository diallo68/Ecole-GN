<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Echeance extends Model
{
    protected $table = 'echeances';

    protected $fillable = ['frais_scolarite_id', 'eleve_id', 'libelle', 'montant_du', 'date_echeance', 'statut'];

    protected function casts(): array
    {
        return [
            'date_echeance' => 'date',
        ];
    }

    public function eleve()
    {
        return $this->belongsTo(Eleve::class);
    }

    public function fraisScolarite()
    {
        return $this->belongsTo(FraisScolarite::class);
    }

    public function paiements()
    {
        return $this->hasMany(Paiement::class);
    }
}
