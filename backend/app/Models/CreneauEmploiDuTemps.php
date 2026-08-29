<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CreneauEmploiDuTemps extends Model
{
    // La table est 'emplois_du_temps' (docs/database-schema.md §3.2) — sans
    // rapport avec ce que la convention Eloquent aurait deviné pour ce nom
    // de classe.
    protected $table = 'emplois_du_temps';

    protected $fillable = ['classe_id', 'matiere_id', 'enseignant_id', 'jour_semaine', 'heure_debut', 'heure_fin', 'salle'];

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
