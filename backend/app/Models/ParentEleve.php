<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ParentEleve extends Model
{
    // Convention Eloquent : aurait deviné 'parent_eleves' — la table réelle
    // est 'parent_eleve' (docs/database-schema.md §3.2). Volontairement
    // sans RLS par établissement (un parent est lié à des enfants de
    // plusieurs écoles) — voir db/migrations/022_rls_policies.sql.
    protected $table = 'parent_eleve';

    public $timestamps = false;

    protected $fillable = ['utilisateur_id', 'eleve_id', 'lien', 'est_contact_principal'];

    public function utilisateur()
    {
        return $this->belongsTo(Utilisateur::class);
    }

    public function eleve()
    {
        return $this->belongsTo(Eleve::class);
    }
}
