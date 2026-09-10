const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // destinataire
  type:   { type: String, enum: ['message', 'reservation_confirmee', 'reservation_annulee', 'profil_valide'], required: true },
  texte:  { type: String, required: true },
  lien:   { type: String }, // route front à ouvrir au clic (ex: /dashboard/messages?c=...)
  lu:     { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Notification', NotificationSchema);
