const mongoose = require('mongoose');
const Conversation = require('../models/conversation.model');
const Message = require('../models/message.model');
const { sanitizeText } = require('../utils/helpers');

// Nombre de messages non lus par conversation, pour l'utilisateur courant —
// "non lu" = envoyé par l'autre participant et pas encore marqué lu (voir
// messages() qui marque lu à l'ouverture d'une conversation).
async function compterNonLus(userId, conversationIds) {
  const counts = await Message.aggregate([
    { $match: { conversationId: { $in: conversationIds }, senderId: { $ne: new mongoose.Types.ObjectId(userId) }, lu: false } },
    { $group: { _id: '$conversationId', count: { $sum: 1 } } },
  ]);
  return Object.fromEntries(counts.map(c => [String(c._id), c.count]));
}

const messagingController = {
  // ── Mes conversations ────────────────────────────────────────────
  async conversations(req, res) {
    try {
      const conversations = await Conversation.find({ participants: req.user.id })
        .populate('participants', 'prenom nom repetiteur')
        .sort({ lastMessageAt: -1 });
      const nonLus = await compterNonLus(req.user.id, conversations.map(c => c._id));
      const result = conversations.map(c => ({ ...c.toObject(), unread: nonLus[String(c._id)] || 0 }));
      res.json({ conversations: result });
    } catch (err) {
      res.status(500).json({ error: 'Erreur serveur' });
    }
  },

  // ── Total de messages non lus, tous fils confondus — pour le badge navbar ─
  async unreadCount(req, res) {
    try {
      const count = await Message.countDocuments({
        conversationId: { $in: await Conversation.find({ participants: req.user.id }).distinct('_id') },
        senderId: { $ne: req.user.id },
        lu: false,
      });
      res.json({ count });
    } catch (err) {
      res.status(500).json({ error: 'Erreur serveur' });
    }
  },

  // ── Démarre (ou récupère) une conversation avec un autre utilisateur ─
  async startOrGet(req, res) {
    try {
      const { otherUserId } = req.body;
      let conversation = await Conversation.findOne({ participants: { $all: [req.user.id, otherUserId], $size: 2 } });
      if (!conversation) conversation = await Conversation.create({ participants: [req.user.id, otherUserId] });
      res.json({ conversation });
    } catch (err) {
      res.status(500).json({ error: 'Erreur serveur' });
    }
  },

  // ── Messages d'une conversation ──────────────────────────────────
  async messages(req, res) {
    try {
      const conversation = await Conversation.findById(req.params.id);
      if (!conversation || !conversation.participants.map(String).includes(req.user.id)) {
        return res.status(403).json({ error: 'Accès refusé' });
      }
      const messages = await Message.find({ conversationId: req.params.id }).sort({ createdAt: 1 });
      // Ouvrir la conversation vaut lecture — marque lus les messages reçus
      // (pas les siens) pour que le badge de non-lus redescende.
      await Message.updateMany({ conversationId: req.params.id, senderId: { $ne: req.user.id }, lu: false }, { lu: true });
      res.json({ messages });
    } catch (err) {
      res.status(500).json({ error: 'Erreur serveur' });
    }
  },

  // ── Envoi d'un message ───────────────────────────────────────────
  async send(req, res) {
    try {
      const { text } = req.body;
      const conversation = await Conversation.findById(req.params.id);
      if (!conversation || !conversation.participants.map(String).includes(req.user.id)) {
        return res.status(403).json({ error: 'Accès refusé' });
      }
      const message = await Message.create({ conversationId: req.params.id, senderId: req.user.id, text: sanitizeText(text) });
      conversation.lastMessage = message.text;
      conversation.lastMessageAt = new Date();
      await conversation.save();
      res.status(201).json({ success: true, message });
    } catch (err) {
      res.status(500).json({ error: 'Erreur serveur' });
    }
  },
};

module.exports = messagingController;
