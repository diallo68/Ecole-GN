<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Bulletin extends Model
{
    protected $table = 'bulletins';

    protected $fillable = [
        'eleve_id', 'periode_id', 'moyenne_generale', 'rang', 'effectif_classe',
        'appreciation_generale', 'pdf_url', 'statut', 'valide_par', 'genere_le',
        'detail_matieres',
    ];

    protected function casts(): array
    {
        return [
            'moyenne_generale' => 'decimal:2',
            'genere_le' => 'datetime',
            // Moyenne par matière (matiere_id => moyenne), calculée par
            // CalculBulletin::pourClasseEtPeriode() — voir migration
            // 026_bulletins_detail_matieres.sql. Un bulletin sans ce détail
            // n'est consultable que comme une note globale, pas comme un
            // vrai bulletin.
            'detail_matieres' => 'array',
        ];
    }

    public function eleve()
    {
        return $this->belongsTo(Eleve::class);
    }

    public function periode()
    {
        return $this->belongsTo(PeriodeEvaluation::class, 'periode_id');
    }
}
