const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quiz.controller');
const { auth, requireRole } = require('../middlewares/auth.middleware');

router.get('/', auth, quizController.list);
router.get('/:id', auth, quizController.getById);
router.post('/:id/submit', auth, quizController.submit);
router.post('/', auth, requireRole('admin'), quizController.create);

module.exports = router;
