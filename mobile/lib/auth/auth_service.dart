import 'package:flutter/foundation.dart';

import '../api/api_client.dart';
import '../models/models.dart';

/// Miroir de web/src/auth/AuthContext.tsx : mêmes responsabilités
/// (connexion, profil, sélection d'établissement), adapté à ChangeNotifier
/// plutôt qu'un contexte React.
class AuthService extends ChangeNotifier {
  final ApiClient api;

  AuthService(this.api);

  Utilisateur? utilisateur;
  List<Rattachement> rattachements = [];
  int? etablissementCourantId;
  bool chargement = true;

  /// Tout est enveloppé dans un seul try/finally : une erreur de stockage
  /// sécurisé (échec de la lecture du token elle-même, pas seulement du
  /// profil) ne doit jamais laisser l'app bloquée sur le spinner de
  /// démarrage indéfiniment. Bug réel trouvé en écrivant le test de fumée
  /// (le premier appel à api.token n'était pas protégé) — traité comme une
  /// session absente plutôt qu'un blocage permanent.
  Future<void> initialiser() async {
    try {
      final jeton = await api.token;
      if (jeton != null) {
        await _chargerProfil();
      }
    } catch (_) {
      await api.setToken(null).catchError((_) {});
    } finally {
      chargement = false;
      notifyListeners();
    }
  }

  Future<void> connecter(String identifiant, String motDePasse) async {
    final reponse = await api.post<Map<String, dynamic>>(
      '/auth/login',
      body: {'identifiant': identifiant, 'mot_de_passe': motDePasse},
    );
    await api.setToken(reponse['token'] as String);
    await _chargerProfil();
    notifyListeners();
  }

  Future<void> deconnecter() async {
    try {
      await api.post('/auth/logout');
    } catch (_) {
      // On efface la session locale même si l'appel réseau échoue.
    }
    await api.setToken(null);
    await api.setEtablissementCourant(null);
    utilisateur = null;
    rattachements = [];
    etablissementCourantId = null;
    notifyListeners();
  }

  void choisirEtablissement(int id) {
    api.setEtablissementCourant(id);
    etablissementCourantId = id;
    notifyListeners();
  }

  Future<void> _chargerProfil() async {
    final reponse = await api.get<Map<String, dynamic>>('/auth/me');
    utilisateur = Utilisateur.fromJson(
      reponse['utilisateur'] as Map<String, dynamic>,
    );
    rattachements = (reponse['rattachements'] as List<dynamic>)
        .map((r) => Rattachement.fromJson(r as Map<String, dynamic>))
        .toList();

    // Un seul établissement actif : sélectionné d'office, même règle que
    // ResolveEtablissementContext côté API et AuthContext côté web.
    if (rattachements.length == 1) {
      final id = rattachements.first.etablissement.id;
      await api.setEtablissementCourant(id);
      etablissementCourantId = id;
    }
  }
}
