# Définition précise du MVP — Phase 1 « Gestion scolaire »

**Réfère à** : [`cahier-des-charges.md`](./cahier-des-charges.md) §4, [`architecture-technique.md`](./architecture-technique.md) §08 (P1, S5–S16)
**Version** : 1.0
**Date** : 29 août 2026

## Objectif du MVP

Permettre à un établissement pilote de faire tourner **un trimestre complet** sans registre papier : inscrire les élèves, tenir l'emploi du temps, saisir les notes et l'appel, produire des bulletins conformes, et informer les parents — rien de plus.

---

## 1. Rôles couverts au lancement pilote

| Rôle | Dans le MVP ? | Détail |
|---|---|---|
| Administrateur établissement (direction) | ✅ Oui | Accès complet web |
| Personnel administratif (secrétariat) | ✅ Oui | Inscriptions, encaissements manuels |
| Enseignant | ✅ Oui | Mobile en priorité : notes, appel |
| Parent | ✅ Oui | Mobile : consultation + notifications |
| Super-admin plateforme | ✅ Oui, minimal | Juste assez pour créer les établissements pilotes — pas d'onboarding self-service (Phase 5) |
| Élève (accès autonome) | ❌ Non | Le compte parent suffit pour valider le concept ; reporté en V1.1 |
| Répétiteur / tuteur | ❌ Non | Appartient au Volet B (Soutien scolaire), Phase 3 |

---

## 2. Fonctionnalités incluses (précisément)

| # cahier des charges | Fonctionnalité | Statut MVP |
|---|---|---|
| 4.1 | Création établissement, année scolaire, import CSV/Excel des utilisateurs | ✅ Complet |
| 4.1 | Rôles/permissions | ✅ Rôles prédéfinis uniquement — pas de permissions personnalisées par utilisateur |
| 4.2 | Inscription/réinscription élève, dossier numérique | ⚠️ Simplifié — champs texte + photo ; pas de scan multi-documents |
| 4.2 | Constitution des classes, affectation enseignants | ✅ Complet |
| 4.2 | Transferts entre classes | ✅ Complet |
| 4.2 | Transferts entre établissements | ❌ Reporté (V1.1) |
| 4.3 | Emploi du temps par classe/enseignant, vue calendrier | ✅ Complet |
| 4.3 | Détection automatique de conflits d'horaires | ⚠️ Best-effort, non bloquant |
| 4.3 | Notification auto de changement (salle, prof absent) | ❌ Reporté (V1.1) |
| 4.4 | Saisie notes, calcul moyennes/rangs, bulletin PDF, historique | ✅ **Cœur du MVP** — priorité absolue |
| 4.5 | Appel numérique quotidien | ✅ Complet |
| 4.5 | Notification parent (absence/retard) — push + **SMS** | ✅ Complet — indispensable dès le pilote (familles sans smartphone) |
| 4.5 | Registre disciplinaire | ❌ Reporté (V1.1) |
| 4.6 | Frais de scolarité, échéancier, encaissement, reçu PDF | ⚠️ Encaissement **manuel** (espèces/chèque) uniquement |
| 4.6 | Intégration mobile money (Orange/MTN/Moov) | ❌ Reporté à la Phase 4, dédiée |
| 4.6 | Relances automatiques impayés | ❌ Reporté (V1.1) |
| 4.7 | Annonces générales (direction → parents) | ✅ Complet |
| 4.7 | Messagerie bidirectionnelle riche enseignant ↔ parent | ❌ Reporté (V1.1) — un fil d'annonces suffit pour valider le besoin |
| 4.8 | Classes virtuelles | ❌ **Hors MVP** — n'était pas placée sur une phase précise dans le planning d'origine ; nécessite l'intégration Jitsi et n'est pas ce qui valide le concept auprès des écoles pilotes |
| 4.9 | Statistiques direction | ⚠️ Version minimale : effectifs, taux de présence, taux de réussite par classe. Export Excel/PDF avancé → V1.1 |
| Volet B (section 5) | Soutien scolaire (cours, quiz, tutorat) | ❌ Hors MVP — Phase 3 dédiée |

---

## 3. Parcours utilisateur critiques (à tester avant go-live pilote)

1. **Direction** importe la liste des élèves via CSV, crée les classes et affecte les enseignants — sans intervention technique extérieure.
2. **Enseignant** fait l'appel sur mobile en moins de 2 minutes pour une classe de 40 élèves, y compris hors connexion, avec synchronisation automatique au retour du réseau.
3. **Enseignant** saisit les notes d'une composition ; la moyenne pondérée et le rang de classe se calculent automatiquement.
4. **Direction** génère les bulletins de fin de trimestre pour une classe entière en un clic, au format PDF conforme au modèle officiel.
5. **Parent** reçoit une notification (push ou SMS selon son équipement) le jour même où son enfant est marqué absent.
6. **Secrétariat** enregistre un paiement de scolarité en espèces et édite un reçu numérique.

Si l'un de ces six parcours échoue en conditions réelles (connexion faible incluse), le MVP n'est pas prêt pour le pilote.

---

## 4. Explicitement hors MVP (rappel)

Volet B entier · classes virtuelles · paiement mobile money · messagerie riche · accès élève autonome · gestion des transferts inter-établissements · registre disciplinaire · statistiques avancées · onboarding self-service.

Ces exclusions ne sont pas des oublis — elles gardent le MVP livrable en 10-12 semaines par une petite équipe (cf. [`architecture-technique.md`](./architecture-technique.md) §09).
