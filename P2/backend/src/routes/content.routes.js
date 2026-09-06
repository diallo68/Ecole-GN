const express = require('express');
const router = express.Router();
const contentController = require('../controllers/content.controller');
const { auth, requireRole } = require('../middlewares/auth.middleware');

// Monte les mêmes routes pour les 3 types de contenu pédagogique.
['video', 'support', 'exercice'].forEach(type => {
  const c = contentController(type);
  router.post(`/${type}s`, auth, requireRole('repetiteur'), c.create);
  router.get(`/${type}s/mine`, auth, requireRole('repetiteur'), c.mine);
  router.get(`/${type}s/repetiteur/:repetiteurId`, c.listByRepetiteur);
  router.delete(`/${type}s/:id`, auth, requireRole('repetiteur'), c.remove);
});

module.exports = router;
