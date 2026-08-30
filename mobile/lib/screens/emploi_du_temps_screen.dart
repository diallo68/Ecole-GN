import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../api/api_client.dart';
import '../models/models.dart';

const _joursSemaine = [
  '', // jour_semaine est 1-indexé (1 = lundi)
  'Lundi',
  'Mardi',
  'Mercredi',
  'Jeudi',
  'Vendredi',
  'Samedi',
  'Dimanche',
];

/// Consultation lecture seule — accessible à l'enseignant (depuis Mes
/// classes) et au parent (depuis Détail enfant). Manquait jusqu'ici :
/// l'écran web existait, mais rien côté mobile alors que l'API l'autorise
/// déjà à enseignant et parent (docs/api-contract.md).
class EmploiDuTempsScreen extends StatefulWidget {
  final int classeId;
  final String titre;

  const EmploiDuTempsScreen({
    super.key,
    required this.classeId,
    required this.titre,
  });

  @override
  State<EmploiDuTempsScreen> createState() => _EmploiDuTempsScreenState();
}

class _EmploiDuTempsScreenState extends State<EmploiDuTempsScreen> {
  late Future<List<Creneau>> _creneaux;

  @override
  void initState() {
    super.initState();
    _creneaux = _charger();
  }

  Future<List<Creneau>> _charger() async {
    final api = context.read<ApiClient>();
    final donnees = await api.getList(
      '/classes/${widget.classeId}/emploi-du-temps',
    );
    return donnees
        .map((d) => Creneau.fromJson(d as Map<String, dynamic>))
        .toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Emploi du temps — ${widget.titre}')),
      body: FutureBuilder<List<Creneau>>(
        future: _creneaux,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return const Center(
              child: Text("Impossible de charger l'emploi du temps."),
            );
          }

          final creneaux = snapshot.data ?? [];
          if (creneaux.isEmpty) {
            return const Center(
              child: Text('Aucun créneau programmé pour le moment.'),
            );
          }

          // Groupés par jour, dans l'ordre de la semaine — l'API trie déjà
          // par jour_semaine puis heure_debut, il suffit de regrouper.
          final parJour = <int, List<Creneau>>{};
          for (final c in creneaux) {
            parJour.putIfAbsent(c.jourSemaine, () => []).add(c);
          }

          return ListView(
            padding: const EdgeInsets.all(12),
            children: parJour.entries.map((entree) {
              return Padding(
                padding: const EdgeInsets.only(bottom: 16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Padding(
                      padding: const EdgeInsets.symmetric(vertical: 6),
                      child: Text(
                        _joursSemaine[entree.key],
                        style: Theme.of(context).textTheme.titleMedium
                            ?.copyWith(fontWeight: FontWeight.bold),
                      ),
                    ),
                    ...entree.value.map(
                      (c) => Card(
                        margin: const EdgeInsets.only(bottom: 6),
                        child: ListTile(
                          title: Text(c.matiereNom),
                          subtitle: Text(
                            '${c.enseignantPrenom} ${c.enseignantNom}'
                            '${c.salle != null ? ' — Salle ${c.salle}' : ''}',
                          ),
                          trailing: Text('${c.heureDebut}\n${c.heureFin}'),
                          isThreeLine: false,
                        ),
                      ),
                    ),
                  ],
                ),
              );
            }).toList(),
          );
        },
      ),
    );
  }
}
