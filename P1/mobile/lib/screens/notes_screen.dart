import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:uuid/uuid.dart';

import '../api/api_client.dart';
import '../models/models.dart';
import '../offline/ecriture_en_attente.dart';
import '../offline/sync_service.dart';

/// Parcours critique n°3 du MVP (docs/mvp-scope.md) : saisir les notes de
/// toute une classe pour une évaluation, y compris hors ligne.
///
/// Même discipline que AppelScreen : écrit TOUJOURS dans la file locale
/// (SyncService) d'abord, jamais en direct vers l'API.
class NotesScreen extends StatefulWidget {
  final Classe classe;
  final Evaluation evaluation;

  const NotesScreen({
    super.key,
    required this.classe,
    required this.evaluation,
  });

  @override
  State<NotesScreen> createState() => _NotesScreenState();
}

class _NotesScreenState extends State<NotesScreen> {
  late Future<List<Eleve>> _eleves;
  final Map<int, TextEditingController> _controleurs = {};
  bool _envoiEnCours = false;

  @override
  void initState() {
    super.initState();
    _eleves = _charger();
  }

  @override
  void dispose() {
    for (final c in _controleurs.values) {
      c.dispose();
    }
    super.dispose();
  }

  Future<List<Eleve>> _charger() async {
    final api = context.read<ApiClient>();

    final donneesEleves = await api.getList(
      '/classes/${widget.classe.id}/eleves',
    );
    final eleves = donneesEleves
        .map((d) => Eleve.fromJson(d as Map<String, dynamic>))
        .toList();

    // Les notes déjà saisies pré-remplissent le formulaire — resaisir une
    // note existante est une correction, pas un ajout (Note::updateOrCreate
    // côté API fait déjà ce choix, l'écran doit le refléter).
    final donneesNotes = await api.getList(
      '/evaluations/${widget.evaluation.id}/notes',
    );
    final notesExistantes = {
      for (final n in donneesNotes.map(
        (d) => Note.fromJson(d as Map<String, dynamic>),
      ))
        n.eleveId: n,
    };

    for (final e in eleves) {
      final valeur = notesExistantes[e.id]?.valeur;
      _controleurs[e.id] = TextEditingController(
        text: valeur == null ? '' : valeur.toString(),
      );
    }

    return eleves;
  }

  Future<void> _valider(List<Eleve> eleves) async {
    // Validation cliente avant tout enregistrement : une note hors de
    // 0-20 rejouée hors ligne serait de toute façon rejetée par le
    // serveur (422) — autant prévenir l'enseignant tout de suite plutôt
    // que de la laisser échouer silencieusement pendant la synchronisation.
    final erreurs = <String>[];
    final valeurs = <int, double?>{};
    for (final e in eleves) {
      final texte = _controleurs[e.id]!.text.trim();
      if (texte.isEmpty) {
        valeurs[e.id] = null;
        continue;
      }
      final valeur = double.tryParse(texte.replaceAll(',', '.'));
      if (valeur == null || valeur < 0 || valeur > 20) {
        erreurs.add('${e.nom} ${e.prenom}');
        continue;
      }
      valeurs[e.id] = valeur;
    }

    if (erreurs.isNotEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Note invalide (0 à 20) pour : ${erreurs.join(', ')}.'),
        ),
      );
      return;
    }

    setState(() => _envoiEnCours = true);

    const uuid = Uuid();
    final ecritures = eleves.map((e) {
      return EcritureEnAttente(
        syncUuid: uuid.v4(),
        type: 'note',
        payload: {
          'evaluation_id': widget.evaluation.id,
          'eleve_id': e.id,
          'valeur': valeurs[e.id],
          'appreciation': null,
        },
        libelle:
            'Note — ${widget.evaluation.libelle}, ${widget.classe.libelle} — ${e.nom} ${e.prenom}',
        creeLe: DateTime.now(),
      );
    }).toList();

    await context.read<SyncService>().enregistrerPlusieurs(ecritures);

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Notes enregistrées — synchronisation en cours.'),
        ),
      );
      Navigator.of(context).pop();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(widget.evaluation.libelle)),
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
                    : 'Impossible de charger les élèves ou les notes.',
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
                      trailing: SizedBox(
                        width: 72,
                        child: TextField(
                          controller: _controleurs[eleve.id],
                          textAlign: TextAlign.center,
                          keyboardType: const TextInputType.numberWithOptions(
                            decimal: true,
                          ),
                          inputFormatters: [
                            FilteringTextInputFormatter.allow(
                              RegExp(r'^\d{0,2}([.,]\d{0,2})?$'),
                            ),
                          ],
                          decoration: const InputDecoration(
                            hintText: '/20',
                            isDense: true,
                            border: OutlineInputBorder(),
                          ),
                        ),
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
                      _envoiEnCours
                          ? 'Enregistrement…'
                          : 'Enregistrer les notes',
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
