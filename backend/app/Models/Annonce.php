<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Annonce extends Model
{
    protected $table = 'annonces';

    protected $fillable = ['etablissement_id', 'auteur_id', 'titre', 'contenu', 'cible_type', 'cible_id', 'publiee_le'];

    public $timestamps = false; // pas d'updated_at en base (020_annonces.sql) — une annonce publiée ne se modifie pas

    protected function casts(): array
    {
        return [
            'publiee_le' => 'datetime',
            'created_at' => 'datetime',
        ];
    }

    public function auteur()
    {
        return $this->belongsTo(Utilisateur::class, 'auteur_id');
    }
}
