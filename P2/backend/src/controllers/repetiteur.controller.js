const User = require('../models/user.model');
const { sanitizeText } = require('../utils/helpers');
const { notifier } = require('../utils/notifications');

// Un utilisateur qui tape des caractères spéciaux regex ("(", "*"...) dans la
// recherche ou la ville ne doit ni faire planter la requête (regex invalide)
// ni chercher un motif — juste le texte tel quel.
const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const repetiteurController = {
  // ── Recherche publique de répétiteurs (filtrable) ───────────────────
  async list(req, res) {
    try {
      const { matiere, niveau, ville, disponibilite, tarifMax, q, page = 1, limit = 20 } = req.query;
      // 'repetiteur.disponible' : l'enseignant accepte-t-il de nouveaux
      // élèves ? Un profil qui a coupé cet interrupteur ne doit pas
      // apparaître dans une recherche censée aboutir à une prise de contact.
      const filter = { role: 'repetiteur', 'repetiteur.valide': true, 'repetiteur.disponible': true };
      if (matiere) filter['repetiteur.matieres'] = matiere;
      if (niveau) filter['repetiteur.niveaux'] = niveau;
      if (ville) filter.city = new RegExp(escapeRegExp(ville), 'i');
      if (disponibilite) filter['repetiteur.disponibilites'] = disponibilite;
      // Les options de l'UI ("Jusqu'à 30 000 GNF"...) sont des montants à
      // l'heure — les comparer tel quel à un forfait mensuel/annuel n'aurait
      // aucun sens (300 000 GNF/mois est bien moins cher que 300 000/heure).
      // On restreint donc le filtre aux tarifs horaires plutôt que de
      // comparer des unités différentes.
      if (tarifMax) {
        filter['repetiteur.tarif.periode'] = 'heure';
        filter['repetiteur.tarif.montant'] = { $lte: Number(tarifMax) };
      }
      // Recherche texte (nom, prénom, matière) côté serveur — avant, seuls
      // les 50 premiers profils étaient chargés puis filtrés dans le
      // navigateur : un enseignant hors de ce lot était introuvable par nom.
      if (q && q.trim()) {
        const re = new RegExp(escapeRegExp(q.trim()), 'i');
        filter.$or = [{ prenom: re }, { nom: re }, { 'repetiteur.matieres': re }];
      }

      const pageNum = Math.max(1, parseInt(page, 10) || 1);
      const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));

      const [repetiteurs, total] = await Promise.all([
        User.find(filter)
          .select('prenom nom city repetiteur createdAt')
          .sort({ 'repetiteur.avgRating': -1 })
          .skip((pageNum - 1) * limitNum)
          .limit(limitNum)
          .lean(),
        User.countDocuments(filter),
      ]);
      res.json({ repetiteurs, total, page: pageNum, totalPages: Math.max(1, Math.ceil(total / limitNum)) });
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

      // Un profil pas encore validé par un admin ne doit pas être consultable
      // par simple connaissance de l'URL — seul le répétiteur concerné (pour
      // se prévisualiser) ou un admin (modération) peut le voir avant validation.
      const estProprietaire = req.user && req.user.id === String(repetiteur._id);
      const estAdmin = req.user && req.user.role === 'admin';
      if (!repetiteur.repetiteur.valide && !estProprietaire && !estAdmin) {
        return res.status(404).json({ error: 'Répétiteur introuvable' });
      }

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
      const avant = await User.findOne({ _id: req.params.id, role: 'repetiteur' }).select('repetiteur.valide');
      if (!avant) return res.status(404).json({ error: 'Répétiteur introuvable' });
      const user = await User.findOneAndUpdate(
        { _id: req.params.id, role: 'repetiteur' },
        { 'repetiteur.valide': !!valide },
        { new: true },
      ).select('prenom nom repetiteur');

      // Notifie seulement au passage non validé → validé (pas à chaque
      // enregistrement si l'admin re-coche un profil déjà validé).
      if (!avant.repetiteur?.valide && valide) {
        notifier(user._id, 'profil_valide', 'Votre profil enseignant a été validé, il est maintenant visible par les élèves.', '/dashboard');
      }

      res.json({ success: true, repetiteur: user.repetiteur });
    } catch (err) {
      res.status(500).json({ error: 'Erreur serveur' });
    }
  },
};

module.exports = repetiteurController;
