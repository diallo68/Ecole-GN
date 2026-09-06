const User = require('../models/user.model');
const Reservation = require('../models/reservation.model');
const Quiz = require('../models/quiz.model');
const Conversation = require('../models/conversation.model');

const adminController = {
  // ── Liste des inscrits (gestion des comptes) ─────────────────────────
  async users(req, res) {
    try {
      const { role, search } = req.query;
      const filter = {};
      if (role) filter.role = role;
      if (search) {
        const re = new RegExp(search, 'i');
        filter.$or = [{ prenom: re }, { nom: re }, { email: re }];
      }
      const users = await User.find(filter)
        .select('prenom nom email city role createdAt eleve.niveau repetiteur.valide repetiteur.matieres')
        .sort({ createdAt: -1 })
        .limit(300);
      res.json({ users });
    } catch (err) {
      res.status(500).json({ error: 'Erreur serveur' });
    }
  },

  // ── Vue d'ensemble des conversations (supervision, lecture seule) ────
  async conversations(req, res) {
    try {
      const conversations = await Conversation.find()
        .populate('participants', 'prenom nom role')
        .sort({ lastMessageAt: -1 })
        .limit(50);
      res.json({ conversations });
    } catch (err) {
      res.status(500).json({ error: 'Erreur serveur' });
    }
  },

  // ── Statistiques globales pour l'aperçu du back-office ──────────────
  async stats(req, res) {
    try {
      const [
        eleves, parents, enseignantsValides, enseignantsEnAttente,
        reservationsEnAttente, reservationsConfirmees, reservationsTerminees,
        quizPublies, quizTotal,
      ] = await Promise.all([
        User.countDocuments({ role: 'eleve' }),
        User.countDocuments({ role: 'parent' }),
        User.countDocuments({ role: 'repetiteur', 'repetiteur.valide': true }),
        User.countDocuments({ role: 'repetiteur', 'repetiteur.valide': false }),
        Reservation.countDocuments({ statut: 'en_attente' }),
        Reservation.countDocuments({ statut: 'confirmee' }),
        Reservation.countDocuments({ statut: 'terminee' }),
        Quiz.countDocuments({ publie: true }),
        Quiz.countDocuments({}),
      ]);

      res.json({
        eleves, parents,
        enseignants: { valides: enseignantsValides, enAttente: enseignantsEnAttente },
        reservations: {
          enAttente: reservationsEnAttente,
          confirmees: reservationsConfirmees,
          terminees: reservationsTerminees,
          total: reservationsEnAttente + reservationsConfirmees + reservationsTerminees,
        },
        quiz: { publies: quizPublies, total: quizTotal },
      });
    } catch (err) {
      res.status(500).json({ error: 'Erreur serveur' });
    }
  },
};

module.exports = adminController;
