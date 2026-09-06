const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const config = require('../config');

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

module.exports = { generateTokens, sanitizeText };
