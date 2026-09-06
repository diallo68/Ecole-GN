const express = require('express');
const router = express.Router();
const soumissionController = require('../controllers/soumission.controller');
const { auth, requireRole } = require('../middlewares/auth.middleware');

router.post('/', auth, requireRole('eleve', 'parent'), soumissionController.create);
router.get('/mine', auth, requireRole('eleve', 'parent'), soumissionController.mine);
router.get('/exercice/:exerciceId', auth, requireRole('repetiteur'), soumissionController.byExercice);
router.patch('/:id/corriger', auth, requireRole('repetiteur'), soumissionController.corriger);

module.exports = router;
