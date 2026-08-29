import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../api/api_client.dart';
import '../auth/auth_service.dart';
import '../models/models.dart';
import 'notes_screen.dart';

/// Deuxième étape du parcours « saisir des notes » : choisir une
/// évaluation existante ou en créer une nouvelle, avant la saisie des
/// notes élève par élève (NotesScreen).
class EvaluationsScreen extends StatefulWidget {
  final Classe classe;
  final MatiereEnseignee matiere;

  const EvaluationsScreen({
    super.key,
    required this.classe,
    required this.matiere,
  });

  @override
  State<EvaluationsScreen> createState() => _EvaluationsScreenState();
}

class _EvaluationsScreenState extends State<EvaluationsScreen> {
  late Future<List<Evaluation>> _evaluations;

  @override
  void initState() {
    super.initState();
    _evaluations = _charger();
  }

  Future<List<Evaluation>> _charger() async {
    final api = context.read<ApiClient>();
    final donnees = await api.getList(
      '/classes/${widget.classe.id}/matieres/${widget.matiere.matiereId}/evaluations',
    );
    return donnees
        .map((d) => Evaluation.fromJson(d as Map<String, dynamic>))
        .toList()
      // La plus récente en premier — c'est celle qu'on vient de créer ou
      // celle qu'on est le plus susceptible de vouloir noter.
      ..sort((a, b) => b.dateEvaluation.compareTo(a.dateEvaluation));
  }

  Future<void> _creerEvaluation() async {
    final api = context.read<ApiClient>();
    final auth = context.read<AuthService>();

    final periodes = await api.getList(
      '/etablissements/${auth.etablissementCourantId}/periodes',
    );
    final periodesEnCours = periodes
        .map((d) => PeriodeEvaluation.fromJson(d as Map<String, dynamic>))
        .where((p) => p.statut == 'en_cours')
        .toList();

    if (!mounted) return;
    if (periodesEnCours.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text(
            "Aucune période d'évaluation en cours — impossible de créer une évaluation.",
          ),
        ),
      );
      return;
    }

    final cree = await showDialog<bool>(
      context: context,
      builder: (_) => _DialogueNouvelleEvaluation(
        classe: widget.classe,
        matiere: widget.matiere,
        periodes: periodesEnCours,
      ),
    );

    if (cree == true) {
      setState(() => _evaluations = _charger());
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('${widget.matiere.matiere.nom} — ${widget.classe.libelle}'),
      ),
      body: FutureBuilder<List<Evaluation>>(
        future: _evaluations,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return Center(
              child: Text(
                snapshot.error is ApiException
                    ? (snapshot.error as ApiException).message
                    : 'Impossible de charger les évaluations.',
              ),
            );
          }

          final evaluations = snapshot.data ?? [];
          if (evaluations.isEmpty) {
            return const Center(
              child: Text(
                "Aucune évaluation pour l'instant — créez-en une avec le bouton +.",
                textAlign: TextAlign.center,
              ),
            );
          }

          return ListView.separated(
            padding: const EdgeInsets.all(12),
            itemCount: evaluations.length,
            separatorBuilder: (_, _) => const SizedBox(height: 8),
            itemBuilder: (context, i) {
              final e = evaluations[i];
              return Card(
                child: ListTile(
                  title: Text(e.libelle),
                  subtitle: Text(
                    '${_libelleType(e.type)} — ${e.dateEvaluation}',
                  ),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () => Navigator.of(context).push(
                    MaterialPageRoute(
                      builder: (_) =>
                          NotesScreen(classe: widget.classe, evaluation: e),
                    ),
                  ),
                ),
              );
            },
          );
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _creerEvaluation,
        child: const Icon(Icons.add),
      ),
    );
  }

  String _libelleType(String type) => switch (type) {
    'devoir' => 'Devoir',
    'composition' => 'Composition',
    'interrogation' => 'Interrogation',
    _ => type,
  };
}

