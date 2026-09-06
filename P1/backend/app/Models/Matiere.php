<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Matiere extends Model
{
    protected $table = 'matieres';

    protected $fillable = ['etablissement_id', 'nom', 'coefficient_defaut'];
}
