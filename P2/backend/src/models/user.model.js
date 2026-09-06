const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { NIVEAUX_VALUES } = require('../utils/niveaux');

// Un même schéma pour les 4 rôles (élève, parent, répétiteur, admin) — les
// champs spécifiques à un rôle restent vides pour les autres. Auth par
// email uniquement (pas de SMS sur ce projet) : "phone" reste un simple
// champ de contact optionnel, pas un identifiant de connexion.
const UserSchema = new mongoose.Schema({
  prenom:   { type: String, required: true, trim: true },
  nom:      { type: String, trim: true },
  phone:    { type: String },
  email:    { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true },
  city:     { type: String },
  role:     { type: String, enum: ['eleve', 'parent', 'repetiteur', 'admin'], default: 'eleve' },

  verified:     { type: Boolean, default: false },
  verifyCode:   { type: String },
  codeExpiry:   { type: Date },
  otpSendFailed:   { type: Boolean, default: false },
  otpSendError:    { type: String },
  otpSendFailedAt: { type: Date },

  // ── Champs élève ──────────────────────────────────────────
  eleve: {
    niveau: { type: String, enum: NIVEAUX_VALUES },
    classe: { type: String }, // ancien champ libre, conservé pour compat (ex: "6ème année")
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },

  // ── Champs répétiteur ─────────────────────────────────────
  repetiteur: {
    bio:          { type: String, maxlength: 1000 },
    avatar:       { type: String },
    matieres:     [{ type: String }], // ex: ['Mathématiques', 'Physique-Chimie']
    niveaux:      [{ type: String, enum: NIVEAUX_VALUES }],
    tarifHoraire: { type: Number }, // en GNF
    disponible:   { type: Boolean, default: true },
    valide:       { type: Boolean, default: false }, // modération admin avant mise en ligne
    avgRating:    { type: Number, default: 0 },
    ratingCount:  { type: Number, default: 0 },
  },

  pushToken: { type: String },
  refreshToken:       { type: String },
  refreshTokenExpiry: { type: Date },
}, { timestamps: true });

UserSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('User', UserSchema);
