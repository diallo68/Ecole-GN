const express = require('express');
const router = express.Router();
const repetiteurController = require('../controllers/repetiteur.controller');
const { auth, optionalAuth, requireRole } = require('../middlewares/auth.middleware');
const { validate, schemas } = require('../utils/validators');

router.get('/', repetiteurController.list);
router.get('/admin/all', auth, requireRole('admin'), repetiteurController.adminList);
// optionalAuth (pas auth) : la fiche reste publique, mais on doit savoir si
// le visiteur est le répétiteur lui-même ou un admin pour l'autoriser à
// prévisualiser un profil pas encore validé (voir getById).
router.get('/:id', optionalAuth, repetiteurController.getById);
router.patch('/me/profile', auth, requireRole('repetiteur'), validate(schemas.updateRepetiteurProfile), repetiteurController.updateMyProfile);
router.patch('/:id/moderate', auth, requireRole('admin'), repetiteurController.moderate);

module.exports = router;
