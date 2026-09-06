const mongoose = require('mongoose');

// Avis laissé par un élève/parent après une session avec un répétiteur.
const ReviewSchema = new mongoose.Schema({
  reservationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Reservation', required: true },
  repetiteurId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  auteurId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  note:          { type: Number, min: 1, max: 5, required: true },
  commentaire:   { type: String, maxlength: 500 },
}, { timestamps: true });

module.exports = mongoose.model('Review', ReviewSchema);
