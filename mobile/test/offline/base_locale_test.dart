import 'package:flutter_test/flutter_test.dart';
import 'package:sqflite_common_ffi/sqflite_ffi.dart';
import 'package:mobile/offline/base_locale.dart';
import 'package:mobile/offline/ecriture_en_attente.dart';

void main() {
  // sqflite_common_ffi plutôt que le vrai plugin sqflite : la même leçon
  // que pour flutter_secure_storage (voir widget_test.dart) — un test
  // unitaire ne doit pas dépendre d'un binding de plateforme réel.
  setUpAll(() {
    sqfliteFfiInit();
  });

  late BaseLocale base;

  setUp(() {
    base = BaseLocale(
      factory: databaseFactoryFfi,
      cheminFichier: inMemoryDatabasePath,
    );
  });

  tearDown(() async {
    await base.fermer();
  });

  test('une écriture ajoutée est listée puis comptée', () async {
    await base.ajouter(
      EcritureEnAttente(
        syncUuid: 'uuid-1',
        type: 'presence',
        payload: {
          'classe_id': 1,
          'eleve_id': 2,
          'date': '2026-11-05',
          'statut': 'present',
        },
        libelle: 'Appel — CM2 A',
        creeLe: DateTime(2026, 11, 5, 8),
      ),
    );

    final lignes = await base.lister();
    expect(lignes, hasLength(1));
    expect(lignes.first.syncUuid, 'uuid-1');
    // Le payload JSON doit survivre l'aller-retour sans perte de type.
    expect(lignes.first.payload['eleve_id'], 2);
    expect(await base.compter(), 1);
  });

  test('supprimer retire bien la ligne par sync_uuid', () async {
    await base.ajouter(_ecritureTest('uuid-a'));
    await base.ajouter(_ecritureTest('uuid-b'));

    await base.supprimer('uuid-a');

    final lignes = await base.lister();
    expect(lignes.map((e) => e.syncUuid), ['uuid-b']);
  });

  test('marquerEnErreur change le statut sans supprimer la ligne', () async {
    await base.ajouter(_ecritureTest('uuid-c'));

    await base.marquerEnErreur('uuid-c', 'Période clôturée.');

    final lignes = await base.lister();
    expect(lignes, hasLength(1));
    expect(lignes.first.statut, 'erreur');
    expect(lignes.first.derniereErreur, 'Période clôturée.');
  });

  test(
    'ajouter deux fois le même sync_uuid remplace la ligne, ne duplique pas',
    () async {
      await base.ajouter(_ecritureTest('uuid-d', statut: 'en_attente'));
      await base.ajouter(_ecritureTest('uuid-d', statut: 'en_attente'));

      expect(await base.compter(), 1);
    },
  );
}

EcritureEnAttente _ecritureTest(String uuid, {String statut = 'en_attente'}) =>
    EcritureEnAttente(
      syncUuid: uuid,
      type: 'presence',
      payload: {
        'classe_id': 1,
        'eleve_id': 1,
        'date': '2026-11-05',
        'statut': 'present',
      },
      libelle: 'Test',
      creeLe: DateTime(2026, 11, 5),
      statut: statut,
    );
