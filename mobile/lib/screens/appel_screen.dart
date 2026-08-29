import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:uuid/uuid.dart';
import '../api/api_client.dart';
import '../models/models.dart';

/// Parcours critique n°2 du MVP (docs/mvp-scope.md) : l'appel d'une classe
/// entière en une requête.
///
/// Chemin EN LIGNE uniquement dans cette première version : la requête part
/// directement vers /classes/{id}/presences/appel. sync_uuid est déjà posé
/// par élève (comme l'exige architecture-technique.md §04) pour que le
/// futur chemin hors-ligne — file d'attente locale + retransmission via
/// /sync/batch — puisse être branché sans changer ce format, mais la file
/// d'attente locale (persistance SQLite quand le réseau est coupé,
/// synchronisation automatique au retour) reste À CONSTRUIRE. Un appel fait
/// sans réseau échoue aujourd'hui plutôt que d'être mis en attente.
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
  String? _erreur;

  @override
  void initState() {
    super.initState();
    _eleves = _charger();
  }

  Future<List<Eleve>> _charger() async {
    final api = context.read<ApiClient>();
    final donnees = await api.getList('/classes/${widget.classe.id}/eleves');
    final eleves = donnees.map((d) => Eleve.fromJson(d as Map<String, dynamic>)).toList();
    // Par défaut, tout le monde est présent — l'enseignant n'a qu'à
    // corriger les exceptions, pas ressaisir 40 lignes identiques.
    for (final e in eleves) {
      _statuts[e.id] = StatutPresence.present;
    }
    return eleves;
  }

  Future<void> _envoyer(List<Eleve> eleves) async {
    setState(() {
      _envoiEnCours = true;
      _erreur = null;
    });

    final api = context.read<ApiClient>();
    const uuid = Uuid();
    final aujourdHui = DateTime.now().toIso8601String().split('T').first;

    try {
      await api.post(
        '/classes/${widget.classe.id}/presences/appel',
        body: {
          'date': aujourdHui,
          'presences': eleves
              .map(
                (e) => {
                  'eleve_id': e.id,
                  'statut': _statuts[e.id]!.valeurApi,
                  'sync_uuid': uuid.v4(),
                },
              )
              .toList(),
        },
      );
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Appel enregistré.')),
        );
        Navigator.of(context).pop();
      }
    } on ApiException catch (e) {
      setState(() => _erreur = e.message);
    } catch (_) {
      setState(() => _erreur = "Échec de l'envoi. Vérifiez votre connexion.");
    } finally {
      if (mounted) setState(() => _envoiEnCours = false);
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
            return const Center(child: Text('Aucun élève inscrit dans cette classe.'));
          }

          return Column(
            children: [
              if (_erreur != null)
                Container(
                  width: double.infinity,
                  color: Colors.red.shade50,
                  padding: const EdgeInsets.all(12),
                  child: Text(_erreur!, style: TextStyle(color: Colors.red.shade700)),
                ),
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
                          ButtonSegment(value: StatutPresence.present, label: Text('P')),
                          ButtonSegment(value: StatutPresence.retard, label: Text('R')),
                          ButtonSegment(value: StatutPresence.absent, label: Text('A')),
                        ],
                        selected: {_statuts[eleve.id] ?? StatutPresence.present},
                        onSelectionChanged: (s) => setState(() => _statuts[eleve.id] = s.first),
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
                    onPressed: _envoiEnCours ? null : () => _envoyer(eleves),
                    child: Text(_envoiEnCours ? 'Envoi…' : "Valider l'appel"),
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
