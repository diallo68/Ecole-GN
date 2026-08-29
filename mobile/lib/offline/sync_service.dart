import 'dart:async';

import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter/foundation.dart';

import '../api/api_client.dart';
import 'base_locale.dart';
import 'ecriture_en_attente.dart';

/// Résultat de l'interprétation d'une réponse POST /sync/batch — logique
/// pure, testable sans toucher au réseau ni à sqflite (voir
/// test/offline/sync_service_test.dart).
class ResultatSynchronisation {
  final List<String> aSupprimer; // applique / deja_applique
  final Map<String, String> enErreur; // sync_uuid -> message (rejete)

  ResultatSynchronisation({required this.aSupprimer, required this.enErreur});
}

/// Interprète la réponse de POST /sync/batch (docs/openapi.yaml) : chaque
/// écriture appliquée ou déjà appliquée quitte la file locale ; une
/// écriture rejetée y reste, marquée en erreur pour que l'enseignant la
/// voie plutôt qu'elle ne disparaisse silencieusement.
ResultatSynchronisation interpreterResultats(List<dynamic> resultats) {
  final aSupprimer = <String>[];
  final enErreur = <String, String>{};

  for (final r in resultats) {
    final ligne = r as Map<String, dynamic>;
    final uuid = ligne['sync_uuid'] as String;
    final statut = ligne['statut'] as String;

    if (statut == 'applique' || statut == 'deja_applique') {
      aSupprimer.add(uuid);
    } else {
      enErreur[uuid] = (ligne['erreur'] as String?) ?? 'Rejeté par le serveur.';
    }
  }

  return ResultatSynchronisation(aSupprimer: aSupprimer, enErreur: enErreur);
}

/// Orchestre la file locale et sa synchronisation. Le mode hors-ligne réel :
/// AppelScreen (et demain la saisie de notes) écrit TOUJOURS ici d'abord,
/// jamais en direct vers l'API — la synchronisation est un souci séparé,
/// tenté immédiatement si le réseau répond, sinon différé sans jamais
/// perdre la saisie (docs/architecture-technique.md §04).
class SyncService extends ChangeNotifier {
  final ApiClient api;
  final BaseLocale base;
  StreamSubscription<List<ConnectivityResult>>? _abonnementConnectivite;

  int enAttente = 0;
  int enErreur = 0;
  bool synchronisationEnCours = false;

  SyncService(this.api, this.base) {
    _abonnementConnectivite = Connectivity().onConnectivityChanged.listen((
      resultats,
    ) {
      if (!resultats.contains(ConnectivityResult.none)) {
        synchroniser();
      }
    });
  }

  @override
  void dispose() {
    _abonnementConnectivite?.cancel();
    super.dispose();
  }

  Future<void> enregistrer(EcritureEnAttente ecriture) =>
      enregistrerPlusieurs([ecriture]);

  /// Écrit tout le lot avant toute tentative réseau — un appel de 40 élèves
  /// doit être intégralement sur disque avant qu'on essaie quoi que ce
  /// soit côté serveur, pas 39 lignes locales pendant qu'une 40e attend le
  /// réseau.
  Future<void> enregistrerPlusieurs(List<EcritureEnAttente> ecritures) async {
    for (final e in ecritures) {
      await base.ajouter(e);
    }
    await _rafraichirCompteurs();
    // Tentative immédiate si le réseau est déjà là — l'enseignant n'attend
    // pas un cycle de synchronisation périodique pour un appel qui vient
    // d'être fait alors qu'il a du réseau.
    unawaited(synchroniser());
  }

  Future<void> synchroniser() async {
    if (synchronisationEnCours) return;
    synchronisationEnCours = true;
    notifyListeners();

    try {
      final ecritures = await base.lister();
      if (ecritures.isEmpty) return;

      final reponse = await api.post<Map<String, dynamic>>(
        '/sync/batch',
        body: {
          'ecritures': ecritures
              .map(
                (e) => {
                  'sync_uuid': e.syncUuid,
                  'type': e.type,
                  'payload': e.payload,
                },
              )
              .toList(),
        },
      );

      final resultat = interpreterResultats(
        reponse['resultats'] as List<dynamic>,
      );

      for (final uuid in resultat.aSupprimer) {
        await base.supprimer(uuid);
      }
      for (final entree in resultat.enErreur.entries) {
        await base.marquerEnErreur(entree.key, entree.value);
      }
    } on ApiException {
      // Erreur applicative (ex. token expiré) : on retentera plus tard,
      // rien à faire ici — les écritures restent en file.
    } catch (_) {
      // Pas de réseau ou serveur injoignable : attendu en connectivité
      // faible, ce n'est pas une erreur à remonter à l'enseignant tant que
      // la file locale conserve la saisie.
    } finally {
      synchronisationEnCours = false;
      await _rafraichirCompteurs();
    }
  }

  Future<void> _rafraichirCompteurs() async {
    final ecritures = await base.lister();
    enAttente = ecritures.where((e) => e.statut == 'en_attente').length;
    enErreur = ecritures.where((e) => e.statut == 'erreur').length;
    notifyListeners();
  }
}
