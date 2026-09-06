const Soumission = require('../models/soumission.model');
const Exercice = require('../models/exercice.model');

const soumissionController = {
  // ── L'élève/parent rend (ou remplace) sa réponse à un exercice ──────
  async create(req, res) {
    try {
      const { exerciceId, reponseTexte, fichierUrl } = req.body;
      if (!reponseTexte && !fichierUrl) {
        return res.status(400).json({ error: 'Réponse ou pièce jointe requise' });
      }
      const exercice = await Exercice.findById(exerciceId);
      if (!exercice) return res.status(404).json({ error: 'Exercice introuvable' });

      const soumission = await Soumission.findOneAndUpdate(
        { exerciceId, eleveId: req.user.id },
        { reponseTexte, fichierUrl, statut: 'rendu', $unset: { note: '', commentaire: '' } },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      );
      res.status(201).json({ success: true, soumission });
    } catch (err) {
      res.status(500).json({ error: 'Erreur serveur' });
    }
  },

  // ── Mes rendus (élève/parent) ─────────────────────────────────────
  async mine(req, res) {
    try {
      const soumissions = await Soumission.find({ eleveId: req.user.id })
        .populate('exerciceId', 'titre matiere niveau')
        .sort({ createdAt: -1 });
      res.json({ soumissions });
    } catch (err) {
      res.status(500).json({ error: 'Erreur serveur' });
    }
  },

  // ── Les copies reçues pour un de mes exercices (enseignant) ──────────
  async byExercice(req, res) {
    try {
      const exercice = await Exercice.findOne({ _id: req.params.exerciceId, repetiteurId: req.user.id });
      if (!exercice) return res.status(403).json({ error: 'Accès refusé' });
      const soumissions = await Soumission.find({ exerciceId: req.params.exerciceId })
        .populate('eleveId', 'prenom nom')
        .sort({ createdAt: -1 });
      res.json({ soumissions });
    } catch (err) {
      res.status(500).json({ error: 'Erreur serveur' });
    }
  },

  // ── Corriger une copie (enseignant, doit être l'auteur de l'exercice) ─
  async corriger(req, res) {
    try {
      const { note, commentaire } = req.body;
      const soumission = await Soumission.findById(req.params.id).populate('exerciceId', 'repetiteurId');
      if (!soumission) return res.status(404).json({ error: 'Introuvable' });
      if (String(soumission.exerciceId.repetiteurId) !== req.user.id) {
        return res.status(403).json({ error: 'Accès refusé' });
      }
      soumission.note = note;
      soumission.commentaire = commentaire;
      soumission.statut = 'corrige';
      await soumission.save();
      res.json({ success: true, soumission });
    } catch (err) {
      res.status(500).json({ error: 'Erreur serveur' });
    }
  },
};

module.exports = soumissionController;
