<?php

namespace App\Models;

use Database\Factories\EleveFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Eleve extends Model
{
    /** @use HasFactory<EleveFactory> */
    use HasFactory;

    protected $table = 'eleves';

    protected $fillable = [
        'etablissement_id', 'matricule', 'nom', 'prenom',
        'date_naissance', 'sexe', 'photo_url', 'statut',
    ];

    protected function casts(): array
    {
        return [
            'date_naissance' => 'date',
        ];
    }

    public function inscriptions()
    {
        return $this->hasMany(Inscription::class);
    }

    public function parents()
    {
        return $this->belongsToMany(Utilisateur::class, 'parent_eleve', 'eleve_id', 'utilisateur_id')
            ->withPivot(['lien', 'est_contact_principal']);
    }
}
