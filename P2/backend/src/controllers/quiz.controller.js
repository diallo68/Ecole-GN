const Quiz = require('../models/quiz.model');
const QuizAttempt = require('../models/quizAttempt.model');

const quizController = {
  // ── Historique des quiz passés par l'utilisateur connecté ───────────
  async mesTentatives(req, res) {
    try {
      const tentatives = await QuizAttempt.find({ userId: req.user.id })
        .populate('quizId', 'titre matiere niveau')
        .sort({ createdAt: -1 })
        .limit(20);
      res.json({ tentatives });
    } catch (err) {
      res.status(500).json({ error: 'Erreur serveur' });
    }
  },

  // ── Liste des quiz publiés, ouverte à tout utilisateur connecté ─────
  async list(req, res) {
    try {
      const { matiere, niveau } = req.query;
      const filter = { publie: true };
      if (matiere) filter.matiere = matiere;
      if (niveau) filter.niveau = niveau;
      // Les réponses correctes/explications ne sont pas renvoyées ici,
      // seulement au moment de la correction (voir submit ci-dessous).
      const quizzes = await Quiz.find(filter).select('titre matiere niveau createdAt').sort({ createdAt: -1 });
      res.json({ quizzes });
    } catch (err) {
      res.status(500).json({ error: 'Erreur serveur' });
    }
  },

  // ── Détail d'un quiz pour le passer (questions + choix, sans les réponses) ─
  async getById(req, res) {
    try {
      const quiz = await Quiz.findOne({ _id: req.params.id, publie: true });
      if (!quiz) return res.status(404).json({ error: 'Quiz introuvable' });
      const questionsPubliques = quiz.questions.map(q => ({ question: q.question, choix: q.choix }));
      res.json({ quiz: { _id: quiz._id, titre: quiz.titre, matiere: quiz.matiere, niveau: quiz.niveau, questions: questionsPubliques } });
    } catch (err) {
      res.status(500).json({ error: 'Erreur serveur' });
    }
  },

  // ── Soumission des réponses : calcule le score et renvoie la correction ─
  async submit(req, res) {
    try {
      const { reponses } = req.body; // tableau d'index, même ordre que quiz.questions
      const quiz = await Quiz.findOne({ _id: req.params.id, publie: true });
      if (!quiz) return res.status(404).json({ error: 'Quiz introuvable' });

      let score = 0;
      const correction = quiz.questions.map((q, i) => {
        const correct = reponses[i] === q.reponseCorrecte;
        if (correct) score++;
        return { reponseCorrecte: q.reponseCorrecte, explication: q.explication, correct };
      });

      // Pas de suivi de tentative pour un visiteur anonyme (essai gratuit) —
      // seuls les inscrits ont un historique dans "Mes quiz".
      if (req.user) {
        await QuizAttempt.create({ userId: req.user.id, quizId: quiz._id, reponses, score, total: quiz.questions.length });
      }
      res.json({ score, total: quiz.questions.length, correction });
    } catch (err) {
      res.status(500).json({ error: 'Erreur serveur' });
    }
  },

  // ── Admin : créer/publier un quiz (contenu généré par IA en amont) ──
  async create(req, res) {
    try {
      const { titre, matiere, niveau, questions } = req.body;
      const quiz = await Quiz.create({ titre, matiere, niveau, questions, publie: true, creePar: req.user.id });
      res.status(201).json({ success: true, quiz });
    } catch (err) {
      res.status(500).json({ error: 'Erreur serveur' });
    }
  },

  // ── Admin : liste de tous les quiz (publiés + brouillons) ───────────
  async adminList(req, res) {
    try {
      const quizzes = await Quiz.find().sort({ createdAt: -1 });
      res.json({ quizzes });
    } catch (err) {
      res.status(500).json({ error: 'Erreur serveur' });
    }
  },

  // ── Admin : détail complet d'un quiz (avec réponses, pour relecture) ─
  async adminGetById(req, res) {
    try {
      const quiz = await Quiz.findById(req.params.id);
      if (!quiz) return res.status(404).json({ error: 'Quiz introuvable' });
      res.json({ quiz });
    } catch (err) {
      res.status(500).json({ error: 'Erreur serveur' });
    }
  },

  // ── Admin : publier/dépublier un quiz après relecture ───────────────
  async togglePublish(req, res) {
    try {
      const { publie } = req.body;
      const quiz = await Quiz.findByIdAndUpdate(req.params.id, { publie: !!publie, creePar: req.user.id }, { new: true });
      if (!quiz) return res.status(404).json({ error: 'Quiz introuvable' });
      res.json({ success: true, quiz });
    } catch (err) {
      res.status(500).json({ error: 'Erreur serveur' });
    }
  },

  // ── Admin : supprimer un quiz ────────────────────────────────────────
  async remove(req, res) {
    try {
      const quiz = await Quiz.findByIdAndDelete(req.params.id);
      if (!quiz) return res.status(404).json({ error: 'Quiz introuvable' });
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: 'Erreur serveur' });
    }
  },
};

module.exports = quizController;
