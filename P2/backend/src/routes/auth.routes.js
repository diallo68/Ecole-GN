const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { auth, requireRole } = require('../middlewares/auth.middleware');
const { validate, schemas } = require('../utils/validators');

router.post('/send-code', validate(schemas.sendCode), authController.sendCode);
router.post('/register', validate(schemas.register), authController.register);
router.post('/login', validate(schemas.login), authController.login);
router.get('/me', auth, authController.me);
router.patch('/me', auth, validate(schemas.updateMe), authController.updateMe);

// Enfants liés à un compte parent — nécessaire pour réserver une session
// (voir reservation.controller.js: un parent doit choisir un enfant lié).
router.get('/mes-enfants', auth, requireRole('parent'), authController.mesEnfants);
router.post('/mes-enfants', auth, requireRole('parent'), validate(schemas.ajouterEnfant), authController.ajouterEnfant);
router.delete('/mes-enfants/:childId', auth, requireRole('parent'), authController.retirerEnfant);

module.exports = router;
