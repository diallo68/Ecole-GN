const express = require('express');
const router = express.Router();
const assistantController = require('../controllers/assistant.controller');

// Public — l'assistant d'accueil doit répondre même aux visiteurs non connectés.
router.post('/chat', assistantController.chat);

module.exports = router;
