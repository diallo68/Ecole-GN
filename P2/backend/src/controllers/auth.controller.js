const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const User = require('../models/user.model');
const config = require('../config');
const { generateTokens, sendTransactionalEmail } = require('../utils/helpers');
const { createLogger } = require('../middlewares/logger');

const logAuth = createLogger('AUTH');

const authController = {
  // ── Envoi du code de vérification par email ─────────────────────────
  async sendCode(req, res) {
    try {
      const { email, prenom } = req.body;
      logAuth.info('send-code demandé', { email: email.slice(0, 3) + '***' });

      const code = crypto.randomInt(100000, 1000000).toString();
      const expiry = new Date(Date.now() + 15 * 60 * 1000);
      const hashedCode = await bcrypt.hash(code, 8);

      const existing = await User.findOne({ email: email.toLowerCase() });
      let userDoc = existing;
      if (existing) {
        existing.verifyCode = hashedCode;
        existing.codeExpiry = expiry;
        await existing.save();
      } else {
        const tempPassword = await bcrypt.hash(crypto.randomBytes(16).toString('hex'), 10);
        userDoc = await User.create({
          prenom: prenom || '', email: email.toLowerCase(), verifyCode: hashedCode, codeExpiry: expiry,
          password: tempPassword, verified: false,
        });
      }

      let emailSent = false, sendError = null;
      try {
        await sendTransactionalEmail({
          to: email,
          subject: 'Votre code Gandal',
          text: `Bonjour ${prenom || ''}, votre code de vérification est : ${code}`,
          html: `<strong>Bonjour ${prenom || ''},</strong><br><p>Votre code de vérification Gandal est : <h2 style="color:#2563eb;">${code}</h2></p>`,
        });
        emailSent = true;
      } catch (sendErr) {
        sendError = sendErr.message || 'Erreur inconnue';
        logAuth.error('Erreur envoi email OTP', { error: sendErr.message });
      }

      userDoc.otpSendFailed = !emailSent;
      userDoc.otpSendError = sendError || undefined;
      userDoc.otpSendFailedAt = sendError ? new Date() : undefined;
      await userDoc.save({ validateBeforeSave: false });

      const response = { success: true, emailSent };
      if (!config.IS_PROD && process.env.ALLOW_DEBUG_OTP === 'true') response.debug_code = code;
      if (sendError && !emailSent) {
        response.sendFailed = true;
        response.sendErrorHint = config.IS_PROD ? "L'envoi du code a échoué. Réessayez." : sendError;
      }
      res.json(response);
    } catch (err) {
      logAuth.error('send-code erreur fatale', { error: err.message });
      res.status(500).json({ error: config.IS_PROD ? 'Erreur serveur' : err.message });
    }
  },

  // ── Finalise l'inscription après vérification du code ───────────────────
  async register(req, res) {
    try {
      const { prenom, nom, phone, photo, pieceIdentite, email, password, city, code, role, niveau } = req.body;
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) return res.status(400).json({ error: "Veuillez d'abord demander un code" });
      if (user.verified) return res.status(400).json({ error: 'Ce compte est déjà vérifié' });

      const codeValid = user.verifyCode && await bcrypt.compare(code, user.verifyCode);
      if (!codeValid) return res.status(400).json({ error: 'Code de vérification incorrect' });
      if (user.codeExpiry < new Date()) return res.status(400).json({ error: 'Code expiré' });

      user.prenom = prenom;
      user.nom = nom || '';
      user.phone = phone;
      user.photo = photo || undefined;
      user.pieceIdentite = pieceIdentite || undefined;
      user.password = password;
      user.city = city;
      user.role = role;
      user.verified = true;
      user.verifyCode = undefined;
      user.codeExpiry = undefined;
      if (role === 'eleve' && niveau) user.eleve = { ...user.eleve, niveau };
      if (role === 'repetiteur') user.repetiteur = { ...user.repetiteur, valide: false };

      await user.save();
      const { accessToken, refreshToken } = await generateTokens(user);
      const safeUser = {
        _id: user._id, prenom: user.prenom, nom: user.nom, phone: user.phone,
        photo: user.photo, email: user.email, city: user.city, role: user.role, verified: user.verified,
      };
      res.json({ success: true, token: accessToken, refreshToken, user: safeUser });
    } catch (err) {
      logAuth.error('Erreur inscription', { error: err.message });
      res.status(500).json({ error: "Erreur lors de l'inscription" });
    }
  },

  // ── Connexion ────────────────────────────────────────────────────────
  async login(req, res) {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ error: 'Identifiants incorrects' });
      }
      const { accessToken, refreshToken } = await generateTokens(user);
      const safeUser = {
        _id: user._id, prenom: user.prenom, nom: user.nom, phone: user.phone, photo: user.photo,
        email: user.email, city: user.city, role: user.role, verified: user.verified,
        repetiteur: user.role === 'repetiteur' ? user.repetiteur : undefined,
        eleve: user.role === 'eleve' ? user.eleve : undefined,
      };
      res.json({ success: true, token: accessToken, refreshToken, user: safeUser });
    } catch (err) {
      logAuth.error('Erreur login', { error: err.message });
      res.status(500).json({ error: 'Erreur serveur' });
    }
  },

  // ── Profil de l'utilisateur connecté ─────────────────────────────────
  async me(req, res) {
    const user = await User.findById(req.user.id).select('-password -verifyCode -codeExpiry -refreshToken');
    if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });
    res.json({ user });
  },

  // ── Complète le profil (photo, pièce d'identité) après inscription ──
  async updateMe(req, res) {
    const { photo, pieceIdentite } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });
    if (photo !== undefined) user.photo = photo || undefined;
    if (pieceIdentite !== undefined) user.pieceIdentite = pieceIdentite || undefined;
    await user.save();
    res.json({ success: true, user: user.toObject({ transform: (_, ret) => { delete ret.password; delete ret.verifyCode; delete ret.codeExpiry; delete ret.refreshToken; return ret; } }) });
  },
};

module.exports = authController;
