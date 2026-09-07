const User = require('../models/user.model');
const { sanitizeText } = require('../utils/helpers');

const repetiteurController = {
  // ── Recherche publique de répétiteurs (filtrable) ───────────────────
  async list(req, res) {
    try {
      const { matiere, niveau, ville, disponibilite, tarifMax, limit = 50 } = req.query;
      const filter = { role: 'repetiteur', 'repetiteur.valide': true };
      if (matiere) filter['repetiteur.matieres'] = matiere;
      if (niveau) filter['repetiteur.niveaux'] = niveau;
      if (ville) filter.city = new RegExp(ville, 'i');
      if (disponibilite) filter['repetiteur.disponibilites'] = disponibilite;
      if (tarifMax) filter['repetiteur.tarif.montant'] = { $lte: Number(tarifMax) };

      const repetiteurs = await User.find(filter)
        .select('prenom nom city repetiteur createdAt')
        .sort({ 'repetiteur.avgRating': -1 })
        .limit(Number(limit))
        .lean();
      res.json({ repetiteurs });
    } catch (err) {
      res.status(500).json({ error: 'Erreur serveur' });
    }
  },

  // ── Fiche publique d'un répétiteur ──────────────────────────────────
  async getById(req, res) {
    try {
      const repetiteur = await User.findOne({ _id: req.params.id, role: 'repetiteur' })
        .select('prenom nom city repetiteur createdAt')
        .lean();
      if (!repetiteur) return res.status(404).json({ error: 'Répétiteur introuvable' });
      res.json({ repetiteur });
    } catch (err) {
      res.status(500).json({ error: 'Erreur serveur' });
    }
  },

  // ── Le répétiteur connecté met à jour son propre profil ─────────────
  async updateMyProfile(req, res) {
    try {
      const user = await User.findById(req.user.id);
      if (!user || user.role !== 'repetiteur') return res.status(403).json({ error: 'Accès réservé aux répétiteurs' });

      const { bio, matieres, niveaux, tarif, disponibilites, disponible, avatar } = req.body;
      user.repetiteur = {
        ...user.repetiteur.toObject(),
        ...(bio !== undefined ? { bio: sanitizeText(bio) } : {}),
        ...(matieres !== undefined ? { matieres } : {}),
        ...(niveaux !== undefined ? { niveaux } : {}),
        ...(tarif !== undefined ? { tarif } : {}),
        ...(disponibilites !== undefined ? { disponibilites } : {}),
        ...(disponible !== undefined ? { disponible } : {}),
        ...(avatar !== undefined ? { avatar } : {}),
      };
      await user.save();
      res.json({ success: true, repetiteur: user.repetiteur });
    } catch (err) {
      res.status(500).json({ error: 'Erreur serveur' });
    }
  },

  // ── Admin : liste de tous les répétiteurs (validés + en attente) ────
  async adminList(req, res) {
    try {
      const { statut } = req.query; // 'en_attente' | 'valide' | undefined (tous)
      const filter = { role: 'repetiteur' };
      if (statut === 'en_attente') filter['repetiteur.valide'] = false;
      if (statut === 'valide') filter['repetiteur.valide'] = true;
      const repetiteurs = await User.find(filter)
        .select('prenom nom email phone photo pieceIdentite city repetiteur createdAt')
        .sort({ createdAt: -1 })
        .lean();
      res.json({ repetiteurs });
    } catch (err) {
      res.status(500).json({ error: 'Erreur serveur' });
    }
  },

  // ── Admin : valider/refuser un profil répétiteur avant mise en ligne ─
  async moderate(req, res) {
    try {
      const { valide } = req.body;
      const user = await User.findOneAndUpdate(
        { _id: req.params.id, role: 'repetiteur' },
        { 'repetiteur.valide': !!valide },
        { new: true },
      ).select('prenom nom repetiteur');
      if (!user) return res.status(404).json({ error: 'Répétiteur introuvable' });
      res.json({ success: true, repetiteur: user.repetiteur });
    } catch (err) {
      res.status(500).json({ error: 'Erreur serveur' });
    }
  },
};

module.exports = repetiteurController;
