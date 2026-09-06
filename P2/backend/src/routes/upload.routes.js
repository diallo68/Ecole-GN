const express = require('express');
const multer = require('multer');
const router = express.Router();
const uploadController = require('../controllers/upload.controller');
const { auth } = require('../middlewares/auth.middleware');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 Mo
});

router.post('/', auth, (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      const message = err.code === 'LIMIT_FILE_SIZE' ? 'Fichier trop volumineux (25 Mo max)' : 'Erreur de téléversement';
      return res.status(400).json({ error: message });
    }
    if (err) return res.status(400).json({ error: 'Erreur de téléversement' });
    next();
  });
}, uploadController.file);

module.exports = router;
