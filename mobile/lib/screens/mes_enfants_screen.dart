import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../api/api_client.dart';
import '../auth/auth_service.dart';
import '../models/models.dart';
import 'annonces_screen.dart';
import 'enfant_detail_screen.dart';

/// Écran d'accueil pour un compte parent — pendant de MesClassesScreen côté
/// enseignant. Manquait jusqu'ici : mvp-scope.md déclarait le rôle parent
/// « ✅ Oui, mobile » alors qu'aucun écran mobile ne lui était dédié.
class MesEnfantsScreen extends StatefulWidget {
  const MesEnfantsScreen({super.key});

  @override
  State<MesEnfantsScreen> createState() => _MesEnfantsScreenState();
}

class _MesEnfantsScreenState extends State<MesEnfantsScreen> {
  late Future<List<Eleve>> _enfants;

  @override
  void initState() {
    super.initState();
    _enfants = _charger();
  }

  Future<List<Eleve>> _charger() async {
    final api = context.read<ApiClient>();
    final donnees = await api.getList('/mes-enfants');
    return donnees
        .map((d) => Eleve.fromJson(d as Map<String, dynamic>))
        .toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Mes enfants'),
        actions: [
          IconButton(
            icon: const Icon(Icons.campaign_outlined),
            tooltip: 'Annonces',
            onPressed: () async {
              final enfants = await _enfants;
              if (!context.mounted) return;
              final classeIds = enfants
                  .map((e) => e.classe?.id)
                  .whereType<int>()
                  .toSet();
              Navigator.of(context).push(
                MaterialPageRoute(
                  builder: (_) => AnnoncesScreen(mesClasseIds: classeIds),
                ),
              );
            },
          ),
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () => context.read<AuthService>().deconnecter(),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async => setState(() => _enfants = _charger()),
        child: FutureBuilder<List<Eleve>>(
          future: _enfants,
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.waiting) {
              return const Center(child: CircularProgressIndicator());
            }
            if (snapshot.hasError) {
              return ListView(
                children: [
                  const SizedBox(height: 80),
                  Center(
                    child: Text(
                      snapshot.error is ApiException
                          ? (snapshot.error as ApiException).message
                          : 'Impossible de charger vos enfants.',
                    ),
                  ),
                ],
              );
            }

            final enfants = snapshot.data ?? [];
            if (enfants.isEmpty) {
              return ListView(
                children: const [
                  SizedBox(height: 80),
                  Center(
                    child: Text(
                      "Aucun enfant lié à ce compte pour l'établissement sélectionné.",
                      textAlign: TextAlign.center,
                    ),
                  ),
                ],
              );
            }

            return ListView.separated(
              padding: const EdgeInsets.all(12),
              itemCount: enfants.length,
              separatorBuilder: (_, _) => const SizedBox(height: 8),
              itemBuilder: (context, i) {
                final eleve = enfants[i];
                return Card(
                  child: ListTile(
                    title: Text('${eleve.nom} ${eleve.prenom}'),
                    subtitle: Text(eleve.matricule),
                    trailing: const Icon(Icons.chevron_right),
                    onTap: () => Navigator.of(context).push(
                      MaterialPageRoute(
                        builder: (_) => EnfantDetailScreen(eleve: eleve),
                      ),
                    ),
                  ),
                );
              },
            );
          },
        ),
      ),
    );
  }
}
