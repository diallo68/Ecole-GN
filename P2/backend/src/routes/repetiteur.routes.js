const express = require('express');
const router = express.Router();
const repetiteurController = require('../controllers/repetiteur.controller');
const { auth, requireRole } = require('../middlewares/auth.middleware');
const { validate, schemas } = require('../utils/validators');

router.get('/', repetiteurController.list);
router.get('/:id', repetiteurController.getById);
router.patch('/me/profile', auth, requireRole('repetiteur'), validate(schemas.updateRepetiteurProfile), repetiteurController.updateMyProfile);
router.patch('/:id/moderate', auth, requireRole('admin'), repetiteurController.moderate);

module.exports = router;
