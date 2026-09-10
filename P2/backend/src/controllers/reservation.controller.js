const crypto = require('crypto');
const Reservation = require('../models/reservation.model');
const User = require('../models/user.model');
const { notifier } = require('../utils/notifications');

// Génère un identifiant de salle Jitsi unique et peu devinable.
function generateJitsiRoom() {
  return `gandal-${crypto.randomBytes(8).toString('hex')}`;
}

const reservationController = {
  // ── Élève/parent réserve une session avec un répétiteur ─────────────
  async create(req, res) {
    try {
      const { repetiteurId, matiere, niveau, mode, dateHeure, dureeMinutes, adresse } = req.body;
      const repetiteur = await User.findOne({ _id: repetiteurId, role: 'repetiteur', 'repetiteur.valide': true });
      if (!repetiteur) return res.status(404).json({ error: 'Répétiteur introuvable ou non disponible' });

      let eleveId = req.user.id;
      if (req.user.role === 'parent') {
        eleveId = req.body.eleveId;
        if (!eleveId) return res.status(400).json({ error: 'Choisissez pour quel enfant réserver' });
        // Un parent ne peut réserver que pour un enfant réellement lié à son
        // compte — sans ce contrôle, n'importe quel parent pourrait réserver
        // pour n'importe quel élève en devinant son id.
        const enfant = await User.findOne({ _id: eleveId, role: 'eleve', 'eleve.parentId': req.user.id });
        if (!enfant) return res.status(403).json({ error: "Cet élève n'est pas lié à votre compte parent" });
      }

      const reservation = await Reservation.create({
        eleveId,
        parentId: req.user.role === 'parent' ? req.user.id : undefined,
        repetiteurId, matiere, niveau, mode, dateHeure, dureeMinutes,
        adresse: mode === 'presentiel' ? adresse : undefined,
        lienVisio: mode === 'en_ligne' ? `https://meet.jit.si/${generateJitsiRoom()}` : undefined,
        prix: repetiteur.repetiteur?.tarif?.montant,
        prixPeriode: repetiteur.repetiteur?.tarif?.periode,
      });
      res.status(201).json({ success: true, reservation });
    } catch (err) {
      res.status(500).json({ error: 'Erreur serveur' });
    }
  },

  // ── Mes réservations (élève/parent) ─────────────────────────────────
  async mine(req, res) {
    try {
      const filter = req.user.role === 'parent' ? { parentId: req.user.id } : { eleveId: req.user.id };
      const reservations = await Reservation.find(filter).populate('repetiteurId', 'prenom nom repetiteur').sort({ dateHeure: -1 });
      res.json({ reservations });
    } catch (err) {
      res.status(500).json({ error: 'Erreur serveur' });
    }
  },

  // ── Agenda du répétiteur connecté ────────────────────────────────────
  async myAgenda(req, res) {
    try {
      const reservations = await Reservation.find({ repetiteurId: req.user.id })
        .populate('eleveId', 'prenom nom')
        .sort({ dateHeure: 1 });
      res.json({ reservations });
    } catch (err) {
      res.status(500).json({ error: 'Erreur serveur' });
    }
  },

  // ── Changement de statut (confirmer / terminer / annuler) ───────────
  async updateStatus(req, res) {
    try {
      const { statut } = req.body;
      const reservation = await Reservation.findById(req.params.id);
      if (!reservation) return res.status(404).json({ error: 'Réservation introuvable' });
      const isOwner = [String(reservation.repetiteurId), String(reservation.eleveId), String(reservation.parentId)].includes(req.user.id);
      if (!isOwner) return res.status(403).json({ error: 'Accès refusé' });
      reservation.statut = statut;
      await reservation.save();

      // Notifie l'élève (et le parent s'il a réservé) uniquement quand c'est
      // l'enseignant qui confirme ou annule — pas quand l'élève/parent
      // change lui-même le statut de sa propre réservation.
      if (req.user.role === 'repetiteur' && ['confirmee', 'annulee'].includes(statut)) {
        const texte = statut === 'confirmee'
          ? `Votre réservation de ${reservation.matiere} a été confirmée par l'enseignant.`
          : `Votre réservation de ${reservation.matiere} a été annulée par l'enseignant.`;
        const type = statut === 'confirmee' ? 'reservation_confirmee' : 'reservation_annulee';
        notifier(reservation.eleveId, type, texte, '/dashboard');
        if (reservation.parentId) notifier(reservation.parentId, type, texte, '/dashboard');
      }

      res.json({ success: true, reservation });
    } catch (err) {
      res.status(500).json({ error: 'Erreur serveur' });
    }
  },
};

module.exports = reservationController;
