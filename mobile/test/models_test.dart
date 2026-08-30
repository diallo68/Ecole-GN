// Evaluation masqué : flutter_test exporte son propre symbole Evaluation
// (accessibilité), en collision avec notre modèle métier du même nom.
import 'package:flutter_test/flutter_test.dart' hide Evaluation;
import 'package:mobile/models/models.dart';

void main() {
  group('Note.fromJson', () {
    test('lit une valeur envoyée en chaîne (cast decimal:2 côté API)', () {
      // Bug réel trouvé en rejouant NotesScreen contre l'API réelle :
      // Note::valeur est casté `decimal:2` côté Laravel, sérialisé en
      // JSON comme une chaîne ("15.50"), pas un nombre — `as num?`
      // levait une exception au premier chargement d'une note déjà
      // saisie.
      final note = Note.fromJson({'eleve_id': 1, 'valeur': '15.50'});
      expect(note.valeur, 15.5);
    });

    test('lit une valeur envoyée en nombre JSON', () {
      final note = Note.fromJson({'eleve_id': 1, 'valeur': 15.5});
      expect(note.valeur, 15.5);
    });

    test('valeur null (élève absent) ne lève pas', () {
      final note = Note.fromJson({'eleve_id': 1, 'valeur': null});
      expect(note.valeur, isNull);
    });
  });

  group('Evaluation.fromJson', () {
    test(
      'tronque le datetime ISO complet renvoyé par l\'API au format date',
      () {
        // L'API sérialise les champs `date` Laravel en ISO 8601 complet
        // ("2026-11-05T00:00:00.000000Z"), pas au format `date` promis
        // par openapi.yaml.
        final evaluation = Evaluation.fromJson({
          'id': 1,
          'type': 'devoir',
          'libelle': 'Devoir 1',
          'date_evaluation': '2026-11-05T00:00:00.000000Z',
          'periode_id': 3,
        });
        expect(evaluation.dateEvaluation, '2026-11-05');
      },
    );
  });

  group('Creneau.fromJson', () {
    test('tronque les secondes renvoyées par le cast Postgres time', () {
      // Le cast Postgres `time` sérialise avec les secondes
      // ("08:00:00"), pas au format "HH:MM" que promet l'exemple
      // d'openapi.yaml — déjà contourné côté web (EmploiDuTempsPage.tsx,
      // .slice(0, 5)).
      final creneau = Creneau.fromJson({
        'id': 1,
        'jour_semaine': 1,
        'heure_debut': '08:00:00',
        'heure_fin': '09:00:00',
        'salle': null,
        'matiere': {'nom': 'Mathématiques'},
        'enseignant': {'nom': 'Barry', 'prenom': 'Ibrahima'},
      });

      expect(creneau.heureDebut, '08:00');
      expect(creneau.heureFin, '09:00');
      expect(creneau.matiereNom, 'Mathématiques');
      expect(creneau.enseignantNom, 'Barry');
    });
  });

  group('Eleve.fromJson', () {
    test('classe absente (endpoint autre que /mes-enfants) reste null', () {
      final eleve = Eleve.fromJson({
        'id': 1,
        'matricule': 'EL-00001',
        'nom': 'Diallo',
        'prenom': 'Aissatou',
      });
      expect(eleve.classe, isNull);
    });

    test('classe présente (GET /mes-enfants) est parsée', () {
      final eleve = Eleve.fromJson({
        'id': 1,
        'matricule': 'EL-00001',
        'nom': 'Diallo',
        'prenom': 'Aissatou',
        'classe': {'id': 5, 'niveau': 'CM2', 'libelle': 'CM2 A'},
      });
      expect(eleve.classe?.libelle, 'CM2 A');
    });
  });
}
