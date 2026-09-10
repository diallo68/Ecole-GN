const Notification = require('../models/notification.model');

const notificationController = {
  // ── Mes notifications, les plus récentes d'abord ─────────────────
  async mine(req, res) {
    try {
      const notifications = await Notification.find({ userId: req.user.id })
        .sort({ createdAt: -1 })
        .limit(30);
      res.json({ notifications });
    } catch (err) {
      res.status(500).json({ error: 'Erreur serveur' });
    }
  },

  // ── Total non lues — pour le badge navbar ─────────────────────────
  async unreadCount(req, res) {
    try {
      const count = await Notification.countDocuments({ userId: req.user.id, lu: false });
      res.json({ count });
    } catch (err) {
      res.status(500).json({ error: 'Erreur serveur' });
    }
  },

  // ── Marque une notification lue (au clic) ──────────────────────────
  async markRead(req, res) {
    try {
      const notification = await Notification.findOneAndUpdate(
        { _id: req.params.id, userId: req.user.id },
        { lu: true },
        { new: true },
      );
      if (!notification) return res.status(404).json({ error: 'Notification introuvable' });
      res.json({ success: true, notification });
    } catch (err) {
      res.status(500).json({ error: 'Erreur serveur' });
    }
  },

  // ── Marque tout comme lu (bouton "Tout marquer comme lu") ──────────
  async markAllRead(req, res) {
    try {
      await Notification.updateMany({ userId: req.user.id, lu: false }, { lu: true });
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: 'Erreur serveur' });
    }
  },
};

module.exports = notificationController;
