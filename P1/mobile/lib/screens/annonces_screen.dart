import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../api/api_client.dart';
import '../auth/auth_service.dart';
import '../models/models.dart';

/// Manquait jusqu'ici côté mobile : AnnoncesPage existe côté web, mais un
/// parent — qui n'a normalement pas accès au web, back-office direction —
/// n'avait aucun moyen de lire une annonce (cahier des charges §4.7).
///
/// [mesClasseIds] restreint l'affichage aux annonces destinées à
/// l'établissement entier ou à une des classes listées (les classes de
/// l'enseignant, ou les classes des enfants d'un parent) — sans ce filtre,
/// un parent verrait aussi les annonces d'une classe qui n'est pas celle
/// de son enfant. `null` ou vide : affiche uniquement les annonces
/// établissement (aucune classe connue à filtrer).
class AnnoncesScreen extends StatefulWidget {
  final Set<int> mesClasseIds;

  const AnnoncesScreen({super.key, this.mesClasseIds = const {}});

  @override
  State<AnnoncesScreen> createState() => _AnnoncesScreenState();
}

class _AnnoncesScreenState extends State<AnnoncesScreen> {
  late Future<List<Annonce>> _annonces;

  @override
  void initState() {
    super.initState();
    _annonces = _charger();
  }

  Future<List<Annonce>> _charger() async {
    final auth = context.read<AuthService>();
    final api = context.read<ApiClient>();
    final donnees = await api.getList(
      '/etablissements/${auth.etablissementCourantId}/annonces',
    );
    final toutes = donnees
        .map((d) => Annonce.fromJson(d as Map<String, dynamic>))
        .toList();

    return toutes
        .where(
          (a) =>
              a.cibleType == 'etablissement' ||
              widget.mesClasseIds.contains(a.cibleId),
        )
        .toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Annonces')),
      body: FutureBuilder<List<Annonce>>(
        future: _annonces,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return const Center(
              child: Text('Impossible de charger les annonces.'),
            );
          }

          final annonces = snapshot.data ?? [];
          if (annonces.isEmpty) {
            return const Center(child: Text('Aucune annonce pour le moment.'));
          }

          return ListView.separated(
            padding: const EdgeInsets.all(12),
            itemCount: annonces.length,
            separatorBuilder: (_, _) => const SizedBox(height: 8),
            itemBuilder: (context, i) {
              final a = annonces[i];
              return Card(
                child: Padding(
                  padding: const EdgeInsets.all(12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: Text(
                              a.titre,
                              style: const TextStyle(
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                          Text(
                            a.publieeLe,
                            style: Theme.of(context).textTheme.bodySmall,
                          ),
                        ],
                      ),
                      const SizedBox(height: 6),
                      Text(a.contenu),
                    ],
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
