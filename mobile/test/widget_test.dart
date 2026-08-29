import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';

import 'package:mobile/api/api_client.dart';
import 'package:mobile/auth/auth_service.dart';
import 'package:mobile/screens/login_screen.dart';

/// Ne passe jamais par EcoleGnApp() / AuthService.initialiser() : ça
/// touche le vrai plugin flutter_secure_storage, dont l'appel de canal ne
/// se résout jamais dans l'environnement `flutter test` (aucun binding de
/// plateforme réel) — pumpAndSettle finit par expirer indéfiniment. Isoler
/// l'écran testé de l'initialisation réseau/stockage est la bonne pratique
/// ici, pas un contournement : on teste le rendu du formulaire, pas le
/// plugin.
Widget _enveloppePourTest(Widget enfant) {
  return MultiProvider(
    providers: [
      Provider<ApiClient>(create: (_) => ApiClient()),
      ChangeNotifierProvider<AuthService>(
        create: (context) => AuthService(context.read<ApiClient>()),
      ),
    ],
    child: MaterialApp(home: enfant),
  );
}

void main() {
  testWidgets("L'écran de connexion affiche le formulaire", (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(_enveloppePourTest(const LoginScreen()));

    expect(find.text('Plateforme scolaire'), findsOneWidget);
    expect(find.text('Téléphone'), findsOneWidget);
    expect(find.text('Mot de passe'), findsOneWidget);
  });

  testWidgets('Le formulaire de connexion refuse la soumission vide', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(_enveloppePourTest(const LoginScreen()));

    await tester.tap(find.text('Se connecter'));
    await tester.pump();

    expect(find.text('Champ requis'), findsNWidgets(2));
  });
}
