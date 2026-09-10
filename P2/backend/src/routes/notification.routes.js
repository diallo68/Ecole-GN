const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const { auth } = require('../middlewares/auth.middleware');

router.get('/', auth, notificationController.mine);
router.get('/unread-count', auth, notificationController.unreadCount);
router.patch('/:id/read', auth, notificationController.markRead);
router.patch('/read-all', auth, notificationController.markAllRead);

module.exports = router;
