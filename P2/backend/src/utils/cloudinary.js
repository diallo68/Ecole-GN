const cloudinary = require('cloudinary').v2;
const config = require('../config');

cloudinary.config({
  cloud_name: config.CLOUDINARY.CLOUD_NAME,
  api_key: config.CLOUDINARY.API_KEY,
  api_secret: config.CLOUDINARY.API_SECRET,
});

function isConfigured() {
  return !!(config.CLOUDINARY.CLOUD_NAME && config.CLOUDINARY.API_KEY && config.CLOUDINARY.API_SECRET);
}

// Envoie un buffer en mémoire vers Cloudinary (pas de fichier temporaire sur disque).
// resource_type: 'auto' laisse Cloudinary détecter image/vidéo/pdf.
function uploadBuffer(buffer, { folder = 'gandal', resourceType = 'auto' } = {}) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder, resource_type: resourceType }, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
    stream.end(buffer);
  });
}

module.exports = { cloudinary, isConfigured, uploadBuffer };
