const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { auth } = require('../middlewares/auth.middleware');
const { validate, schemas } = require('../utils/validators');

router.post('/send-code', validate(schemas.sendCode), authController.sendCode);
router.post('/register', validate(schemas.register), authController.register);
router.post('/login', validate(schemas.login), authController.login);
router.get('/me', auth, authController.me);
router.patch('/me', auth, validate(schemas.updateMe), authController.updateMe);

module.exports = router;
