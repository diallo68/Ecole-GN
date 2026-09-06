# Gandal — Mobile

App Expo/React Native de **Gandal**, plateforme de soutien scolaire pour la Guinée. Voir [`../docs/cahier-des-charges.md`](../docs/cahier-des-charges.md).

## Démarrage

```bash
npm install
cp .env.example .env   # renseigner EXPO_PUBLIC_API_URL (backend Gandal, IP locale pour tester sur device physique)
npx expo start
```

Nécessite le [backend Gandal](../backend) démarré.

⚠️ L'installation initiale peut échouer sur le script `postinstall` de `react-native-screens`
(`bob: command not found`) selon l'environnement — utiliser `npm install --ignore-scripts` si
besoin (sans impact sur le fonctionnement de l'app).

## Structure

```
app/
  (tabs)/           Accueil, Répétiteurs (recherche/filtre), Quiz (liste), Mon espace
                     (réservations élève-parent ou agenda répétiteur)
  login.tsx, register.tsx   Auth (email + code OTP en 2 étapes)
  repetiteur/[id].tsx        Fiche répétiteur + réservation
  quiz/[id].tsx               Passage d'un quiz + correction
src/
  lib/api.ts        Client HTTP (même contrat que le web)
  lib/constants.ts  Couleurs, matières/niveaux, formatage GNF
  store/            Zustand + AsyncStorage — session utilisateur persistée
  types/            Types partagés (miroir du backend)
```

## État du scaffold

Flux complet : auth, accueil, recherche/réservation répétiteur, quiz jouables avec correction,
mon espace (réservations/agenda).

**Pas encore fait** (contrairement au web) : espace répétiteur pour publier du contenu
pédagogique et planifier des classes virtuelles, back-office admin (volontairement laissés
web-only pour l'instant, comme sur YouGouYouGou), messagerie, avis, notifications push.

Vérifié : `npx tsc --noEmit` sans erreur.
