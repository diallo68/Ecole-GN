// Gère les 3 types de contenu pédagogique qu'un répétiteur publie pour ses
// élèves : vidéos, supports de cours, exercices. Logique volontairement
// similaire pour les trois (mêmes filtres, même pattern CRUD).
const Video = require('../models/video.model');
const Support = require('../models/support.model');
const Exercice = require('../models/exercice.model');

const MODELS = { video: Video, support: Support, exercice: Exercice };

function contentController(type) {
  const Model = MODELS[type];
  if (!Model) throw new Error(`Type de contenu inconnu: ${type}`);

  return {
    // ── Le répétiteur publie un contenu ────────────────────────────
    async create(req, res) {
      try {
        const doc = await Model.create({ ...req.body, repetiteurId: req.user.id });
        res.status(201).json({ success: true, [type]: doc });
      } catch (err) {
        res.status(500).json({ error: 'Erreur serveur' });
      }
    },

    // ── Liste du contenu d'un répétiteur donné (vu par ses élèves) ──
    async listByRepetiteur(req, res) {
      try {
        const { matiere, niveau, chapitre } = req.query;
        const filter = { repetiteurId: req.params.repetiteurId };
        if (matiere) filter.matiere = matiere;
        if (niveau) filter.niveau = niveau;
        if (chapitre) filter.chapitre = chapitre;
        const items = await Model.find(filter).sort({ createdAt: -1 });
        res.json({ [`${type}s`]: items });
      } catch (err) {
        res.status(500).json({ error: 'Erreur serveur' });
      }
    },

    // ── Contenu publié par le répétiteur connecté ───────────────────
    async mine(req, res) {
      try {
        const items = await Model.find({ repetiteurId: req.user.id }).sort({ createdAt: -1 });
        res.json({ [`${type}s`]: items });
      } catch (err) {
        res.status(500).json({ error: 'Erreur serveur' });
      }
    },

    // ── Suppression (le répétiteur ne peut retirer que son propre contenu) ─
    async remove(req, res) {
      try {
        const doc = await Model.findOneAndDelete({ _id: req.params.id, repetiteurId: req.user.id });
        if (!doc) return res.status(404).json({ error: 'Introuvable' });
        res.json({ success: true });
      } catch (err) {
        res.status(500).json({ error: 'Erreur serveur' });
      }
    },
  };
}

module.exports = contentController;