class _DialogueNouvelleEvaluation extends StatefulWidget {
  final Classe classe;
  final MatiereEnseignee matiere;
  final List<PeriodeEvaluation> periodes;

  const _DialogueNouvelleEvaluation({
    required this.classe,
    required this.matiere,
    required this.periodes,
  });

  @override
  State<_DialogueNouvelleEvaluation> createState() =>
      _DialogueNouvelleEvaluationState();
}

class _DialogueNouvelleEvaluationState
    extends State<_DialogueNouvelleEvaluation> {
  final _formKey = GlobalKey<FormState>();
  final _libelleCtrl = TextEditingController();
  String _type = 'devoir';
  late PeriodeEvaluation _periode;
  DateTime _date = DateTime.now();
  bool _envoiEnCours = false;
  String? _erreur;

  @override
  void initState() {
    super.initState();
    _periode = widget.periodes.first;
  }

  @override
  void dispose() {
    _libelleCtrl.dispose();
    super.dispose();
  }

  Future<void> _valider() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() {
      _envoiEnCours = true;
      _erreur = null;
    });

    try {
      final api = context.read<ApiClient>();
      await api.post<Map<String, dynamic>>(
        '/classes/${widget.classe.id}/matieres/${widget.matiere.matiereId}/evaluations',
        body: {
          'type': _type,
          'libelle': _libelleCtrl.text.trim(),
          'periode_id': _periode.id,
          'date_evaluation': _date.toIso8601String().split('T').first,
        },
      );
      if (mounted) Navigator.of(context).pop(true);
    } on ApiException catch (e) {
      setState(() => _erreur = e.message);
    } catch (_) {
      setState(() => _erreur = 'Création impossible. Vérifiez votre réseau.');
    } finally {
      if (mounted) setState(() => _envoiEnCours = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Nouvelle évaluation'),
      content: Form(
        key: _formKey,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (_erreur != null) ...[
              Text(_erreur!, style: TextStyle(color: Colors.red.shade700)),
              const SizedBox(height: 12),
            ],
            DropdownButtonFormField<String>(
              initialValue: _type,
              decoration: const InputDecoration(labelText: 'Type'),
              items: const [
                DropdownMenuItem(value: 'devoir', child: Text('Devoir')),
                DropdownMenuItem(
                  value: 'composition',
                  child: Text('Composition'),
                ),
                DropdownMenuItem(
                  value: 'interrogation',
                  child: Text('Interrogation'),
                ),
              ],
              onChanged: (v) => setState(() => _type = v!),
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _libelleCtrl,
              decoration: const InputDecoration(labelText: 'Libellé'),
              validator: (v) =>
                  (v == null || v.trim().isEmpty) ? 'Champ requis' : null,
            ),
            const SizedBox(height: 12),
            DropdownButtonFormField<PeriodeEvaluation>(
              initialValue: _periode,
              decoration: const InputDecoration(labelText: 'Période'),
              items: widget.periodes
                  .map(
                    (p) => DropdownMenuItem(value: p, child: Text(p.libelle)),
                  )
                  .toList(),
              onChanged: (v) => setState(() => _periode = v!),
            ),
            const SizedBox(height: 12),
            ListTile(
              contentPadding: EdgeInsets.zero,
              title: const Text('Date'),
              subtitle: Text(_date.toIso8601String().split('T').first),
              trailing: const Icon(Icons.calendar_today),
              onTap: () async {
                final choisie = await showDatePicker(
                  context: context,
                  initialDate: _date,
                  firstDate: DateTime(2020),
                  lastDate: DateTime(2100),
                );
                if (choisie != null) setState(() => _date = choisie);
              },
            ),
          ],
        ),
      ),
      actions: [
        TextButton(
          onPressed: _envoiEnCours
              ? null
              : () => Navigator.of(context).pop(false),
          child: const Text('Annuler'),
        ),
        FilledButton(
          onPressed: _envoiEnCours ? null : _valider,
          child: Text(_envoiEnCours ? 'Création…' : 'Créer'),
        ),
      ],
    );
  }
}
