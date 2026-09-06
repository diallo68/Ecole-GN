<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PeriodeEvaluation extends Model
{
    // Convention Eloquent : aurait deviné 'periode_evaluations' — la table
    // réelle est 'periodes_evaluation' (voir docs/database-schema.md §3.3).
    protected $table = 'periodes_evaluation';

    protected $fillable = ['etablissement_id', 'annee_scolaire_id', 'libelle', 'date_debut', 'date_fin', 'statut'];

    protected function casts(): array
    {
        return [
            'date_debut' => 'date',
            'date_fin' => 'date',
        ];
    }

    public function evaluations()
    {
        return $this->hasMany(Evaluation::class, 'periode_id');
    }
}
