const { isConfigured, uploadBuffer } = require('../utils/cloudinary');

// Upload générique (documents, images, vidéos) utilisé par les enseignants
// (contenu pédagogique) et les élèves (pièce jointe de devoir).
const uploadController = {
  async file(req, res) {
    if (!isConfigured()) {
      return res.status(503).json({ error: "Hébergement de fichiers indisponible : identifiants Cloudinary non configurés." });
    }
    if (!req.file) return res.status(400).json({ error: 'Aucun fichier reçu' });
    try {
      const result = await uploadBuffer(req.file.buffer, { folder: 'gandal' });
      res.json({ success: true, url: result.secure_url, type: result.resource_type, format: result.format });
    } catch (err) {
      res.status(500).json({ error: "Échec de l'envoi du fichier" });
    }
  },
};

module.exports = uploadController;
