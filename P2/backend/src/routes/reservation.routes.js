const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservation.controller');
const { auth, requireRole } = require('../middlewares/auth.middleware');

router.post('/', auth, requireRole('eleve', 'parent'), reservationController.create);
router.get('/mine', auth, requireRole('eleve', 'parent'), reservationController.mine);
router.get('/agenda', auth, requireRole('repetiteur'), reservationController.myAgenda);
router.patch('/:id/statut', auth, reservationController.updateStatus);

module.exports = router;
