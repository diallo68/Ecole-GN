// Modèles alignés sur docs/openapi.yaml — mêmes champs que web/src/lib/types.ts,
// gardés délibérément minimaux (juste ce que l'app mobile consomme).

class Utilisateur {
  final int id;
  final String nom;
  final String prenom;
  final String telephone;
  final bool estSuperAdmin;

  Utilisateur({
    required this.id,
    required this.nom,
    required this.prenom,
    required this.telephone,
    required this.estSuperAdmin,
  });

  factory Utilisateur.fromJson(Map<String, dynamic> json) => Utilisateur(
    id: json['id'] as int,
    nom: json['nom'] as String,
    prenom: json['prenom'] as String,
    telephone: json['telephone'] as String,
    estSuperAdmin: json['est_super_admin'] as bool? ?? false,
  );
}

class Etablissement {
  final int id;
  final String nom;

  Etablissement({required this.id, required this.nom});

  factory Etablissement.fromJson(Map<String, dynamic> json) =>
      Etablissement(id: json['id'] as int, nom: json['nom'] as String);
}

class Rattachement {
  final int id;
  final String role;
  final Etablissement etablissement;

  Rattachement({
    required this.id,
    required this.role,
    required this.etablissement,
  });

  factory Rattachement.fromJson(Map<String, dynamic> json) => Rattachement(
    id: json['id'] as int,
    role: json['role'] as String,
    etablissement: Etablissement.fromJson(
      json['etablissement'] as Map<String, dynamic>,
    ),
  );
}

class Classe {
  final int id;
  final String niveau;
  final String libelle;

  Classe({required this.id, required this.niveau, required this.libelle});

  factory Classe.fromJson(Map<String, dynamic> json) => Classe(
    id: json['id'] as int,
    niveau: json['niveau'] as String,
    libelle: json['libelle'] as String,
  );
}

class Eleve {
  final int id;
  final String matricule;
  final String nom;
  final String prenom;
  // Présent uniquement sur GET /mes-enfants (classe actuelle de l'enfant) —
  // absent partout ailleurs (GET /classes/{id}/eleves, etc.).
  final Classe? classe;

  Eleve({
    required this.id,
    required this.matricule,
    required this.nom,
    required this.prenom,
    this.classe,
  });

  factory Eleve.fromJson(Map<String, dynamic> json) => Eleve(
    id: json['id'] as int,
    matricule: json['matricule'] as String,
    nom: json['nom'] as String,
    prenom: json['prenom'] as String,
    classe: json['classe'] == null
        ? null
        : Classe.fromJson(json['classe'] as Map<String, dynamic>),
  );
}

enum StatutPresence { present, absent, retard, excuse }

extension StatutPresenceJson on StatutPresence {
  String get valeurApi => name;

  static StatutPresence depuisApi(String v) =>
      StatutPresence.values.firstWhere((s) => s.name == v);
}

class Matiere {
  final int id;
  final String nom;

  Matiere({required this.id, required this.nom});

  factory Matiere.fromJson(Map<String, dynamic> json) =>
      Matiere(id: json['id'] as int, nom: json['nom'] as String);
}

/// Une ligne de GET /classes/{id}/matieres : l'affectation d'un enseignant
/// à une matière pour une classe donnée (table classe_matiere_enseignant).
class MatiereEnseignee {
  final int id;
  final int matiereId;
  final int enseignantId;
  final Matiere matiere;
  final Utilisateur enseignant;

  MatiereEnseignee({
    required this.id,
    required this.matiereId,
    required this.enseignantId,
    required this.matiere,
    required this.enseignant,
  });

  factory MatiereEnseignee.fromJson(Map<String, dynamic> json) =>
      MatiereEnseignee(
        id: json['id'] as int,
        matiereId: json['matiere_id'] as int,
        enseignantId: json['enseignant_id'] as int,
        matiere: Matiere.fromJson(json['matiere'] as Map<String, dynamic>),
        enseignant: Utilisateur.fromJson(
          json['enseignant'] as Map<String, dynamic>,
        ),
      );
}

class PeriodeEvaluation {
  final int id;
  final String libelle;
  final String statut;

  PeriodeEvaluation({
    required this.id,
    required this.libelle,
    required this.statut,
  });

  factory PeriodeEvaluation.fromJson(Map<String, dynamic> json) =>
      PeriodeEvaluation(
        id: json['id'] as int,
        libelle: json['libelle'] as String,
        statut: json['statut'] as String,
      );
}

class Evaluation {
  final int id;
  final String type;
  final String libelle;
  final String dateEvaluation;
  final int periodeId;

  Evaluation({
    required this.id,
    required this.type,
    required this.libelle,
    required this.dateEvaluation,
    required this.periodeId,
  });

  factory Evaluation.fromJson(Map<String, dynamic> json) => Evaluation(
    id: json['id'] as int,
    type: json['type'] as String,
    libelle: json['libelle'] as String,
    // L'API sérialise les champs `date` Laravel en ISO 8601 complet
    // ("2026-11-05T00:00:00.000000Z"), pas au format `date` promis par
    // openapi.yaml — tronqué ici pour un affichage lisible côté mobile
    // plutôt que de propager le correctif à toute l'API (hors scope).
    dateEvaluation: (json['date_evaluation'] as String).split('T').first,
    periodeId: json['periode_id'] as int,
  );
}

