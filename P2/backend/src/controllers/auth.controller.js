const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const AfricasTalking = require('africastalking');
const User = require('../models/user.model');
const config = require('../config');
const { generateTokens } = require('../utils/helpers');
const { createLogger } = require('../middlewares/logger');

const logAuth = createLogger('AUTH');

const at = AfricasTalking({ apiKey: config.AT_API_KEY || 'fake', username: config.AT_USERNAME || 'sandbox' });
const sms = at.SMS;

const authController = {
  // ── Envoi du code de vérification (inscription par téléphone) ──────────
  async sendCode(req, res) {
    try {
      const { phone, email, method, prenom } = req.body;
      logAuth.info('send-code demandé', { method, phone: phone?.slice(0, 6) + '***' });

      const code = crypto.randomInt(100000, 1000000).toString();
      const expiry = new Date(Date.now() + 15 * 60 * 1000);
      const hashedCode = await bcrypt.hash(code, 8);

      let existing = null;
      if (method === 'sms' && phone) existing = await User.findOne({ phone });
      if (method === 'email' && email) existing = await User.findOne({ email: email.toLowerCase() });

      let userDoc = null;
      if (existing) {
        existing.verifyCode = hashedCode;
        existing.codeExpiry = expiry;
        await existing.save();
        userDoc = existing;
      } else {
        const tempPassword = await bcrypt.hash(crypto.randomBytes(16).toString('hex'), 10);
        const tempUser = {
          prenom: prenom || '', verifyCode: hashedCode, codeExpiry: expiry,
          verifyMethod: method, password: tempPassword, verified: false,
        };
        if (method === 'sms') tempUser.phone = phone;
        else { tempUser.email = email.toLowerCase(); tempUser.phone = 'em_' + Date.now(); }
        try {
          userDoc = await User.create(tempUser);
        } catch (createErr) {
          if (createErr.code === 11000) {
            const dup = method === 'sms' ? await User.findOne({ phone }) : await User.findOne({ email: email.toLowerCase() });
            if (dup) { dup.verifyCode = hashedCode; dup.codeExpiry = expiry; await dup.save(); userDoc = dup; }
            else throw createErr;
          } else throw createErr;
        }
      }

      let smsSent = false, emailSent = false, sendError = null;
      try {
        if (method === 'sms' && phone) {
          if (!config.AT_API_KEY) throw new Error('AT_API_KEY non configurée');
          const formattedPhone = phone.startsWith('+') ? phone : `+${phone}`;
          const atResponse = await sms.send({ to: [formattedPhone], message: `Gandal : Votre code de vérification est ${code}. Ne le partagez pas.` });
          const recipient = atResponse?.SMSMessageData?.Recipients?.[0];
          if (recipient && recipient.status !== 'Success') throw new Error(`Échec livraison SMS : ${recipient.status}`);
          smsSent = true;
        } else if (method === 'email' && email) {
          // TODO: brancher un service d'envoi d'email transactionnel (ex: SendGrid)
          logAuth.warn('Envoi email non implémenté — code non envoyé', { email });
          throw new Error('Envoi par email pas encore disponible');
        }
      } catch (sendErr) {
        sendError = sendErr.message || 'Erreur inconnue';
        logAuth.error('Erreur envoi OTP', { method, error: sendErr.message });
      }

      if (userDoc) {
        userDoc.otpSendFailed = !(smsSent || emailSent);
        userDoc.otpSendError = sendError || undefined;
        userDoc.otpSendFailedAt = sendError ? new Date() : undefined;
        await userDoc.save({ validateBeforeSave: false });
      }

      const response = { success: true, method, smsSent, emailSent };
      if (!config.IS_PROD && process.env.ALLOW_DEBUG_OTP === 'true') response.debug_code = code;
      if (sendError && !smsSent && !emailSent) {
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
      const { prenom, nom, phone, email, password, city, code, method, role, niveau } = req.body;
      const query = method === 'sms' ? { phone } : { email: email.toLowerCase() };
      const user = await User.findOne(query);
      if (!user) return res.status(400).json({ error: "Veuillez d'abord demander un code" });
      if (user.verified) return res.status(400).json({ error: 'Ce compte est déjà vérifié' });

      const codeValid = user.verifyCode && await bcrypt.compare(code, user.verifyCode);
      if (!codeValid) return res.status(400).json({ error: 'Code de vérification incorrect' });
      if (user.codeExpiry < new Date()) return res.status(400).json({ error: 'Code expiré' });

      user.prenom = prenom;
      user.nom = nom || '';
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
        email: user.email, city: user.city, role: user.role, verified: user.verified,
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
      const { identifier, password } = req.body;
      const user = await User.findOne({ $or: [{ email: identifier.toLowerCase() }, { phone: identifier }] });
      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ error: 'Identifiants incorrects' });
      }
      const { accessToken, refreshToken } = await generateTokens(user);
      const safeUser = {
        _id: user._id, prenom: user.prenom, nom: user.nom, phone: user.phone,
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
};

module.exports = authController;
