const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.controller');
const { auth, requireRole } = require('../middlewares/auth.middleware');

router.post('/', auth, requireRole('eleve', 'parent'), reviewController.create);
router.get('/repetiteur/:repetiteurId', reviewController.byRepetiteur);

module.exports = router;
