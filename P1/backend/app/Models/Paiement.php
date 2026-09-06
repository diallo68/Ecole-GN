<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Paiement extends Model
{
    protected $table = 'paiements';

    protected $fillable = ['echeance_id', 'montant', 'mode', 'reference_recu', 'encaisse_par', 'date_paiement', 'pdf_recu_url'];

    public $timestamps = false; // pas d'updated_at en base (voir 019_paiements.sql) : un paiement ne se modifie pas

    protected function casts(): array
    {
        return [
            'date_paiement' => 'date',
            'created_at' => 'datetime',
        ];
    }

    public function echeance()
    {
        return $this->belongsTo(Echeance::class);
    }
}
