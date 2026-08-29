import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:uuid/uuid.dart';

import '../api/api_client.dart';
import '../models/models.dart';
import '../offline/ecriture_en_attente.dart';
import '../offline/sync_service.dart';

/// Parcours critique n°2 du MVP (docs/mvp-scope.md) : l'appel d'une classe
/// entière en une requête, y compris hors ligne.
///
/// Écrit TOUJOURS dans la file locale (SyncService) d'abord, jamais en
/// direct vers l'API — c'est ce qui rend le mode hors-ligne réel : la
/// validation de l'appel réussit immédiatement que le réseau soit là ou
/// non, la synchronisation est un souci séparé tenté juste après
/// (architecture-technique.md §04).
class AppelScreen extends StatefulWidget {
  final Classe classe;

  const AppelScreen({super.key, required this.classe});

  @override
  State<AppelScreen> createState() => _AppelScreenState();
}

class _AppelScreenState extends State<AppelScreen> {
  late Future<List<Eleve>> _eleves;
  final Map<int, StatutPresence> _statuts = {};
  bool _envoiEnCours = false;

  @override
  void initState() {
    super.initState();
    _eleves = _charger();
  }

  Future<List<Eleve>> _charger() async {
    final api = context.read<ApiClient>();
    final donnees = await api.getList('/classes/${widget.classe.id}/eleves');
    final eleves = donnees
        .map((d) => Eleve.fromJson(d as Map<String, dynamic>))
        .toList();
    // Par défaut, tout le monde est présent — l'enseignant n'a qu'à
    // corriger les exceptions, pas ressaisir 40 lignes identiques.
    for (final e in eleves) {
      _statuts[e.id] = StatutPresence.present;
    }
    return eleves;
  }

  Future<void> _valider(List<Eleve> eleves) async {
    setState(() => _envoiEnCours = true);

    const uuid = Uuid();
    final aujourdHui = DateTime.now().toIso8601String().split('T').first;

    final ecritures = eleves.map((e) {
      final statut = _statuts[e.id]!;
      return EcritureEnAttente(
        syncUuid: uuid.v4(),
        type: 'presence',
        payload: {
          'classe_id': widget.classe.id,
          'eleve_id': e.id,
          'date': aujourdHui,
          'statut': statut.valeurApi,
        },
        libelle:
            'Appel — ${widget.classe.libelle}, $aujourdHui — ${e.nom} ${e.prenom}',
        creeLe: DateTime.now(),
      );
    }).toList();

    await context.read<SyncService>().enregistrerPlusieurs(ecritures);

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Appel enregistré — synchronisation en cours.'),
        ),
      );
      Navigator.of(context).pop();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Appel — ${widget.classe.libelle}')),
      body: FutureBuilder<List<Eleve>>(
        future: _eleves,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return Center(
              child: Text(
                snapshot.error is ApiException
                    ? (snapshot.error as ApiException).message
                    : 'Impossible de charger les élèves.',
              ),
            );
          }

          final eleves = snapshot.data ?? [];
          if (eleves.isEmpty) {
            return const Center(
              child: Text('Aucun élève inscrit dans cette classe.'),
            );
          }

          return Column(
            children: [
              Expanded(
                child: ListView.separated(
                  itemCount: eleves.length,
                  separatorBuilder: (_, _) => const Divider(height: 1),
                  itemBuilder: (context, i) {
                    final eleve = eleves[i];
                    return ListTile(
                      title: Text('${eleve.nom} ${eleve.prenom}'),
                      subtitle: Text(eleve.matricule),
                      trailing: SegmentedButton<StatutPresence>(
                        segments: const [
                          ButtonSegment(
                            value: StatutPresence.present,
                            label: Text('P'),
                          ),
                          ButtonSegment(
                            value: StatutPresence.retard,
                            label: Text('R'),
                          ),
                          ButtonSegment(
                            value: StatutPresence.absent,
                            label: Text('A'),
                          ),
                        ],
                        selected: {
                          _statuts[eleve.id] ?? StatutPresence.present,
                        },
                        onSelectionChanged: (s) =>
                            setState(() => _statuts[eleve.id] = s.first),
                        showSelectedIcon: false,
                      ),
                    );
                  },
                ),
              ),
              SafeArea(
                minimum: const EdgeInsets.all(12),
                child: SizedBox(
                  width: double.infinity,
                  child: FilledButton(
                    onPressed: _envoiEnCours ? null : () => _valider(eleves),
                    child: Text(
                      _envoiEnCours ? 'Enregistrement…' : "Valider l'appel",
                    ),
                  ),
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}
