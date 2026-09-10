const Notification = require('../models/notification.model');

// Crée une notification pour un utilisateur — jamais bloquant pour l'action
// qui la déclenche (envoi de message, changement de statut de réservation,
// validation de profil) : une erreur ici est journalisée mais ne doit pas
// faire échouer la requête principale.
async function notifier(userId, type, texte, lien) {
  if (!userId) return;
  try {
    await Notification.create({ userId, type, texte, lien });
  } catch (err) {
    console.error('Erreur création notification :', err.message);
  }
}

module.exports = { notifier };
