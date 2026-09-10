const express = require('express');
const router = express.Router();
const messagingController = require('../controllers/messaging.controller');
const { auth } = require('../middlewares/auth.middleware');

router.get('/conversations', auth, messagingController.conversations);
router.get('/unread-count', auth, messagingController.unreadCount);
router.post('/conversations', auth, messagingController.startOrGet);
router.get('/conversations/:id/messages', auth, messagingController.messages);
router.post('/conversations/:id/messages', auth, messagingController.send);

module.exports = router;
