import 'package:path/path.dart';
import 'package:sqflite/sqflite.dart';

import 'ecriture_en_attente.dart';

/// Table locale des écritures en attente — indépendante du réseau, c'est
/// elle qui rend le mode hors-ligne réel plutôt que déclaratif.
///
/// `factory` est injectable pour les tests : `databaseFactory` par défaut
/// (le vrai plugin sqflite, qui exige un binding de plateforme réel) peut
/// être remplacé par `databaseFactoryFfi` (sqflite_common_ffi) en test, la
/// même leçon que pour flutter_secure_storage — ne pas faire dépendre un
/// test unitaire d'un vrai plugin de plateforme.
class BaseLocale {
  final DatabaseFactory factory;
  final String cheminFichier;
  Database? _db;

  BaseLocale({required this.factory, this.cheminFichier = 'ecole_gn_local.db'});

  Future<Database> _ouvrir() async {
    if (_db != null) return _db!;

    // `factory.getDatabasesPath()`, pas la fonction globale
    // `getDatabasesPath()` : celle-ci lit la variable globale
    // `databaseFactory`, pas la factory injectée — l'injection pour les
    // tests (sqflite_common_ffi) ne servait à rien tant que ce point
    // passait par le chemin global. `:memory:` (inMemoryDatabasePath) se
    // passe entièrement de chemin sur disque, donc de ce join.
    final chemin = cheminFichier == inMemoryDatabasePath
        ? cheminFichier
        : join(await factory.getDatabasesPath(), cheminFichier);

    _db = await factory.openDatabase(
      chemin,
      options: OpenDatabaseOptions(
        version: 1,
        onCreate: (db, version) => db.execute('''
          CREATE TABLE ecritures_en_attente (
            sync_uuid TEXT PRIMARY KEY,
            type TEXT NOT NULL,
            payload TEXT NOT NULL,
            libelle TEXT NOT NULL,
            cree_le TEXT NOT NULL,
            statut TEXT NOT NULL DEFAULT 'en_attente',
            derniere_erreur TEXT
          )
        '''),
      ),
    );
    return _db!;
  }

  Future<void> ajouter(EcritureEnAttente ecriture) async {
    final db = await _ouvrir();
    await db.insert(
      'ecritures_en_attente',
      ecriture.versLigneSql(),
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
  }

  Future<List<EcritureEnAttente>> lister() async {
    final db = await _ouvrir();
    final lignes = await db.query(
      'ecritures_en_attente',
      orderBy: 'cree_le ASC',
    );
    return lignes.map(EcritureEnAttente.depuisLigneSql).toList();
  }

  Future<int> compter() async {
    final db = await _ouvrir();
    final resultat = await db.rawQuery(
      'SELECT COUNT(*) as n FROM ecritures_en_attente',
    );
    return Sqflite.firstIntValue(resultat) ?? 0;
  }

  Future<void> supprimer(String syncUuid) async {
    final db = await _ouvrir();
    await db.delete(
      'ecritures_en_attente',
      where: 'sync_uuid = ?',
      whereArgs: [syncUuid],
    );
  }

  Future<void> marquerEnErreur(String syncUuid, String message) async {
    final db = await _ouvrir();
    await db.update(
      'ecritures_en_attente',
      {'statut': 'erreur', 'derniere_erreur': message},
      where: 'sync_uuid = ?',
      whereArgs: [syncUuid],
    );
  }

  Future<void> fermer() async {
    await _db?.close();
    _db = null;
  }
}
