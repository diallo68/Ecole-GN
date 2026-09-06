const express = require('express');
const router = express.Router();
const classeVirtuelleController = require('../controllers/classeVirtuelle.controller');
const { auth, requireRole } = require('../middlewares/auth.middleware');

router.post('/', auth, requireRole('repetiteur'), classeVirtuelleController.create);
router.get('/mine', auth, requireRole('repetiteur'), classeVirtuelleController.mine);
router.get('/eleve/mine', auth, requireRole('eleve'), classeVirtuelleController.myAsEleve);

module.exports = router;
