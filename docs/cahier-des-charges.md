# Projet Éducation Numérique — Guinée

**Enseignement primaire, collège et lycée**

## Cahier des charges — Plateforme Numérique de Gestion Scolaire et de Soutien Scolaire

*Primaire — Collège — Lycée*
*Document de conception fonctionnelle et technique*
*Version 1.0 — Août 2026*

---

## Sommaire

1. [Contexte et objectifs du projet](#1-contexte-et-objectifs-du-projet)
2. [Périmètre du projet](#2-périmètre-du-projet)
3. [Utilisateurs et rôles](#3-utilisateurs-et-rôles)
4. [Fonctionnalités détaillées — Gestion scolaire](#4-fonctionnalités-détaillées--gestion-scolaire)
5. [Fonctionnalités détaillées — Soutien scolaire](#5-fonctionnalités-détaillées--soutien-scolaire)
6. [Exigences non fonctionnelles](#6-exigences-non-fonctionnelles)
7. [Architecture technique proposée](#7-architecture-technique-proposée)
8. [Planning indicatif de mise en œuvre](#8-planning-indicatif-de-mise-en-œuvre)
9. [Risques et points de vigilance](#9-risques-et-points-de-vigilance)
10. [Prochaines étapes recommandées](#10-prochaines-étapes-recommandées)

---

## 1. Contexte et objectifs du projet

### 1.1 Contexte

Le système éducatif guinéen, qui couvre l'enseignement primaire, le collège et le lycée, fait face à des défis persistants : suivi administratif largement manuel (registres papier, cahiers de notes), communication limitée entre établissements et familles, accès inégal au soutien scolaire selon les régions, et difficultés de connectivité Internet dans de nombreuses zones (urbaines comme rurales).

Dans ce contexte, une plateforme numérique unique, pensée pour les réalités locales (connectivité intermittente, usage majoritaire du mobile, paiement par mobile money, multiplicité des langues), peut moderniser la gestion des établissements tout en démocratisant l'accès au soutien scolaire pour les élèves du primaire, du collège et du lycée.

### 1.2 Objectifs du projet

- Doter les établissements scolaires (publics et privés) d'un outil unique de gestion administrative et pédagogique.
- Faciliter le suivi de la scolarité des élèves par les parents, en temps réel et à distance.
- Offrir un espace de soutien scolaire accessible (cours, exercices, corrections, tutorat) complémentaire aux enseignements en classe.
- Réduire la charge administrative des enseignants et des directions d'école (notes, bulletins, emplois du temps, présences).
- Fournir aux autorités éducatives (Ministères, DPE, IRE) des indicateurs de pilotage fiables et agrégés.
- Concevoir une solution robuste en connectivité faible, accessible sur téléphone mobile bas de gamme comme sur ordinateur.

### 1.3 Bénéficiaires visés

| Public | Bénéfice attendu |
|---|---|
| Élèves (primaire, collège, lycée) | Accès aux cours, exercices, notes, emploi du temps, ressources de soutien scolaire |
| Parents / tuteurs | Suivi des résultats, présences, paiements de scolarité, communication avec l'école |
| Enseignants | Saisie simplifiée des notes et absences, partage de ressources, messagerie avec les familles |
| Administration scolaire (direction, censeurs, surveillants) | Gestion des inscriptions, emplois du temps, finances, statistiques, bulletins |
| Répétiteurs / tuteurs indépendants | Proposer des séances de soutien scolaire en ligne ou en présentiel via la plateforme |
| Autorités éducatives (facultatif, phase ultérieure) | Tableaux de bord agrégés par établissement, commune, région |

---

## 2. Périmètre du projet

### 2.1 Niveaux d'enseignement couverts

- Enseignement primaire (CP1 à CM2)
- Collège (7e à 10e année / premier cycle secondaire)
- Lycée (11e à 12e/13e année / second cycle secondaire, séries scientifiques et littéraires)

### 2.2 Deux volets fonctionnels complémentaires

**Volet A — Gestion scolaire (back-office établissement)**
Ensemble des outils permettant à un établissement de gérer administrativement et pédagogiquement sa vie scolaire : inscriptions, classes, emplois du temps, notes, bulletins, présences, finances, communication.

**Volet B — Soutien scolaire (apprentissage complémentaire)**
Espace pédagogique complémentaire : cours enregistrés ou en direct, banque d'exercices corrigés, quiz auto-corrigés, séances de tutorat individuel ou en petit groupe, suivi de progression personnalisé.

### 2.3 Hors périmètre (phase 1)

- Gestion des examens nationaux officiels (BEPC, Baccalauréat) — intégration éventuelle en phase ultérieure via API du Ministère.
- Cantine scolaire et transport scolaire.
- Ressources humaines détaillées (paie des enseignants) — un simple suivi de présence enseignant est prévu, pas un module RH complet.

---

## 3. Utilisateurs et rôles

La plateforme repose sur un système de comptes et de rôles avec des permissions différenciées.

Un compte parent peut être rattaché à plusieurs enfants, y compris scolarisés dans des établissements différents. Un compte élève peut, à partir du collège, activer un accès autonome en plus de celui du parent, avec des droits limités définis par l'établissement.

| Rôle | Accès principal |
|---|---|
| Super-administrateur (éditeur plateforme) | Gestion multi-établissements, paramétrage global, supervision technique |
| Administrateur établissement (direction) | Configuration de l'école, classes, personnel, finances, validation des bulletins |
| Enseignant | Saisie des notes/absences, gestion de ses classes et matières, dépôt de ressources |
| Répétiteur / tuteur | Création de contenus de soutien, planification de séances, suivi d'élèves inscrits |
| Élève | Consultation notes, emploi du temps, cours, exercices, messagerie encadrée |
| Parent / tuteur légal | Suivi d'un ou plusieurs enfants, paiements, communication avec l'école |
| Personnel administratif (secrétariat, comptabilité) | Inscriptions, encaissements, édition de documents officiels |

---

## 4. Fonctionnalités détaillées — Gestion scolaire

### 4.1 Gestion des établissements et des utilisateurs

- Création et paramétrage d'un établissement (nom, cycle, adresse, année scolaire, logo).
- Gestion des années scolaires et bascule d'une année à l'autre avec archivage.
- Création des comptes utilisateurs (import en masse via fichier Excel/CSV, ou création manuelle).
- Gestion des rôles et permissions par utilisateur.

### 4.2 Inscriptions et gestion des classes

- Inscription et réinscription des élèves, avec dossier numérique (état civil, photo, documents scannés).
- Constitution des classes et répartition des élèves.
- Affectation des enseignants aux classes et matières.
- Gestion des transferts d'élèves entre classes ou établissements.

### 4.3 Emploi du temps

- Création d'emplois du temps par classe et par enseignant, avec détection des conflits d'horaires.
- Consultation de l'emploi du temps par les élèves, parents et enseignants (vue calendrier).
- Notifications automatiques en cas de changement (salle, horaire, enseignant absent).

### 4.4 Notes, évaluations et bulletins

- Saisie des notes par matière, devoir, composition/trimestre selon le barème guinéen en vigueur.
- Calcul automatique des moyennes (pondérées par coefficient), rangs de classe et appréciations.
- Génération automatique des bulletins scolaires au format imprimable (PDF), conformes aux modèles officiels.
- Historique pluriannuel des résultats de chaque élève.

### 4.5 Gestion des présences et de la discipline

- Appel numérique quotidien par les enseignants (présence, retard, absence).
- Notification automatique aux parents en cas d'absence ou de retard.
- Registre des incidents disciplinaires et des sanctions, consultable par la direction.

### 4.6 Gestion financière et scolarité

- Définition des frais de scolarité par niveau, avec échéanciers personnalisables.
- Encaissement des paiements et édition de reçus numériques.
- Intégration des solutions de paiement mobile utilisées en Guinée (Orange Money, MTN MoMo, Moov Money).
- Suivi des impayés et relances automatiques aux familles.
- Tableau de bord financier pour la direction (recettes attendues, encaissées, en retard).

### 4.7 Communication

- Messagerie interne établissement ↔ parents ↔ enseignants.
- Annonces générales (fermeture exceptionnelle, réunions, événements).
- Notifications par SMS pour les familles sans smartphone ou sans connexion Internet, en complément des notifications applicatives.

### 4.8 Classes virtuelles

En complément des cours en présentiel, la plateforme intègre un module de classe virtuelle permettant à un enseignant de dispenser un cours à distance à l'ensemble de sa classe — utile en cas de fermeture exceptionnelle d'établissement, d'intempéries, d'enseignant en zone éloignée, ou pour des élèves ne pouvant se déplacer.

- Planification de séances de classe virtuelle directement depuis l'emploi du temps, avec notification automatique aux élèves et parents concernés.
- Salle de visioconférence intégrée, optimisée pour une faible bande passante (mode audio seul possible si la connexion est trop faible pour la vidéo).
- Partage d'écran, tableau blanc numérique et partage de documents pendant la séance.
- Prise de présence automatique des élèves connectés à la classe virtuelle, remontée dans le registre de présence.
- Enregistrement des séances pour consultation différée par les élèves absents ou en révision.
- Chat modéré par l'enseignant pendant la séance, avec possibilité de lever la main virtuellement.
- Gestion des droits d'accès : seuls les élèves inscrits dans la classe concernée peuvent rejoindre la séance.

### 4.9 Statistiques et pilotage

- Tableaux de bord pour la direction : taux de réussite, taux d'absentéisme, taux de recouvrement financier.
- Export de rapports (Excel, PDF) pour les autorités éducatives locales.

---

## 5. Fonctionnalités détaillées — Soutien scolaire

### 5.1 Contenus pédagogiques

- Bibliothèque de cours structurés par niveau, matière et chapitre, alignés sur le programme officiel guinéen.
- Vidéos de cours (streaming adaptatif, qualité réduite automatique en cas de faible connexion).
- Fiches de cours et résumés téléchargeables pour un usage hors ligne.
- Banque d'exercices corrigés, classés par niveau de difficulté.

### 5.2 Évaluation et suivi de progression

- Quiz auto-corrigés avec retour immédiat et explication des réponses.
- Suivi de la progression de l'élève par matière, avec identification des points faibles.
- Recommandations personnalisées de contenus selon les résultats aux quiz.
- Rapport de progression partagé avec les parents.

### 5.3 Tutorat et séances en direct

- Mise en relation entre élèves et répétiteurs/tuteurs (profils, matières enseignées, disponibilités, tarifs).
- Réservation et paiement de séances individuelles ou en petit groupe.
- Salle de classe virtuelle légère (audio/vidéo optimisée bas débit, tableau blanc partagé, chat), s'appuyant sur le même module de visioconférence que les classes virtuelles d'établissement (section 4.8).
- Système d'évaluation des tuteurs par les familles.

### 5.4 Classes virtuelles de groupe (soutien collectif)

- Organisation de séances de soutien en petit groupe (plusieurs élèves d'un même niveau réunis autour d'un même tuteur), avec inscription et paiement mutualisés.
- Bibliothèque des séances passées, consultables en réécoute pour les abonnés au soutien scolaire.
- Sondages et exercices interactifs pendant la séance pour maintenir l'engagement des élèves.

### 5.5 Mode hors ligne et faible connectivité

- Téléchargement des cours et exercices pour consultation hors connexion.
- Synchronisation différée des résultats de quiz dès le retour de la connexion.
- Version allégée de l'application, compatible avec les téléphones d'entrée de gamme (Android).

---

## 6. Exigences non fonctionnelles

### 6.1 Accessibilité et connectivité

- Application mobile Android en priorité (parc majoritaire en Guinée), interface web responsive en complément.
- Fonctionnement dégradé mais utilisable en 2G/3G, avec compression des contenus multimédias.
- Mode hors ligne pour les fonctions essentielles (consultation notes, emploi du temps, cours téléchargés).
- Pour les classes virtuelles, bascule automatique en mode audio seul (ou audio + diapositives statiques) lorsque la bande passante est insuffisante pour la vidéo, afin de ne pas exclure les élèves en zone mal connectée.

### 6.2 Langues

- Français comme langue principale de l'interface et des contenus.
- Prévoir une structure permettant l'ajout ultérieur de langues nationales (poular, malinké, soussou) pour les communications aux familles.

### 6.3 Sécurité et protection des données

- Protection des données personnelles des mineurs, conformément aux principes de protection des données en vigueur.
- Accès aux données d'un élève strictement limité à son établissement, ses parents et les enseignants concernés.
- Sauvegardes régulières et chiffrement des données sensibles (identité, paiements).

### 6.4 Performance et disponibilité

- Disponibilité cible de la plateforme : 99% hors maintenance planifiée.
- Temps de chargement optimisé pour les zones à faible bande passante.

### 6.5 Scalabilité

- Architecture capable de monter en charge, d'un établissement pilote à un déploiement multi-établissements à l'échelle nationale.

---

## 7. Architecture technique proposée

### 7.1 Vue d'ensemble

Architecture en trois niveaux : applications clientes (mobile et web), backend applicatif exposant des API, et infrastructure d'hébergement. Une conception modulaire permettra d'activer indépendamment le module « Gestion scolaire » et le module « Soutien scolaire » selon les besoins de chaque établissement.

> Détaillé dans [`architecture-technique.md`](./architecture-technique.md).

### 7.2 Composants proposés (à valider avec l'équipe technique)

| Composant | Proposition |
|---|---|
| Application mobile | Application Android native ou multiplateforme légère, mode hors ligne |
| Application web | Interface responsive pour administration et direction d'établissement |
| Backend / API | API REST sécurisée, architecture modulaire par service (scolarité, finances, contenus) |
| Base de données | Base relationnelle pour les données structurées (élèves, notes, finances) |
| Stockage de contenus | Stockage optimisé pour vidéos/fichiers avec compression et diffusion adaptative |
| Paiements | Intégration API Orange Money, MTN MoMo, Moov Money |
| Notifications | Service de notifications push + passerelle SMS pour familles non connectées |
| Visioconférence / classe virtuelle | Solution de visioconférence intégrée ou via un fournisseur tiers (API), avec mode audio seul en repli bas débit, enregistrement et rediffusion des séances |
| Hébergement | Hébergement cloud avec option de réplication locale/régionale pour la latence |

### 7.3 Interopérabilité

- Prévoir des API ouvertes pour une future interconnexion avec les systèmes du Ministère de l'Éducation Nationale et de l'Alphabétisation.
- Export standardisé des données (élèves, résultats) au format Excel/CSV pour les besoins administratifs existants.

---

## 8. Planning indicatif de mise en œuvre

| Phase | Durée estimée | Contenu |
|---|---|---|
| Phase 0 — Cadrage | 4 semaines | Validation du cahier des charges, choix technologiques, maquettes UX/UI |
| Phase 1 — MVP Gestion scolaire | 10-12 semaines | Inscriptions, classes, notes, bulletins, présences, communication de base |
| Phase 2 — Pilote terrain | 6-8 semaines | Déploiement dans 2 à 5 établissements pilotes, ajustements |
| Phase 3 — Module Soutien scolaire | 10-12 semaines | Bibliothèque de contenus, quiz, tutorat, mode hors ligne |
| Phase 4 — Paiements et finances | 4-6 semaines | Intégration mobile money, gestion des frais de scolarité |
| Phase 5 — Déploiement à l'échelle | Continu | Extension progressive à d'autres établissements et régions |

---

## 9. Risques et points de vigilance

| Risque | Mesure d'atténuation |
|---|---|
| Faible connectivité dans certaines zones | Mode hors ligne prioritaire, synchronisation différée, notifications SMS |
| Réticence des enseignants/directions au numérique | Formation, interface simple, accompagnement au démarrage dans chaque établissement pilote |
| Équipement limité des familles (smartphones) | Version ultra-légère, accès possible via cybercafé ou compte partagé, alertes SMS |
| Fiabilité des paiements mobile money | Multi-opérateurs, reçus numériques et conservation d'un historique consultable |
| Protection des données des mineurs | Politique de confidentialité claire, contrôle d'accès strict par rôle |

---

## 10. Prochaines étapes recommandées

- Valider ce cahier des charges avec les parties prenantes (direction d'établissement(s) pilote(s), parents, enseignants).
- Prioriser les fonctionnalités du MVP (produit minimum viable) pour un premier lancement rapide.
- Sélectionner un ou plusieurs établissements pilotes représentatifs (urbain/rural, public/privé).
- Lancer les maquettes d'interface (UX/UI) pour validation avant développement.
- Étudier les partenariats possibles avec les opérateurs de mobile money et de télécommunication.
