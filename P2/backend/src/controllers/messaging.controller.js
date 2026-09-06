const Conversation = require('../models/conversation.model');
const Message = require('../models/message.model');
const { sanitizeText } = require('../utils/helpers');

const messagingController = {
  // ── Mes conversations ────────────────────────────────────────────
  async conversations(req, res) {
    try {
      const conversations = await Conversation.find({ participants: req.user.id })
        .populate('participants', 'prenom nom repetiteur')
        .sort({ lastMessageAt: -1 });
      res.json({ conversations });
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
