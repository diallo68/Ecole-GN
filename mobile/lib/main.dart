import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:sqflite/sqflite.dart';

import 'api/api_client.dart';
import 'auth/auth_service.dart';
import 'offline/base_locale.dart';
import 'offline/sync_service.dart';
import 'screens/login_screen.dart';
import 'screens/mes_classes_screen.dart';
import 'screens/mes_enfants_screen.dart';

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
          create: (context) =>
              AuthService(context.read<ApiClient>())..initialiser(),
        ),
        ChangeNotifierProvider<SyncService>(
          create: (context) => SyncService(
            context.read<ApiClient>(),
            BaseLocale(factory: databaseFactory),
          ),
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

    if (auth.utilisateur == null) {
      return const LoginScreen();
    }

    // L'app mobile est pensée enseignant/parent (voir
    // architecture-technique.md §02) — un compte direction/personnel
    // administratif est censé utiliser le web, pas cet écran d'accueil.
    return switch (auth.roleCourant) {
      'parent' => const MesEnfantsScreen(),
      'enseignant' => const MesClassesScreen(),
      _ => Scaffold(
        appBar: AppBar(
          title: const Text('Plateforme scolaire'),
          actions: [
            IconButton(
              icon: const Icon(Icons.logout),
              onPressed: () => auth.deconnecter(),
            ),
          ],
        ),
        body: const Center(
          child: Padding(
            padding: EdgeInsets.all(24),
            child: Text(
              "Ce compte n'a pas d'écran mobile dédié (direction/personnel "
              'administratif) — utilisez le portail web.',
              textAlign: TextAlign.center,
            ),
          ),
        ),
      ),
    };
  }
}
