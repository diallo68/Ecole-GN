import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../offline/ecriture_en_attente.dart';
import '../offline/sync_service.dart';

/// Consultation des écritures rejetées par le serveur — sans cet écran,
/// une écriture en erreur (ex. période clôturée entre-temps) restait en
/// file indéfiniment : "Réessayer" ne fait que rejouer la même
/// synchronisation, qui échoue à nouveau pour la même raison définitive.
class FileErreursScreen extends StatefulWidget {
  const FileErreursScreen({super.key});

  @override
  State<FileErreursScreen> createState() => _FileErreursScreenState();
}

class _FileErreursScreenState extends State<FileErreursScreen> {
  late Future<List<EcritureEnAttente>> _ecritures;

  @override
  void initState() {
    super.initState();
    _ecritures = context.read<SyncService>().ecrituresEnErreur();
  }

  Future<void> _recharger() async {
    setState(
      () => _ecritures = context.read<SyncService>().ecrituresEnErreur(),
    );
  }

  Future<void> _ignorer(EcritureEnAttente ecriture) async {
    final confirme = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Ignorer cette écriture ?'),
        content: Text(
          '« ${ecriture.libelle} » sera définitivement supprimée sans être synchronisée.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: const Text('Annuler'),
          ),
          FilledButton(
            onPressed: () => Navigator.of(context).pop(true),
            child: const Text('Ignorer'),
          ),
        ],
      ),
    );

    if (confirme == true && mounted) {
      await context.read<SyncService>().ignorer(ecriture.syncUuid);
      await _recharger();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Écritures en erreur')),
      body: FutureBuilder<List<EcritureEnAttente>>(
        future: _ecritures,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }

          final ecritures = snapshot.data ?? [];
          if (ecritures.isEmpty) {
            return const Center(child: Text('Aucune écriture en erreur.'));
          }

          return RefreshIndicator(
            onRefresh: _recharger,
            child: ListView.separated(
              itemCount: ecritures.length,
              separatorBuilder: (_, _) => const Divider(height: 1),
              itemBuilder: (context, i) {
                final e = ecritures[i];
                return ListTile(
                  title: Text(e.libelle),
                  subtitle: Text(
                    e.derniereErreur ?? 'Rejetée par le serveur.',
                    style: TextStyle(color: Colors.red.shade700),
                  ),
                  trailing: IconButton(
                    icon: const Icon(Icons.delete_outline),
                    tooltip: 'Ignorer',
                    onPressed: () => _ignorer(e),
                  ),
                );
              },
            ),
          );
        },
      ),
    );
  }
}
