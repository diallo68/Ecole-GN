import 'dart:convert';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;

/// URL de base de l'API. Pas de proxy comme côté web (Vite) : chaque
/// plateforme Flutter résout "localhost" différemment (10.0.2.2 pour
/// l'émulateur Android, 127.0.0.1 pour iOS/macOS/web en debug local) —
/// voir mobile/README.md.
const String _baseUrl = 'http://127.0.0.1:8123/api/v1';

class ApiException implements Exception {
  final String message;
  final int status;
  final String? code;

  ApiException(this.message, this.status, [this.code]);

  @override
  String toString() => message;
}

/// Client HTTP minimal — même choix que côté web (fetch plutôt qu'axios) :
/// le paquet `http` officiel suffit, pas besoin de dio pour ce volume
/// d'appels.
class ApiClient {
  static const _storage = FlutterSecureStorage();
  static const _cleToken = 'ecole_gn_token';
  static const _cleEtablissement = 'ecole_gn_etablissement_id';

  Future<String?> get token => _storage.read(key: _cleToken);

  Future<void> setToken(String? token) async {
    if (token == null) {
      await _storage.delete(key: _cleToken);
    } else {
      await _storage.write(key: _cleToken, value: token);
    }
  }

  Future<int?> get etablissementCourant async {
    final v = await _storage.read(key: _cleEtablissement);
    return v == null ? null : int.tryParse(v);
  }

  Future<void> setEtablissementCourant(int? id) async {
    if (id == null) {
      await _storage.delete(key: _cleEtablissement);
    } else {
      await _storage.write(key: _cleEtablissement, value: id.toString());
    }
  }

  Future<T> get<T>(String chemin, {int? etablissementId}) =>
      _requete<T>('GET', chemin, etablissementId: etablissementId);

  Future<T> post<T>(String chemin, {Object? body, int? etablissementId}) =>
      _requete<T>('POST', chemin, body: body, etablissementId: etablissementId);

  Future<T> put<T>(String chemin, {Object? body, int? etablissementId}) =>
      _requete<T>('PUT', chemin, body: body, etablissementId: etablissementId);

  Future<T> patch<T>(String chemin, {Object? body, int? etablissementId}) =>
      _requete<T>('PATCH', chemin, body: body, etablissementId: etablissementId);

  Future<T> _requete<T>(
    String methode,
    String chemin, {
    Object? body,
    int? etablissementId,
  }) async {
    final headers = <String, String>{'Accept': 'application/json'};
    if (body != null) headers['Content-Type'] = 'application/json';

    final jeton = await token;
    if (jeton != null) headers['Authorization'] = 'Bearer $jeton';

    final etabId = etablissementId ?? await etablissementCourant;
    if (etabId != null) headers['X-Etablissement-Id'] = etabId.toString();

    final uri = Uri.parse('$_baseUrl$chemin');
    final requeteBody = body != null ? jsonEncode(body) : null;

    late http.Response reponse;
    switch (methode) {
      case 'GET':
        reponse = await http.get(uri, headers: headers);
        break;
      case 'POST':
        reponse = await http.post(uri, headers: headers, body: requeteBody);
        break;
      case 'PUT':
        reponse = await http.put(uri, headers: headers, body: requeteBody);
        break;
      case 'PATCH':
        reponse = await http.patch(uri, headers: headers, body: requeteBody);
        break;
      default:
        throw ArgumentError('Méthode non supportée : $methode');
    }

    if (reponse.statusCode == 204) return null as T;

    final Map<String, dynamic>? corps = reponse.body.isEmpty
        ? null
        : jsonDecode(reponse.body) as Map<String, dynamic>;

    if (reponse.statusCode < 200 || reponse.statusCode >= 300) {
      final erreur = corps?['error'] as Map<String, dynamic>?;
      throw ApiException(
        erreur?['message'] as String? ?? 'Erreur ${reponse.statusCode}',
        reponse.statusCode,
        erreur?['code'] as String?,
      );
    }

    return corps as T;
  }

  /// Pour les réponses qui sont directement un tableau JSON (pas un objet).
  Future<List<dynamic>> getList(String chemin, {int? etablissementId}) async {
    final headers = <String, String>{'Accept': 'application/json'};
    final jeton = await token;
    if (jeton != null) headers['Authorization'] = 'Bearer $jeton';
    final etabId = etablissementId ?? await etablissementCourant;
    if (etabId != null) headers['X-Etablissement-Id'] = etabId.toString();

    final reponse = await http.get(Uri.parse('$_baseUrl$chemin'), headers: headers);

    if (reponse.statusCode < 200 || reponse.statusCode >= 300) {
      final corps = reponse.body.isEmpty ? null : jsonDecode(reponse.body);
      final erreur = (corps as Map<String, dynamic>?)?['error'] as Map<String, dynamic>?;
      throw ApiException(
        erreur?['message'] as String? ?? 'Erreur ${reponse.statusCode}',
        reponse.statusCode,
        erreur?['code'] as String?,
      );
    }

    return jsonDecode(reponse.body) as List<dynamic>;
  }
}
