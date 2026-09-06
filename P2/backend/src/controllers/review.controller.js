const Review = require('../models/review.model');
const Reservation = require('../models/reservation.model');
const User = require('../models/user.model');

const reviewController = {
  // ── Laisser un avis après une session terminée ──────────────────────
  async create(req, res) {
    try {
      const { reservationId, note, commentaire } = req.body;
      const reservation = await Reservation.findById(reservationId);
      if (!reservation || reservation.statut !== 'terminee') {
        return res.status(400).json({ error: 'Réservation introuvable ou non terminée' });
      }
      const isParty = [String(reservation.eleveId), String(reservation.parentId)].includes(req.user.id);
      if (!isParty) return res.status(403).json({ error: 'Accès refusé' });

      const review = await Review.create({
        reservationId, repetiteurId: reservation.repetiteurId, auteurId: req.user.id, note, commentaire,
      });

      // Recalcule la moyenne du répétiteur
      const stats = await Review.aggregate([
        { $match: { repetiteurId: reservation.repetiteurId } },
        { $group: { _id: null, avg: { $avg: '$note' }, count: { $sum: 1 } } },
      ]);
      if (stats[0]) {
        await User.findByIdAndUpdate(reservation.repetiteurId, {
          'repetiteur.avgRating': Math.round(stats[0].avg * 10) / 10,
          'repetiteur.ratingCount': stats[0].count,
        });
      }
      res.status(201).json({ success: true, review });
    } catch (err) {
      res.status(500).json({ error: 'Erreur serveur' });
    }
  },

  // ── Avis reçus par un répétiteur (public) ───────────────────────────
  async byRepetiteur(req, res) {
    try {
      const reviews = await Review.find({ repetiteurId: req.params.repetiteurId })
        .populate('auteurId', 'prenom')
        .sort({ createdAt: -1 });
      res.json({ reviews });
    } catch (err) {
      res.status(500).json({ error: 'Erreur serveur' });
    }
  },
};

module.exports = reviewController;
