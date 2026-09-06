const crypto = require('crypto');
const ClasseVirtuelle = require('../models/classeVirtuelle.model');

function generateJitsiRoom() {
  return `gandal-${crypto.randomBytes(8).toString('hex')}`;
}

const classeVirtuelleController = {
  // ── Le répétiteur planifie une classe virtuelle ─────────────────────
  async create(req, res) {
    try {
      const { titre, matiere, niveau, dateHeure, dureeMinutes, eleveIds, reservationId } = req.body;
      const classe = await ClasseVirtuelle.create({
        repetiteurId: req.user.id, titre, matiere, niveau, dateHeure, dureeMinutes,
        eleveIds, reservationId,
        lienVisio: `https://meet.jit.si/${generateJitsiRoom()}`,
      });
      res.status(201).json({ success: true, classe });
    } catch (err) {
      res.status(500).json({ error: 'Erreur serveur' });
    }
  },

  // ── Classes virtuelles du répétiteur connecté ───────────────────────
  async mine(req, res) {
    try {
      const classes = await ClasseVirtuelle.find({ repetiteurId: req.user.id }).sort({ dateHeure: 1 });
      res.json({ classes });
    } catch (err) {
      res.status(500).json({ error: 'Erreur serveur' });
    }
  },

  // ── Classes virtuelles où l'élève connecté est inscrit ──────────────
  async myAsEleve(req, res) {
    try {
      const classes = await ClasseVirtuelle.find({ eleveIds: req.user.id })
        .populate('repetiteurId', 'prenom nom')
        .sort({ dateHeure: 1 });
      res.json({ classes });
    } catch (err) {
      res.status(500).json({ error: 'Erreur serveur' });
    }
  },
};

module.exports = classeVirtuelleController;
