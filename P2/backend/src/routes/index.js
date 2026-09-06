const express = require('express');
const router = express.Router();

router.use('/auth', require('./auth.routes'));
router.use('/repetiteurs', require('./repetiteur.routes'));
router.use('/reservations', require('./reservation.routes'));
router.use('/content', require('./content.routes'));
router.use('/classes-virtuelles', require('./classeVirtuelle.routes'));
router.use('/quiz', require('./quiz.routes'));
router.use('/messaging', require('./messaging.routes'));
router.use('/reviews', require('./review.routes'));

module.exports = router;
