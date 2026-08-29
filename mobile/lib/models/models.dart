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

  Rattachement({required this.id, required this.role, required this.etablissement});

  factory Rattachement.fromJson(Map<String, dynamic> json) => Rattachement(
    id: json['id'] as int,
    role: json['role'] as String,
    etablissement: Etablissement.fromJson(json['etablissement'] as Map<String, dynamic>),
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

  Eleve({required this.id, required this.matricule, required this.nom, required this.prenom});

  factory Eleve.fromJson(Map<String, dynamic> json) => Eleve(
    id: json['id'] as int,
    matricule: json['matricule'] as String,
    nom: json['nom'] as String,
    prenom: json['prenom'] as String,
  );
}

enum StatutPresence { present, absent, retard, excuse }

extension StatutPresenceJson on StatutPresence {
  String get valeurApi => name;

  static StatutPresence depuisApi(String v) =>
      StatutPresence.values.firstWhere((s) => s.name == v);
}
