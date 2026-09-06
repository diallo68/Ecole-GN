const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quiz.controller');
const { auth, optionalAuth, requireRole } = require('../middlewares/auth.middleware');

// Public — la liste des titres alimente la page d'accueil (vitrine), y compris
// pour les visiteurs non connectés. Prendre le quiz (getById/submit) reste
// réservé aux inscrits.
router.get('/', quizController.list);
router.get('/mes-tentatives', auth, quizController.mesTentatives);
router.get('/admin/all', auth, requireRole('admin'), quizController.adminList);
router.get('/admin/:id', auth, requireRole('admin'), quizController.adminGetById);
router.patch('/admin/:id/publish', auth, requireRole('admin'), quizController.togglePublish);
router.delete('/admin/:id', auth, requireRole('admin'), quizController.remove);
// optionalAuth : un visiteur non inscrit peut passer un quiz (essai gratuit,
// limité côté frontend à un seul essai) ; un inscrit voit sa tentative suivie.
router.get('/:id', optionalAuth, quizController.getById);
router.post('/:id/submit', optionalAuth, quizController.submit);
router.post('/', auth, requireRole('admin'), quizController.create);

module.exports = router;
