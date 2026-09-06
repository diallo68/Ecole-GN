import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/offline/sync_service.dart';

void main() {
  group('interpreterResultats', () {
    test(
      'applique et deja_applique sortent de la file, rejete y reste en erreur',
      () {
        final resultats = [
          {'sync_uuid': 'a', 'statut': 'applique', 'erreur': null},
          {'sync_uuid': 'b', 'statut': 'deja_applique', 'erreur': null},
          {'sync_uuid': 'c', 'statut': 'rejete', 'erreur': 'Période clôturée.'},
        ];

        final resultat = interpreterResultats(resultats);

        expect(resultat.aSupprimer, containsAll(['a', 'b']));
        expect(resultat.aSupprimer, hasLength(2));
        expect(resultat.enErreur, {'c': 'Période clôturée.'});
      },
    );

    test('un lot entièrement rejeté ne supprime rien', () {
      final resultats = [
        {
          'sync_uuid': 'x',
          'statut': 'rejete',
          'erreur': 'Non autorisé pour cette classe.',
        },
      ];

      final resultat = interpreterResultats(resultats);

      expect(resultat.aSupprimer, isEmpty);
      expect(resultat.enErreur, {'x': 'Non autorisé pour cette classe.'});
    });

    test(
      'un message manquant retombe sur un texte par défaut, jamais null',
      () {
        final resultats = [
          {'sync_uuid': 'y', 'statut': 'rejete', 'erreur': null},
        ];

        final resultat = interpreterResultats(resultats);

        expect(resultat.enErreur['y'], isNotNull);
        expect(resultat.enErreur['y'], isNotEmpty);
      },
    );

    test('un lot vide ne produit ni suppression ni erreur', () {
      final resultat = interpreterResultats([]);

      expect(resultat.aSupprimer, isEmpty);
      expect(resultat.enErreur, isEmpty);
    });
  });
}
