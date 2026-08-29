import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../api/api_client.dart';
import '../auth/auth_service.dart';
import '../models/models.dart';
import '../offline/sync_service.dart';
import 'appel_screen.dart';
import 'file_erreurs_screen.dart';
import 'matieres_screen.dart';

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
    return donnees
        .map((d) => Classe.fromJson(d as Map<String, dynamic>))
        .toList();
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthService>();
    final sync = context.watch<SyncService>();

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
        child: Column(
          children: [
            _BandeauSynchronisation(sync: sync),
            Expanded(child: _ListeClasses(classesFuture: _classes)),
          ],
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

/// Affiche l'état de la file locale : c'est ce qui rend le mode hors-ligne
/// visible pour l'enseignant, pas seulement réel en interne — sans lui, un
/// appel « enregistré » sans réseau semble avoir disparu tant qu'il n'a pas
/// synchronisé.
class _BandeauSynchronisation extends StatelessWidget {
  final SyncService sync;

  const _BandeauSynchronisation({required this.sync});

  @override
  Widget build(BuildContext context) {
    if (sync.enAttente == 0 &&
        sync.enErreur == 0 &&
        !sync.synchronisationEnCours) {
      return const SizedBox.shrink();
    }

    final Color couleurFond;
    final Color couleurTexte;
    final String message;

    if (sync.enErreur > 0) {
      couleurFond = Colors.red.shade50;
      couleurTexte = Colors.red.shade700;
      message =
          '${sync.enErreur} écriture(s) rejetée(s) par le serveur — à vérifier.';
    } else if (sync.synchronisationEnCours) {
      couleurFond = Colors.blue.shade50;
      couleurTexte = Colors.blue.shade700;
      message = 'Synchronisation en cours…';
    } else {
      couleurFond = Colors.amber.shade50;
      couleurTexte = Colors.amber.shade900;
      message = '${sync.enAttente} en attente de synchronisation.';
    }

    return Container(
      width: double.infinity,
      color: couleurFond,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      child: Row(
        children: [
          Expanded(
            child: sync.enErreur > 0
                ? InkWell(
                    onTap: () => Navigator.of(context).push(
                      MaterialPageRoute(
                        builder: (_) => const FileErreursScreen(),
                      ),
                    ),
                    child: Text(
                      '$message Voir le détail.',
                      style: TextStyle(
                        color: couleurTexte,
                        decoration: TextDecoration.underline,
                      ),
                    ),
                  )
                : Text(message, style: TextStyle(color: couleurTexte)),
          ),
          if (!sync.synchronisationEnCours)
            TextButton(
              onPressed: () => sync.synchroniser(),
              child: const Text('Réessayer'),
            ),
        ],
      ),
    );
  }
}

class _ListeClasses extends StatelessWidget {
  final Future<List<Classe>> classesFuture;

  const _ListeClasses({required this.classesFuture});

  void _choisirAction(BuildContext context, Classe classe) {
    showModalBottomSheet(
      context: context,
      builder: (contexteFeuille) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: const Icon(Icons.checklist),
              title: const Text("Faire l'appel"),
              onTap: () {
                Navigator.of(contexteFeuille).pop();
                Navigator.of(context).push(
                  MaterialPageRoute(
                    builder: (_) => AppelScreen(classe: classe),
                  ),
                );
              },
            ),
            ListTile(
              leading: const Icon(Icons.grade_outlined),
              title: const Text('Saisir des notes'),
              onTap: () {
                Navigator.of(contexteFeuille).pop();
                Navigator.of(context).push(
                  MaterialPageRoute(
                    builder: (_) => MatieresScreen(classe: classe),
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<List<Classe>>(
      future: classesFuture,
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
                onTap: () => _choisirAction(context, classe),
              ),
            );
          },
        );
      },
    );
  }
}