/// Un bulletin tel que renvoyé par GET /eleves/{id}/bulletins — la période
/// est imbriquée (voir BulletinController::pourEleve, ->with('periode')).
class BulletinEleve {
  final int id;
  final String periodeLibelle;
  final num? moyenneGenerale;
  final int? rang;
  final int? effectifClasse;
  final String statut;

  BulletinEleve({
    required this.id,
    required this.periodeLibelle,
    this.moyenneGenerale,
    this.rang,
    this.effectifClasse,
    required this.statut,
  });

  factory BulletinEleve.fromJson(Map<String, dynamic> json) => BulletinEleve(
    id: json['id'] as int,
    periodeLibelle:
        (json['periode'] as Map<String, dynamic>?)?['libelle'] as String? ??
        '—',
    // Même piège decimal:2 → chaîne que Note.valeur (voir plus bas).
    moyenneGenerale: switch (json['moyenne_generale']) {
      null => null,
      final num v => v,
      final String s => num.tryParse(s),
      _ => null,
    },
    rang: json['rang'] as int?,
    effectifClasse: json['effectif_classe'] as int?,
    statut: json['statut'] as String,
  );
}

/// Une présence telle que renvoyée par GET /eleves/{id}/presences.
class PresenceEleve {
  final int id;
  final String date;
  final StatutPresence statut;

  PresenceEleve({required this.id, required this.date, required this.statut});

  factory PresenceEleve.fromJson(Map<String, dynamic> json) => PresenceEleve(
    id: json['id'] as int,
    // Même écart de contrat que Evaluation.dateEvaluation (voir plus haut) :
    // l'API sérialise en ISO 8601 complet, pas au format `date`.
    date: (json['date'] as String).split('T').first,
    statut: StatutPresenceJson.depuisApi(json['statut'] as String),
  );
}

class Note {
  final int eleveId;
  final num? valeur;

  Note({required this.eleveId, this.valeur});

  factory Note.fromJson(Map<String, dynamic> json) => Note(
    eleveId: json['eleve_id'] as int,
    // Le cast Eloquent `decimal:2` sérialise en chaîne ("15.50"), pas en
    // nombre JSON — vérifié en rejouant l'écran contre l'API réelle
    // (`json['valeur'] as num?` levait une exception au premier
    // chargement d'une note déjà saisie). NoteEcriture (écriture) reste
    // un vrai nombre côté client, seule la lecture doit composer avec ça.
    valeur: switch (json['valeur']) {
      null => null,
      final num v => v,
      final String s => num.tryParse(s),
      _ => null,
    },
  );
}

/// Un créneau tel que renvoyé par GET /classes/{id}/emploi-du-temps —
/// matiere/enseignant imbriqués (voir EmploiDuTempsController::index) :
/// l'app mobile n'a pas accès à la liste des utilisateurs (réservée à
/// l'administration) pour résoudre enseignant_id elle-même.
class Creneau {
  final int id;
  final int jourSemaine; // 1 (lundi) à 7 (dimanche)
  final String heureDebut;
  final String heureFin;
  final String? salle;
  final String matiereNom;
  final String enseignantNom;
  final String enseignantPrenom;

  Creneau({
    required this.id,
    required this.jourSemaine,
    required this.heureDebut,
    required this.heureFin,
    this.salle,
    required this.matiereNom,
    required this.enseignantNom,
    required this.enseignantPrenom,
  });

  factory Creneau.fromJson(Map<String, dynamic> json) => Creneau(
    id: json['id'] as int,
    jourSemaine: json['jour_semaine'] as int,
    // Le cast Postgres `time` sérialise avec les secondes ("08:00:00"),
    // pas au format "HH:MM" que promet l'exemple d'openapi.yaml — déjà
    // contourné côté web (EmploiDuTempsPage.tsx, .slice(0, 5)) avec le
    // même correctif ; vérifié en HTTP réel avant d'écrire cet écran,
    // pas découvert après coup.
    heureDebut: (json['heure_debut'] as String).substring(0, 5),
    heureFin: (json['heure_fin'] as String).substring(0, 5),
    salle: json['salle'] as String?,
    matiereNom:
        (json['matiere'] as Map<String, dynamic>?)?['nom'] as String? ?? '—',
    enseignantNom:
        (json['enseignant'] as Map<String, dynamic>?)?['nom'] as String? ?? '',
    enseignantPrenom:
        (json['enseignant'] as Map<String, dynamic>?)?['prenom'] as String? ??
        '',
  );
}

/// Une annonce telle que renvoyée par GET /etablissements/{id}/annonces.
class Annonce {
  final int id;
  final String titre;
  final String contenu;
  final String cibleType; // 'etablissement' | 'classe'
  final int? cibleId;
  final String publieeLe;

  Annonce({
    required this.id,
    required this.titre,
    required this.contenu,
    required this.cibleType,
    this.cibleId,
    required this.publieeLe,
  });

  factory Annonce.fromJson(Map<String, dynamic> json) => Annonce(
    id: json['id'] as int,
    titre: json['titre'] as String,
    contenu: json['contenu'] as String,
    cibleType: json['cible_type'] as String,
    cibleId: json['cible_id'] as int?,
    publieeLe: (json['publiee_le'] as String).split('T').first,
  );
}
