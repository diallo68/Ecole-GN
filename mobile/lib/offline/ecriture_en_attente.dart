import 'dart:convert';

/// Une écriture (note ou présence) saisie hors ligne, en attente de
/// synchronisation via POST /sync/batch (architecture-technique.md §04).
class EcritureEnAttente {
  final String syncUuid;
  final String type; // 'note' | 'presence'
  final Map<String, dynamic> payload;
  final String libelle; // résumé lisible, ex. "Appel — CM2 A, 29/08/2026"
  final DateTime creeLe;
  final String statut; // 'en_attente' | 'erreur'
  final String? derniereErreur;

  EcritureEnAttente({
    required this.syncUuid,
    required this.type,
    required this.payload,
    required this.libelle,
    required this.creeLe,
    this.statut = 'en_attente',
    this.derniereErreur,
  });

  Map<String, dynamic> versLigneSql() => {
    'sync_uuid': syncUuid,
    'type': type,
    'payload': jsonEncode(payload),
    'libelle': libelle,
    'cree_le': creeLe.toIso8601String(),
    'statut': statut,
    'derniere_erreur': derniereErreur,
  };

  static EcritureEnAttente depuisLigneSql(Map<String, dynamic> ligne) =>
      EcritureEnAttente(
        syncUuid: ligne['sync_uuid'] as String,
        type: ligne['type'] as String,
        payload: jsonDecode(ligne['payload'] as String) as Map<String, dynamic>,
        libelle: ligne['libelle'] as String,
        creeLe: DateTime.parse(ligne['cree_le'] as String),
        statut: ligne['statut'] as String,
        derniereErreur: ligne['derniere_erreur'] as String?,
      );
}
