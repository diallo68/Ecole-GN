import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../api/api_client.dart';
import '../auth/auth_service.dart';
import '../models/models.dart';
import 'appel_screen.dart';

class MesClassesScreen extends StatefulWidget {
  const MesClassesScreen({super.key});

  @override
  State<MesClassesScreen> createState() => _MesClassesScreenState();
}

class _MesClassesScreenState extends State<MesClassesScreen> {
  late Future<List<Classe>> _classes;

  @override
  void initState() {
    super.initState();
    _classes = _charger();
  }

  Future<List<Classe>> _charger() async {
    final auth = context.read<AuthService>();
    final api = context.read<ApiClient>();
    final etablissementId = auth.etablissementCourantId;
    final utilisateurId = auth.utilisateur!.id;

    final donnees = await api.getList(
      '/etablissements/$etablissementId/classes?enseignant_id=$utilisateurId',
    );
    return donnees.map((d) => Classe.fromJson(d as Map<String, dynamic>)).toList();
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthService>();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Mes classes'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () => context.read<AuthService>().deconnecter(),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async => setState(() => _classes = _charger()),
        child: FutureBuilder<List<Classe>>(
          future: _classes,
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.waiting) {
              return const Center(child: CircularProgressIndicator());
            }
            if (snapshot.hasError) {
              final message = snapshot.error is ApiException
                  ? (snapshot.error as ApiException).message
                  : 'Impossible de charger vos classes.';
              return ListView(
                children: [
                  const SizedBox(height: 80),
                  Icon(Icons.error_outline, color: Colors.red.shade400, size: 40),
                  const SizedBox(height: 8),
                  Center(child: Text(message, textAlign: TextAlign.center)),
                ],
              );
            }

            final classes = snapshot.data ?? [];
            if (classes.isEmpty) {
              return ListView(
                children: const [
                  SizedBox(height: 80),
                  Center(child: Text('Aucune classe ne vous est affectée.')),
                ],
              );
            }

            return ListView.separated(
              padding: const EdgeInsets.all(12),
              itemCount: classes.length,
              separatorBuilder: (_, _) => const SizedBox(height: 8),
              itemBuilder: (context, i) {
                final classe = classes[i];
                return Card(
                  child: ListTile(
                    title: Text(classe.libelle),
                    subtitle: Text(classe.niveau),
                    trailing: const Icon(Icons.chevron_right),
                    onTap: () => Navigator.of(context).push(
                      MaterialPageRoute(builder: (_) => AppelScreen(classe: classe)),
                    ),
                  ),
                );
              },
            );
          },
        ),
      ),
      bottomNavigationBar: auth.etablissementCourantId == null
          ? const SafeArea(
              child: Padding(
                padding: EdgeInsets.all(12),
                child: Text(
                  "Aucun établissement sélectionné.",
                  textAlign: TextAlign.center,
                ),
              ),
            )
          : null,
    );
  }
}
