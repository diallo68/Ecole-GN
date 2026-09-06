const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { auth, requireRole } = require('../middlewares/auth.middleware');

router.get('/stats', auth, requireRole('admin'), adminController.stats);
router.get('/users', auth, requireRole('admin'), adminController.users);
router.get('/conversations', auth, requireRole('admin'), adminController.conversations);

module.exports = router;
