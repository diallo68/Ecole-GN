<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Inscription extends Model
{
    protected $table = 'inscriptions';

    protected $fillable = ['eleve_id', 'classe_id', 'annee_scolaire_id', 'date_inscription', 'statut'];

    protected function casts(): array
    {
        return [
            'date_inscription' => 'date',
        ];
    }

    public function eleve()
    {
        return $this->belongsTo(Eleve::class);
    }

    public function classe()
    {
        return $this->belongsTo(Classe::class);
    }
}
