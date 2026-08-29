import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../api/api_client.dart';
import '../auth/auth_service.dart';
import '../models/models.dart';
import 'evaluations_screen.dart';

/// Première étape du parcours « saisir des notes » (docs/mvp-scope.md,
/// parcours critique n°3) : choisir la matière dans la classe, avant de
/// choisir ou créer l'évaluation à noter.
class MatieresScreen extends StatefulWidget {
  final Classe classe;

  const MatieresScreen({super.key, required this.classe});

  @override
  State<MatieresScreen> createState() => _MatieresScreenState();
}

class _MatieresScreenState extends State<MatieresScreen> {
  late Future<List<MatiereEnseignee>> _matieres;

  @override
  void initState() {
    super.initState();
    _matieres = _charger();
  }

  Future<List<MatiereEnseignee>> _charger() async {
    final auth = context.read<AuthService>();
    final api = context.read<ApiClient>();
    final donnees = await api.getList('/classes/${widget.classe.id}/matieres');
    final toutes = donnees
        .map((d) => MatiereEnseignee.fromJson(d as Map<String, dynamic>))
        .toList();

    // Un admin voit toutes les matières de la classe (utile pour dépanner
    // un enseignant absent) ; un enseignant ne voit que les siennes — pas
    // de saisie de notes pour une matière qu'il n'enseigne pas.
    final estAdmin = auth.utilisateur!.estSuperAdmin;
    if (estAdmin) return toutes;
    return toutes.where((m) => m.enseignantId == auth.utilisateur!.id).toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Notes — ${widget.classe.libelle}')),
      body: FutureBuilder<List<MatiereEnseignee>>(
        future: _matieres,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return Center(
              child: Text(
                snapshot.error is ApiException
                    ? (snapshot.error as ApiException).message
                    : 'Impossible de charger les matières.',
              ),
            );
          }

          final matieres = snapshot.data ?? [];
          if (matieres.isEmpty) {
            return const Center(
              child: Text(
                'Aucune matière ne vous est affectée dans cette classe.',
              ),
            );
          }

          return ListView.separated(
            padding: const EdgeInsets.all(12),
            itemCount: matieres.length,
            separatorBuilder: (_, _) => const SizedBox(height: 8),
            itemBuilder: (context, i) {
              final m = matieres[i];
              return Card(
                child: ListTile(
                  title: Text(m.matiere.nom),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () => Navigator.of(context).push(
                    MaterialPageRoute(
                      builder: (_) =>
                          EvaluationsScreen(classe: widget.classe, matiere: m),
                    ),
                  ),
                ),
              );
            },
          );
        },
      ),
    );
  }
}
