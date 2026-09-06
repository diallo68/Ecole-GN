<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ClasseMatiereEnseignant extends Model
{
    // Convention Eloquent : aurait deviné 'classe_matiere_enseignants'
    // (pluriel ajouté en bout de chaîne composée) — la table réelle est
    // 'classe_matiere_enseignant' (voir docs/database-schema.md §3.2).
    protected $table = 'classe_matiere_enseignant';

    protected $fillable = ['classe_id', 'matiere_id', 'enseignant_id', 'coefficient'];

    public function classe()
    {
        return $this->belongsTo(Classe::class);
    }

    public function matiere()
    {
        return $this->belongsTo(Matiere::class);
    }

    public function enseignant()
    {
        return $this->belongsTo(Utilisateur::class, 'enseignant_id');
    }
}
