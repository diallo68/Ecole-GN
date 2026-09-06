const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const config = require('../config');

let transporter = null;
function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: config.SMTP.HOST,
      port: config.SMTP.PORT,
      secure: config.SMTP.PORT === 465,
      auth: config.SMTP.USER ? { user: config.SMTP.USER, pass: config.SMTP.PASS } : undefined,
    });
  }
  return transporter;
}

// ── Envoi d'email transactionnel (code de vérification, notifications) ──
async function sendTransactionalEmail({ to, subject, text, html }) {
  if (!config.SMTP.HOST) throw new Error('SMTP non configuré (SMTP_HOST manquant)');
  await getTransporter().sendMail({ from: config.SMTP.FROM, to, subject, text, html });
}

// ── Tokens JWT (access + refresh) ───────────────────────────
async function generateTokens(user) {
  const accessToken = jwt.sign({ id: user._id, role: user.role }, config.JWT_SECRET, { expiresIn: '1d' });
  const rawRefresh = crypto.randomBytes(40).toString('hex');
  const hashedRefresh = crypto.createHash('sha256').update(rawRefresh).digest('hex');
  user.refreshToken = hashedRefresh;
  user.refreshTokenExpiry = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
  await user.save({ validateBeforeSave: false });
  return { accessToken, refreshToken: rawRefresh };
}

// ── Nettoyage basique de texte libre (anti-XSS simple) ──────
function sanitizeText(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/<[^>]*>/g, '').trim();
}

module.exports = { generateTokens, sanitizeText, sendTransactionalEmail };
