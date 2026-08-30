import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/api/api_client.dart';
import 'package:mobile/auth/auth_service.dart';
import 'package:mobile/models/models.dart';

void main() {
  group('AuthService.roleCourant', () {
    // Construire AuthService(ApiClient()) est sûr ici : le champ
    // flutter_secure_storage de ApiClient n'est touché qu'au premier
    // appel réseau/stockage, jamais à la construction — contrairement à
    // AuthService.initialiser() (voir widget_test.dart), qu'on continue
    // d'éviter en test.
    test('renvoie le rôle du rattachement à l\'établissement courant', () {
      final auth = AuthService(ApiClient());
      auth.rattachements = [
        Rattachement(
          id: 1,
          role: 'enseignant',
          etablissement: Etablissement(id: 10, nom: 'École A'),
        ),
        Rattachement(
          id: 2,
          role: 'parent',
          etablissement: Etablissement(id: 20, nom: 'École B'),
        ),
      ];

      auth.etablissementCourantId = 20;
      expect(auth.roleCourant, 'parent');

      auth.etablissementCourantId = 10;
      expect(auth.roleCourant, 'enseignant');
    });

    test('renvoie null sans établissement sélectionné', () {
      final auth = AuthService(ApiClient());
      auth.rattachements = [
        Rattachement(
          id: 1,
          role: 'enseignant',
          etablissement: Etablissement(id: 10, nom: 'École A'),
        ),
      ];
      auth.etablissementCourantId = null;

      expect(auth.roleCourant, isNull);
    });
  });
}
