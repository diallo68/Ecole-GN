# Cahier des charges — Gandal (Plateforme de Soutien Scolaire, Guinée)

**Nom de la plateforme :** Gandal — "connaissance" en pular
**Statut :** brouillon initial, à valider/amender
**Projet :** P2 (indépendant de P1 — plateforme de gestion scolaire)

---

## 1. Contexte et vision

En Guinée, l'accès au soutien scolaire de qualité est inégal : peu de répétiteurs qualifiés en dehors des grandes villes, coût élevé du présentiel, pas de ressource centralisée pour réviser un programme.

**Vision :** une plateforme web + mobile centrée sur la **mise en relation avec des répétiteurs**, outillés pour donner cours et contenu (classes virtuelles, vidéos, supports, exercices) — complétée par un **quiz d'auto-évaluation ouvert à tous** sur la page d'accueil.

*(Pas d'auto-formation générale en libre accès pour l'instant : le contenu pédagogique est produit et diffusé par chaque répétiteur à ses propres élèves, pas dans un catalogue public indépendant.)*

## 2. Objectifs

- Rendre le soutien scolaire accessible partout en Guinée (Conakry et intérieur du pays)
- Couvrir l'intégralité du programme national, du primaire à la terminale
- Permettre à des enseignants/répétiteurs de générer un revenu complémentaire en publiant du contenu ou en donnant des cours
- Fonctionner correctement avec une connexion internet faible ou intermittente

## 3. Public cible

| Profil | Besoin |
|---|---|
| **Élève** | Réviser un cours, s'entraîner sur des exercices, réserver un répétiteur |
| **Parent** | Suivre la progression de son enfant, payer/réserver en son nom |
| **Répétiteur / Enseignant** | Publier des cours, proposer ses disponibilités, être rémunéré |
| **Administrateur** | Modérer le contenu, gérer les utilisateurs, superviser la plateforme |

## 4. Niveaux et programme couverts

Système éducatif guinéen :
- **Primaire** : 1ère à 6ème année
- **Collège** : 7ème à 10ème année (examen BEPC en fin de 10ème)
- **Lycée** : 11ème, 12ème, Terminale (examen Baccalauréat en fin de Terminale)

*(À valider : matières prioritaires au lancement — probablement Mathématiques, Français, Sciences Physiques, SVT pour commencer, plutôt que les 100% des matières dès la V1)*

## 5. Fonctionnalités principales (MVP)

### 5.1 Mise en relation avec des répétiteurs
- Profil répétiteur : matières enseignées, niveaux, tarif, présentation, avis
- Recherche/filtre de répétiteurs (par matière, niveau, ville, disponibilité)
- Réservation d'une session (présentiel ou en ligne)
- Messagerie élève/parent ↔ répétiteur
- Système d'avis et de notation après une session

### 5.2 Dashboard répétiteur — outils pédagogiques
Ces outils sont réservés au répétiteur pour ses propres élèves (pas un catalogue public) :
- **Classes virtuelles** : organiser une session de cours en visioconférence (lien généré, planifiée depuis l'agenda du répétiteur)
- **Publication de vidéos** : le répétiteur uploade ses propres vidéos de cours, visibles par ses élèves
- **Supports de cours** : documents/fiches à télécharger (PDF, images) associés à une matière/un chapitre
- **Exercices** : le répétiteur crée des exercices (avec ou sans correction) pour ses élèves
- Organisation par matière → niveau → chapitre, propre à chaque répétiteur

### 5.3 Quiz d'auto-évaluation (page d'accueil)
- Accessible à **tout utilisateur inscrit**, quel que soit son rôle (élève, parent, répétiteur) — pas besoin d'être lié à un répétiteur particulier
- Quiz par niveau/matière pour se tester rapidement
- Résultat + correction affichés immédiatement après validation
- Contenu généré par IA (pas par les répétiteurs, ni rédigé manuellement question par question) — un espace admin permet de déclencher la génération par niveau/matière/chapitre, relire et publier les quiz produits

### 5.4 Comptes et rôles
- Inscription élève / parent / répétiteur (par téléphone, comme YouGouYouGou)
- Un compte parent peut être lié à plusieurs profils élèves (fratrie)
- Espace répétiteur : gestion du contenu publié, agenda, revenus

### 5.5 Administration
- Modération des répétiteurs (validation avant mise en ligne du profil)
- Modération du contenu pédagogique publié
- Génération par IA des quiz d'auto-évaluation (page d'accueil), relecture et publication par l'admin
- Statistiques d'usage globales

## 6. Modèle économique

- **V1 (lancement)** : entièrement gratuit — priorité à la construction de l'audience (élèves, parents, répétiteurs)
- **V2** : commission sur chaque réservation de répétiteur (10-15%, taux exact à affiner selon les retours du marché)
- **Paiement** : Mobile Money (Orange Money / MTN MoMo) à intégrer à partir de la V2, quand la monétisation démarre — pas nécessaire pour le MVP

## 7. Écrans principaux (web + mobile)

- Accueil (mise en avant de cours et répétiteurs)
- Catalogue de cours (filtrable par niveau/matière)
- Détail d'un cours (vidéo + ressources + quiz)
- Recherche de répétiteurs + fiche répétiteur
- Réservation + agenda
- Messagerie
- Espace élève (progression, mes réservations)
- Espace répétiteur (mes cours, mon agenda, mes revenus)
- Back-office admin (modération, statistiques)

## 8. Contraintes techniques

- **Stack proposée** : Node.js/Express (backend) + Next.js (web) + React Native/Expo (mobile) — cohérent avec YouGouYouGou, déjà maîtrisé
- **Connectivité faible** : vidéos en plusieurs résolutions, téléchargement pour visionnage hors-ligne, quiz utilisables hors-ligne avec synchronisation différée
- **Hébergement vidéo** (vidéos uploadées par les répétiteurs) : Cloudinary au démarrage (cohérent avec YouGouYouGou) — à réévaluer si le volume/coût de streaming grossit
- **Visioconférence (classes virtuelles)** : meet.jit.si (Jitsi public, gratuit, zéro infrastructure) — le répétiteur planifie une session, un lien de salle est généré et partagé à ses élèves. Un éventuel self-host Jitsi ou une API tierce payante ne seraient envisagés que si le volume le justifie.
- **Génération IA des quiz** : intégration d'une API LLM (ex: Claude API) côté backend pour produire les questions par niveau/matière/chapitre, avec une étape de relecture humaine avant publication (pas de publication automatique sans validation)
- **Indépendance totale de P1** : aucune donnée, code ou infrastructure partagés

## 9. Hors scope (V1)

- Catalogue de cours en libre accès indépendant des répétiteurs (auto-formation générale)
- Paiement automatisé (peut arriver en V2)
- Application pour répétiteurs indépendante (le même mobile gère élève + répétiteur au départ)
- Multi-pays (Guinée uniquement pour l'instant)

---

## Points à valider avec l'équipe/le porteur de projet

- [x] Matières prioritaires au lancement — Mathématiques, Français, Sciences Physiques, SVT (collège et lycée)
- [x] Modèle économique — gratuit en V1, commission sur réservation répétiteur (10-15%) en V2
- [x] Hébergement vidéo — Cloudinary au démarrage, à réévaluer selon volume (facturation vidéo ≠ facturation image)
- [x] Visioconférence — meet.jit.si (Jitsi public, aucune infra à gérer) au démarrage
- [x] Nom de la plateforme — **Gandal** ("connaissance" en pular)
