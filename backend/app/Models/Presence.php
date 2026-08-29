<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Presence extends Model
{
    protected $table = 'presences';

    protected $fillable = ['eleve_id', 'classe_id', 'date', 'statut', 'saisie_par', 'sync_uuid', 'statut_sync'];

    protected function casts(): array
    {
        return [
            'date' => 'date',
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
