<?php

namespace App\Models;

use Database\Factories\UtilisateurFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

/**
 * Compte global, non tenant-scopé (docs/database-schema.md §3.1).
 * Le rattachement à un ou plusieurs établissements et le rôle qui en
 * découle vivent dans EtablissementUtilisateur, pas ici.
 */
#[Fillable(['nom', 'prenom', 'telephone', 'email', 'langue_preferee', 'mot_de_passe_hash'])]
#[Hidden(['mot_de_passe_hash'])]
class Utilisateur extends Authenticatable
{
    /** @use HasFactory<UtilisateurFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'utilisateurs';

    protected $authPasswordName = 'mot_de_passe_hash';

    protected function casts(): array
    {
        return [
            'mot_de_passe_hash' => 'hashed',
            'est_super_admin' => 'boolean',
        ];
    }

    public function rattachements()
    {
        return $this->hasMany(EtablissementUtilisateur::class);
    }
}
