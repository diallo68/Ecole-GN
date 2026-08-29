import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'api/api_client.dart';
import 'auth/auth_service.dart';
import 'screens/login_screen.dart';
import 'screens/mes_classes_screen.dart';

void main() {
  runApp(const EcoleGnApp());
}

class EcoleGnApp extends StatelessWidget {
  const EcoleGnApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        Provider<ApiClient>(create: (_) => ApiClient()),
        ChangeNotifierProvider<AuthService>(
          create: (context) => AuthService(context.read<ApiClient>())..initialiser(),
        ),
      ],
      child: MaterialApp(
        title: 'Plateforme scolaire',
        theme: ThemeData(colorSchemeSeed: Colors.blue, useMaterial3: true),
        home: const _Racine(),
      ),
    );
  }
}

class _Racine extends StatelessWidget {
  const _Racine();

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthService>();

    if (auth.chargement) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    return auth.utilisateur == null ? const LoginScreen() : const MesClassesScreen();
  }
}
