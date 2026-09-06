const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quiz.controller');
const { auth, requireRole } = require('../middlewares/auth.middleware');

// Public — la liste des titres alimente la page d'accueil (vitrine), y compris
// pour les visiteurs non connectés. Prendre le quiz (getById/submit) reste
// réservé aux inscrits.
router.get('/', quizController.list);
router.get('/mes-tentatives', auth, quizController.mesTentatives);
router.get('/admin/all', auth, requireRole('admin'), quizController.adminList);
router.get('/admin/:id', auth, requireRole('admin'), quizController.adminGetById);
router.patch('/admin/:id/publish', auth, requireRole('admin'), quizController.togglePublish);
router.delete('/admin/:id', auth, requireRole('admin'), quizController.remove);
router.get('/:id', auth, quizController.getById);
router.post('/:id/submit', auth, quizController.submit);
router.post('/', auth, requireRole('admin'), quizController.create);

module.exports = router;
