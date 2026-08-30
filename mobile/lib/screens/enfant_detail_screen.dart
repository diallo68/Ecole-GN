import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../api/api_client.dart';
import '../models/models.dart';

/// Consultation lecture seule pour un parent : bulletins et présences de
/// son enfant. Parcours critique n°5 du MVP (docs/mvp-scope.md) —
/// consultation seulement, la notification push/SMS reste un gap
/// délibéré documenté ailleurs (PresenceController, AnnonceController).
class EnfantDetailScreen extends StatefulWidget {
  final Eleve eleve;

  const EnfantDetailScreen({super.key, required this.eleve});

  @override
  State<EnfantDetailScreen> createState() => _EnfantDetailScreenState();
}

class _EnfantDetailScreenState extends State<EnfantDetailScreen>
    with SingleTickerProviderStateMixin {
  late final TabController _tabController;
  late Future<List<BulletinEleve>> _bulletins;
  late Future<List<PresenceEleve>> _presences;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _bulletins = _chargerBulletins();
    _presences = _chargerPresences();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<List<BulletinEleve>> _chargerBulletins() async {
    final api = context.read<ApiClient>();
    final donnees = await api.getList('/eleves/${widget.eleve.id}/bulletins');
    return donnees
        .map((d) => BulletinEleve.fromJson(d as Map<String, dynamic>))
        .toList();
  }

  Future<List<PresenceEleve>> _chargerPresences() async {
    final api = context.read<ApiClient>();
    final donnees = await api.getList('/eleves/${widget.eleve.id}/presences');
    return donnees
        .map((d) => PresenceEleve.fromJson(d as Map<String, dynamic>))
        .toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('${widget.eleve.nom} ${widget.eleve.prenom}'),
        bottom: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(text: 'Bulletins'),
            Tab(text: 'Présences'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _OngletBulletins(bulletinsFuture: _bulletins),
          _OngletPresences(presencesFuture: _presences),
        ],
      ),
    );
  }
}

class _OngletBulletins extends StatelessWidget {
  final Future<List<BulletinEleve>> bulletinsFuture;

  const _OngletBulletins({required this.bulletinsFuture});

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<List<BulletinEleve>>(
      future: bulletinsFuture,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator());
        }
        if (snapshot.hasError) {
          return const Center(
            child: Text('Impossible de charger les bulletins.'),
          );
        }

        final bulletins = snapshot.data ?? [];
        if (bulletins.isEmpty) {
          return const Center(
            child: Text('Aucun bulletin disponible pour le moment.'),
          );
        }

        return ListView.separated(
          padding: const EdgeInsets.all(12),
          itemCount: bulletins.length,
          separatorBuilder: (_, _) => const SizedBox(height: 8),
          itemBuilder: (context, i) {
            final b = bulletins[i];
            final publie = b.statut == 'publie';
            return Card(
              child: ListTile(
                title: Text(b.periodeLibelle),
                subtitle: Text(
                  publie
                      ? 'Moyenne : ${b.moyenneGenerale?.toStringAsFixed(2) ?? '—'}/20'
                            '${b.rang != null ? ' — Rang ${b.rang}${b.effectifClasse != null ? '/${b.effectifClasse}' : ''}' : ''}'
                      : 'Pas encore publié par la direction.',
                ),
                trailing: publie
                    ? const Icon(Icons.check_circle, color: Colors.green)
                    : const Icon(Icons.hourglass_empty, color: Colors.grey),
              ),
            );
          },
        );
      },
    );
  }
}

class _OngletPresences extends StatelessWidget {
  final Future<List<PresenceEleve>> presencesFuture;

  const _OngletPresences({required this.presencesFuture});

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<List<PresenceEleve>>(
      future: presencesFuture,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator());
        }
        if (snapshot.hasError) {
          return const Center(
            child: Text('Impossible de charger les présences.'),
          );
        }

        final presences = snapshot.data ?? [];
        if (presences.isEmpty) {
          return const Center(
            child: Text('Aucune présence saisie pour le moment.'),
          );
        }

        return ListView.separated(
          padding: const EdgeInsets.all(12),
          itemCount: presences.length,
          separatorBuilder: (_, _) => const Divider(height: 1),
          itemBuilder: (context, i) {
            final p = presences[i];
            return ListTile(
              title: Text(p.date),
              trailing: _PucePresence(statut: p.statut),
            );
          },
        );
      },
    );
  }
}

class _PucePresence extends StatelessWidget {
  final StatutPresence statut;

  const _PucePresence({required this.statut});

  @override
  Widget build(BuildContext context) {
    final (libelle, couleur) = switch (statut) {
      StatutPresence.present => ('Présent', Colors.green),
      StatutPresence.absent => ('Absent', Colors.red),
      StatutPresence.retard => ('Retard', Colors.amber),
      StatutPresence.excuse => ('Excusé', Colors.blueGrey),
    };

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: couleur.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        libelle,
        style: TextStyle(color: couleur, fontWeight: FontWeight.w500),
      ),
    );
  }
}
