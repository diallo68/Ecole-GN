<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Evaluation extends Model
{
    protected $table = 'evaluations';

    protected $fillable = [
        'classe_matiere_enseignant_id', 'periode_id', 'type', 'libelle',
        'coefficient', 'date_evaluation',
    ];

    protected function casts(): array
    {
        return [
            'date_evaluation' => 'date',
        ];
    }

    public function classeMatiereEnseignant()
    {
        return $this->belongsTo(ClasseMatiereEnseignant::class);
    }

    public function periode()
    {
        return $this->belongsTo(PeriodeEvaluation::class, 'periode_id');
    }

    public function notes()
    {
        return $this->hasMany(Note::class);
    }
}
